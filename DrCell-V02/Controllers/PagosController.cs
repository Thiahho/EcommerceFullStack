using DrCell_V02.Data;
using DrCell_V02.Data.Dtos;
using DrCell_V02.Data.Modelos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MercadoPago.Client.Common;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MercadoPago.Resource.Payment;
using MercadoPago.Resource.Preference;
using System.Text.Json;
using DrCell_V02.Services.Interface;

namespace DrCell_V02.Controllers
{
    [ApiController]
    [Route("Pagos")]
    public class PagosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PagosController> _logger;
        private readonly IStockService _stockService;

        public PagosController(ApplicationDbContext context, IConfiguration configuration, ILogger<PagosController> logger, IStockService stockService)
        {
            _stockService = stockService;
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public string GetAccessToken()
        {
            var token = _configuration.GetValue<string>("MercadoPago:AccessToken");
            return token ?? string.Empty;
        }

        public string GetPublicKey()
        {
            var publicKey = _configuration.GetValue<string>("MercadoPago:PublicKey");
            return publicKey ?? string.Empty;
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new
            {
                message = "PagosController funcionando correctamente!",
                timestamp = DateTime.Now,
                endpoints = new[] {
                    "GET /Pagos/test",
                    "GET /Pagos/mercadopago/public-key",
                    "POST /Pagos/crear-preferencia",
                    "POST /Pagos/procesar-pago"
                }
            });
        }

        [HttpGet("mercadopago/public-key")]
        public IActionResult GetMercadoPagoPublicKey()
        {
            try
            {
                var publicKey = GetPublicKey();
                if (string.IsNullOrEmpty(publicKey))
                {
                    return StatusCode(500, new { message = "Clave pública no configurada" });
                }

                return Ok(new { publicKey = publicKey });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener clave pública");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
        [HttpGet("mercadopago/access-token")]
        public IActionResult GetMercadoPagoAccessToken()
        {
            try
            {
                var token = GetAccessToken();
                if (string.IsNullOrEmpty(token))
                {
                    return StatusCode(500, new { message = "Clave pública no configurada" });
                }

                return Ok(new { token = token });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener clave pública");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("crear-preferencia")]
        public async Task<IActionResult> CrearPreferencia([FromBody] CrearPreferenciaDto preferenciaData)
        {
            try
            {
                _logger.LogInformation("=== INICIO CREAR PREFERENCIA ===");
                _logger.LogInformation("Datos recibidos: {data}", JsonSerializer.Serialize(preferenciaData));

                // Validar modelo
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("ModelState inválido");
                    return BadRequest(new { success = false, message = "Datos inválidos", errors = ModelState });
                }

                if (preferenciaData?.Items == null || !preferenciaData.Items.Any())
                {
                    return BadRequest(new { success = false, message = "No se proporcionaron items para el pago" });
                }

                // Generar sessionId único para esta transacción
                var sessionId = HttpContext.Session.Id ?? Guid.NewGuid().ToString();
                var reservasCreadas = new List<StockReserva>();

                // Verificar y reservar stock para cada item
                try
                {
                    // Comentar temporalmente la verificación de stock
                    
                    foreach (var item in preferenciaData.Items)
                    {
                        // Verificar stock disponible
                        if (!await _stockService.VerificarStockDisponibleAsync(item.VarianteId, item.Cantidad))
                        {
                            // Si no hay stock suficiente, liberar todas las reservas ya creadas
                            foreach (var reservaExistente in reservasCreadas)
                            {
                                await _stockService.LiberarReservaAsync(reservaExistente.Id, "Stock insuficiente");
                            }
                            return BadRequest(new { success = false, message = "Stock insuficiente para uno o más productos" });
                        }

                        // Reservar stock
                        var nuevaReserva = await _stockService.ReservarStockAsync(item.VarianteId, item.Cantidad, sessionId);
                        reservasCreadas.Add(nuevaReserva);
                    }
                    
                     _logger.LogInformation("Omitiendo verificación de stock para testing");
                }
                catch (Exception ex)
                {
                    // Si hay error, liberar todas las reservas creadas
                    foreach (var reserva in reservasCreadas)
                    {
                        await _stockService.LiberarReservaAsync(reserva.Id, "Error en proceso de reserva");
                    }
                    _logger.LogError(ex, "Error al reservar stock");
                    return BadRequest(new { success = false, message = "Error al procesar la reserva de stock" });
                }

                // Configurar MercadoPago
                var accessToken = GetAccessToken();
                if (string.IsNullOrEmpty(accessToken))
                {
                    // Liberar reservas si hay error de configuración
                    foreach (var reserva in reservasCreadas)
                    {
                        await _stockService.LiberarReservaAsync(reserva.Id, "Error de configuración MP");
                    }
                    _logger.LogError("AccessToken no configurado");
                    return StatusCode(500, new { success = false, message = "Error de configuración: AccessToken no configurado" });
                }

                _logger.LogInformation("AccessToken OK");
                MercadoPagoConfig.AccessToken = accessToken;

                var client = new PreferenceClient();

                var items = preferenciaData.Items.Select(item => new PreferenceItemRequest
                {
                    Id = item.ProductoId.ToString(),
                    Title = $"{item.Marca} {item.Modelo}",
                    Description = $"RAM: {item.Ram}, Almacenamiento: {item.Almacenamiento}, Color: {item.Color}",
                    CategoryId = "phones",
                    Quantity = item.Cantidad,
                    CurrencyId = "ARS",
                    UnitPrice = item.Precio
                }).ToList();

                _logger.LogInformation("Items creados: {count}", items.Count);

                // Generar external reference único
                var externalReference = Guid.NewGuid().ToString();

                var isDevelopment = _configuration.GetValue<bool>("Development") ||
                           Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
                PreferenceBackUrlsRequest? backUrls = null;
                string? autoReturn = null;

                if (!isDevelopment)
                {
                    // Solo configurar back URLs en producción
                    var baseUrl = $"{Request.Scheme}://{Request.Host}";
                    //var baseUrl = $"http://localhost://5000";
                    backUrls = new PreferenceBackUrlsRequest
                    {
                        Success = $"{baseUrl}/Pagos/Success",
                        Failure = $"{baseUrl}/Pagos/Failure",
                        Pending = $"{baseUrl}/Pagos/Pending"
                    };
                    autoReturn = "approved";
                }
                // Crear request CON BackUrls
                var request = new PreferenceRequest
                {
                    Items = items,
                    BackUrls = backUrls,
                    AutoReturn = autoReturn,
                    PaymentMethods = new PreferencePaymentMethodsRequest
                    {
                        DefaultPaymentMethodId = null,
                        ExcludedPaymentTypes = new List<PreferencePaymentTypeRequest>(),
                        ExcludedPaymentMethods = new List<PreferencePaymentMethodRequest>(),
                        DefaultInstallments = 1
                    },
                    StatementDescriptor = "DRCELL",
                    ExternalReference = externalReference,
                    Expires = true,
                    ExpirationDateFrom = DateTime.Now,
                    ExpirationDateTo = DateTime.Now.AddMinutes(10)
                };

                _logger.LogInformation("Request creado - External Reference: {ref}", request.ExternalReference);

                _logger.LogInformation("Llamando a MercadoPago API...");
                var preference = await client.CreateAsync(request);

                // Actualizar reservas con el PreferenceId
                foreach (var reserva in reservasCreadas)
                {
                    reserva.PreferenceId = preference.Id;
                    _context.StockReserva.Update(reserva);
                }
                await _context.SaveChangesAsync();

                _logger.LogInformation("SUCCESS! Preferencia creada: {id}", preference.Id);
                _logger.LogInformation("InitPoint: {init}", preference.InitPoint);
                _logger.LogInformation("SandboxInitPoint: {sandbox}", preference.SandboxInitPoint);

                return Ok(new
                {
                    success = true,
                    preferenceId = preference.Id,
                    initPoint = preference.InitPoint,
                    sandboxInitPoint = preference.SandboxInitPoint,
                    sessionId = sessionId,
                    externalReference = externalReference
                });
            }
            catch (Exception ex)
            {
                _logger.LogError("ERROR COMPLETO:");
                _logger.LogError("Mensaje: {message}", ex.Message);
                _logger.LogError("Inner: {inner}", ex.InnerException?.Message);
                _logger.LogError("Stack: {stack}", ex.StackTrace);

                return BadRequest(new
                {
                    success = false,
                    message = "Error al crear la preferencia de pago",
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("Success")]
        public async Task<IActionResult> Success([FromQuery] string? payment_id, [FromQuery] string? status, [FromQuery] string? external_reference, [FromQuery] string? preference_id)
        {
            try
            {
                _logger.LogInformation("Pago exitoso recibido - PaymentId: {paymentId}, Status: {status}, PreferenceId: {preferenceId}",
                    payment_id, status, preference_id);

                if (!string.IsNullOrEmpty(preference_id))
                {
                    // Confirmar las reservas de stock (descontar del stock real)
                    var reservasConfirmadas = await _stockService.ConfirmarReservaAsync(preference_id);

                    if (reservasConfirmadas)
                    {
                        // Crear registro de venta
                        await CrearRegistroVentaAsync(preference_id, payment_id);

                        _logger.LogInformation("Reservas confirmadas y venta registrada para PreferenceId: {preferenceId}", preference_id);

                        return Ok(new
                        {
                            status = "success",
                            message = "Pago procesado exitosamente",
                            paymentId = payment_id,
                            preferenceId = preference_id
                        });
                    }
                    else
                    {
                        _logger.LogWarning("No se encontraron reservas para confirmar - PreferenceId: {preferenceId}", preference_id);
                    }
                }

                return Ok(new
                {
                    status = "success",
                    message = "Pago procesado exitosamente",
                    paymentId = payment_id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar resultado del pago exitoso");
                return Ok(new
                {
                    status = "error",
                    message = "Error al procesar el resultado del pago",
                    error = ex.Message
                });
            }
        }

        [HttpGet("Failure")]
        public async Task<IActionResult> Failure([FromQuery] string? payment_id, [FromQuery] string? status, [FromQuery] string? external_reference, [FromQuery] string? preference_id)
        {
            try
            {
                _logger.LogWarning("Pago fallido recibido - PaymentId: {paymentId}, Status: {status}, PreferenceId: {preferenceId}",
                    payment_id, status, preference_id);

                if (!string.IsNullOrEmpty(preference_id))
                {
                    // Liberar las reservas de stock ya que el pago falló
                    var reservas = await _context.StockReserva
                        .Where(r => r.PreferenceId == preference_id && r.Estado == "PENDIENTE")
                        .ToListAsync();

                    foreach (var reserva in reservas)
                    {
                        await _stockService.LiberarReservaAsync(reserva.Id, "Pago rechazado");
                    }

                    _logger.LogInformation("Reservas liberadas por pago fallido - PreferenceId: {preferenceId}", preference_id);
                }

                return Ok(new
                {
                    status = "failure",
                    message = "El pago no pudo ser procesado",
                    error = "Pago rechazado por MercadoPago",
                    paymentId = payment_id,
                    preferenceId = preference_id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar fallo del pago");
                return Ok(new
                {
                    status = "error",
                    message = "Error al procesar el fallo del pago",
                    error = ex.Message
                });
            }
        }

        [HttpGet("Pending")]
        public async Task<IActionResult> Pending([FromQuery] string? payment_id, [FromQuery] string? status, [FromQuery] string? external_reference, [FromQuery] string? preference_id)
        {
            try
            {
                _logger.LogInformation("Pago pendiente recibido - PaymentId: {paymentId}, Status: {status}, PreferenceId: {preferenceId}",
                    payment_id, status, preference_id);

                // Para pagos pendientes, mantenemos las reservas activas
                // El StockCleanupJob se encargará de liberarlas si expiran

                return Ok(new
                {
                    status = "pending",
                    message = "El pago está pendiente de confirmación",
                    paymentId = payment_id,
                    preferenceId = preference_id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar pago pendiente");
                return Ok(new
                {
                    status = "error",
                    message = "Error al procesar el pago pendiente",
                    error = ex.Message
                });
            }
        }

        // Método auxiliar para crear el registro de venta
        private async Task CrearRegistroVentaAsync(string preferenceId, string? paymentId)
        {
            try
            {
                var reservas = await _context.StockReserva
                    .Include(r => r.Variante)
                    .Where(r => r.PreferenceId == preferenceId && r.Estado == "CONFIRMADO")
                    .ToListAsync();

                if (!reservas.Any()) return;

                var montoTotal = reservas.Sum(r => r.Variante.Precio * r.Cantidad);

                var venta = new Venta
                {
                    PreferenceId = preferenceId,
                    PaymentId = paymentId ?? "",
                    MontoTotal = montoTotal,
                    Estado = "APPROVED",
                    Items = reservas.Select(r => new VentaItem
                    {
                        VarianteId = r.VarianteId,
                        Cantidad = r.Cantidad,
                        PrecioUnitario = r.Variante.Precio,
                        Subtotal = r.Variante.Precio * r.Cantidad
                    }).ToList()
                };

                _context.Ventas.Add(venta);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Venta registrada exitosamente - PreferenceId: {preferenceId}, MontoTotal: {monto}",
                    preferenceId, montoTotal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear registro de venta");
                throw;
            }
        }

        [HttpPost("procesar-pago")]
        public async Task<IActionResult> ProcesarPago(EnviarPagoDto enviarPagoDto)
        {
            try
            {
                // Validar modelo
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = "Datos inválidos", errors = ModelState });
                }

                // Establecer valor por defecto para IdentificationType
                if (string.IsNullOrEmpty(enviarPagoDto.IdentificationType))
                {
                    enviarPagoDto.IdentificationType = "CC";
                }

                // Obtener el producto y variante desde la base de datos
                var producto = await _context.Productos
                    .Include(p => p.Variantes)
                    .FirstOrDefaultAsync(p => p.Id == enviarPagoDto.ProductoId);

                if (producto == null)
                {
                    return BadRequest(new { message = "Producto no encontrado" });
                }

                var variante = producto.Variantes
                    .FirstOrDefault(v => v.Id == enviarPagoDto.VarianteId);

                if (variante == null)
                {
                    return BadRequest(new { message = "Variante del producto no encontrada" });
                }

                // Validar stock disponible
                if (variante.Stock < enviarPagoDto.Cantidad)
                {
                    return BadRequest(new { message = "Stock insuficiente", stockDisponible = variante.Stock });
                }

                // Configurar MercadoPago
                var accessToken = GetAccessToken();
                if (string.IsNullOrEmpty(accessToken))
                {
                    return StatusCode(500, new { message = "Error de configuración: AccessToken no configurado" });
                }

                MercadoPagoConfig.AccessToken = accessToken;

                // Calcular precio total
                var precioTotal = variante.Precio * enviarPagoDto.Cantidad;

                // Crear la preferencia de pago
                var request = new PreferenceRequest
                {
                    Items = new List<PreferenceItemRequest>
                    {
                        new PreferenceItemRequest
                        {
                            Title = $"{producto.Marca} {producto.Modelo} - {variante.Color} ({variante.Ram}/{variante.Almacenamiento})",
                            Quantity = enviarPagoDto.Cantidad,
                            UnitPrice = variante.Precio,
                            CurrencyId = "ARS"
                        }
                    },

                    Payer = new PreferencePayerRequest
                    {
                        Name = enviarPagoDto.Name,
                        Surname = enviarPagoDto.Surname,
                        Email = enviarPagoDto.Email,
                        Phone = new PhoneRequest
                        {
                            AreaCode = enviarPagoDto.AreaCode,
                            Number = enviarPagoDto.PhoneNumber
                        },
                        Identification = new IdentificationRequest
                        {
                            Type = enviarPagoDto.IdentificationType,
                            Number = enviarPagoDto.IdentificationNumber
                        }
                    },

                    BackUrls = new PreferenceBackUrlsRequest
                    {
                        Success = $"{Request.Scheme}://{Request.Host}/Pagos/Success",
                        Failure = $"{Request.Scheme}://{Request.Host}/Pagos/Failure",
                        Pending = $"{Request.Scheme}://{Request.Host}/Pagos/Pending"
                    },
                    AutoReturn = "approved",

                    PaymentMethods = new PreferencePaymentMethodsRequest
                    {
                        ExcludedPaymentMethods = new List<PreferencePaymentMethodRequest>(),
                        ExcludedPaymentTypes = new List<PreferencePaymentTypeRequest>(),
                        Installments = 12
                    },

                    StatementDescriptor = "DrCell - Tienda de Celulares",
                    ExternalReference = $"ORDEN-{producto.Id}-{variante.Id}-{DateTimeOffset.Now.ToUnixTimeSeconds()}",

                    Expires = true,
                    ExpirationDateFrom = DateTime.Now,
                    ExpirationDateTo = DateTime.Now.AddMinutes(30),

                    Metadata = new Dictionary<string, object>
                    {
                        { "producto_id", producto.Id },
                        { "variante_id", variante.Id },
                        { "cantidad", enviarPagoDto.Cantidad },
                        { "precio_unitario", variante.Precio },
                        { "precio_total", precioTotal }
                    }
                };

                // Crear la preferencia
                var client = new PreferenceClient();
                Preference preference = await client.CreateAsync(request);

                // Guardar información del pedido en sesión
                var pedidoInfo = new
                {
                    ProductoId = producto.Id,
                    VarianteId = variante.Id,
                    Cantidad = enviarPagoDto.Cantidad,
                    PrecioUnitario = variante.Precio,
                    PrecioTotal = precioTotal,
                    PreferenceId = preference.Id,
                    FechaCreacion = DateTime.Now
                };

                HttpContext.Session.SetString("PedidoInfo", JsonSerializer.Serialize(pedidoInfo));

                return Ok(new
                {
                    success = true,
                    preferenceId = preference.Id,
                    initPoint = preference.InitPoint,
                    sandboxInitPoint = preference.SandboxInitPoint,
                    publicKey = GetPublicKey(),
                    pedido = new
                    {
                        producto = $"{producto.Marca} {producto.Modelo}",
                        variante = $"{variante.Color} - {variante.Ram}/{variante.Almacenamiento}",
                        cantidad = enviarPagoDto.Cantidad,
                        precioUnitario = variante.Precio,
                        precioTotal = precioTotal
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar pago");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("webhooks/mercadopago")]
        public async Task<IActionResult> WebhookMercadoPago([FromBody] object notification)
        {
            try
            {
                _logger.LogInformation("Webhook recibido de MercadoPago: {notification}", JsonSerializer.Serialize(notification));

                // Parsear la notificación
                var notificationJson = JsonSerializer.Serialize(notification);
                var notificationData = JsonSerializer.Deserialize<MercadoPagoNotification>(notificationJson);

                if (notificationData?.Data?.Id == null)
                {
                    _logger.LogWarning("Notificación inválida recibida");
                    return BadRequest("Notificación inválida");
                }

                // Configurar MercadoPago
                var accessToken = GetAccessToken();
                MercadoPagoConfig.AccessToken = accessToken;

                // Obtener información del pago
                var paymentClient = new PaymentClient();
                var payment = await paymentClient.GetAsync(long.Parse(notificationData.Data.Id));

                if (payment?.ExternalReference == null)
                {
                    _logger.LogWarning("Payment sin ExternalReference: {paymentId}", notificationData.Data.Id);
                    return Ok();
                }

                // Buscar la preferencia asociada
                var preferenceId = await ObtenerPreferenceIdPorExternalReference(payment.ExternalReference);

                if (string.IsNullOrEmpty(preferenceId))
                {
                    _logger.LogWarning("No se encontró PreferenceId para ExternalReference: {externalRef}", payment.ExternalReference);
                    return Ok();
                }

                // Procesar según el estado del pago
                switch (payment.Status)
                {
                    case "approved":
                        await _stockService.ConfirmarReservaAsync(preferenceId);
                        await CrearRegistroVentaAsync(preferenceId, payment.Id.ToString());
                        _logger.LogInformation("Pago aprobado procesado - PaymentId: {paymentId}, PreferenceId: {preferenceId}",
                            payment.Id, preferenceId);
                        break;

                    case "rejected":
                    case "cancelled":
                        await LiberarReservasPorPreferenceId(preferenceId, $"Pago {payment.Status}");
                        _logger.LogInformation("Pago {status} procesado - PaymentId: {paymentId}, PreferenceId: {preferenceId}",
                            payment.Status, payment.Id, preferenceId);
                        break;

                    case "pending":
                    case "in_process":
                        // No hacer nada, mantener las reservas activas
                        _logger.LogInformation("Pago {status} - manteniendo reservas activas - PaymentId: {paymentId}, PreferenceId: {preferenceId}",
                            payment.Status, payment.Id, preferenceId);
                        break;
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error procesando webhook de MercadoPago");
                return StatusCode(500);
            }
        }

        // Métodos auxiliares para el webhook
        private async Task<string?> ObtenerPreferenceIdPorExternalReference(string externalReference)
        {
            // Buscar en reservas activas por external reference
            // Esto asume que guardas el external reference en algún lugar
            // O puedes buscar por las fechas/timing

            var reserva = await _context.StockReserva
                .Where(r => r.FechaCreacion >= DateTime.UtcNow.AddHours(-2)) // Buscar en las últimas 2 horas
                .OrderByDescending(r => r.FechaCreacion)
                .FirstOrDefaultAsync();

            return reserva?.PreferenceId;
        }

        private async Task LiberarReservasPorPreferenceId(string preferenceId, string motivo)
        {
            var reservas = await _context.StockReserva
                .Where(r => r.PreferenceId == preferenceId && r.Estado == "PENDIENTE")
                .ToListAsync();

            foreach (var reserva in reservas)
            {
                await _stockService.LiberarReservaAsync(reserva.Id, motivo);
            }
        }

        // Clase para deserializar la notificación de MercadoPago
        public class MercadoPagoNotification
        {
            public string? Action { get; set; }
            public string? ApiVersion { get; set; }
            public MercadoPagoNotificationData? Data { get; set; }
            public DateTime DateCreated { get; set; }
            public string? Id { get; set; }
            public bool LiveMode { get; set; }
            public string? Type { get; set; }
            public string? UserId { get; set; }
        }

        public class MercadoPagoNotificationData
        {
            public string? Id { get; set; }
        }

        [HttpPost("verificar-stock")]
        public async Task<IActionResult> VerificarStock([FromBody] VerificarStockDto verificarStockDto)
        {
            try
            {
                if (verificarStockDto?.Items == null || !verificarStockDto.Items.Any())
                {
                    return BadRequest(new { disponible = false, mensaje = "No se proporcionaron items para verificar" });
                }

                foreach (var item in verificarStockDto.Items)
                {
                    var disponible = await _stockService.VerificarStockDisponibleAsync(item.VarianteId, item.Cantidad);
                    if (!disponible)
                    {
                        return Ok(new
                        {
                            disponible = false,
                            mensaje = $"Stock insuficiente para el producto con variante ID {item.VarianteId}"
                        });
                    }
                }

                return Ok(new { disponible = true, mensaje = "Stock disponible para todos los productos" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar stock");
                return StatusCode(500, new { disponible = false, mensaje = "Error al verificar stock" });
            }
        }

        [HttpPost("liberar-reservas-sesion")]
        public async Task<IActionResult> LiberarReservasSesion([FromBody] LiberarReservasDto liberarReservasDto)
        {
            try
            {
                if (string.IsNullOrEmpty(liberarReservasDto?.SessionId))
                {
                    return BadRequest(new { success = false, mensaje = "SessionId requerido" });
                }

                var resultado = await _stockService.LiberarReservasPorSessionAsync(liberarReservasDto.SessionId);

                return Ok(new
                {
                    success = resultado,
                    mensaje = resultado ? "Reservas liberadas exitosamente" : "No se encontraron reservas para liberar"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al liberar reservas de sesión");
                return StatusCode(500, new { success = false, mensaje = "Error al liberar reservas" });
            }
        }

        [HttpGet("reservas-activas")]
        public async Task<IActionResult> ObtenerReservasActivas()
        {
            try
            {
                var reservas = await _stockService.ObtenerReservasActivasAsync();

                var reservasDto = reservas.Select(r => new
                {
                    r.Id,
                    r.VarianteId,
                    r.Cantidad,
                    r.SessionId,
                    r.PreferenceId,
                    r.FechaCreacion,
                    r.FechaExpiracion,
                    r.Estado,
                    TiempoRestante = r.FechaExpiracion.Subtract(DateTime.UtcNow).TotalMinutes
                });

                return Ok(new { success = true, reservas = reservasDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reservas activas");
                return StatusCode(500, new { success = false, mensaje = "Error al obtener reservas" });
            }
        }

        // DTOs para los nuevos endpoints
        public class VerificarStockDto
        {
            public List<VerificarStockItemDto> Items { get; set; } = new List<VerificarStockItemDto>();
        }

        public class VerificarStockItemDto
        {
            public int VarianteId { get; set; }

            public int Cantidad { get; set; }
        }

        public class LiberarReservasDto
        {
            public string SessionId { get; set; } = string.Empty;
        }

[HttpGet("debug/test-stock")]
public async Task<IActionResult> TestStock()
{
    try
    {
        // Verificar si el servicio está disponible
        if (_stockService == null)
        {
            return Ok(new { error = "StockService no está registrado" });
        }

        // Verificar si las tablas existen
        var tablaProductosVariantes = await _context.ProductosVariantes.CountAsync();
        var tablaStockReserva = await _context.StockReserva.CountAsync();

        // Obtener una variante de muestra
        var variante = await _context.ProductosVariantes.FirstOrDefaultAsync();
        
        if (variante == null)
        {
            return Ok(new { 
                error = "No hay variantes en la base de datos",
                tablaProductosVariantes = tablaProductosVariantes,
                tablaStockReserva = tablaStockReserva
            });
        }

        // Probar verificación de stock
        var stockDisponible = await _stockService.VerificarStockDisponibleAsync(variante.Id, 1);

        return Ok(new { 
            success = true,
            stockServiceDisponible = _stockService != null,
            tablaProductosVariantes = tablaProductosVariantes,
            tablaStockReserva = tablaStockReserva,
            variantePrueba = new {
                variante.Id,
                variante.Stock,
                variante.StockReservado
            },
            stockDisponibleParaUnaUnidad = stockDisponible
        });
    }
    catch (Exception ex)
    {
        return Ok(new { 
            error = ex.Message,
            innerException = ex.InnerException?.Message,
            stackTrace = ex.StackTrace?.Substring(0, Math.Min(500, ex.StackTrace.Length))
        });
    }
}
    }
    
    
}