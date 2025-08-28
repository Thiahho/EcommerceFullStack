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
                    _logger.LogInformation("=== VERIFICANDO STOCK PARA {count} ITEMS ===", preferenciaData.Items.Count);
                    
                    foreach (var item in preferenciaData.Items)
                    {
                        _logger.LogInformation("Verificando item - VarianteId: {varianteId}, Cantidad: {cantidad}", item.VarianteId, item.Cantidad);
                        
                        // Obtener información detallada de la variante antes de verificar
                        var varianteInfo = await _context.ProductosVariantes
                            .FirstOrDefaultAsync(v => v.Id == item.VarianteId);
                            
                        if (varianteInfo == null)
                        {
                            _logger.LogError("Variante no encontrada: {varianteId}", item.VarianteId);
                            return BadRequest(new { success = false, message = $"Variante {item.VarianteId} no encontrada" });
                        }
                        
                        _logger.LogInformation("Variante encontrada - Stock: {stock}, StockReservado: {stockReservado}, StockDisponible: {stockDisponible}", 
                            varianteInfo.Stock, varianteInfo.StockReservado, varianteInfo.StockDisponible);
                        
                        // Verificar stock disponible
                        var stockDisponible = await _stockService.VerificarStockDisponibleAsync(item.VarianteId, item.Cantidad);
                        _logger.LogInformation("Resultado verificación: {resultado}", stockDisponible);
                        
                        if (!stockDisponible)
                        {
                            _logger.LogWarning("Stock insuficiente para VarianteId: {varianteId}, Solicitado: {cantidad}, Disponible: {disponible}", 
                                item.VarianteId, item.Cantidad, varianteInfo.StockDisponible);
                            
                            // Si no hay stock suficiente, liberar todas las reservas ya creadas
                            foreach (var reservaExistente in reservasCreadas)
                            {
                                await _stockService.LiberarReservaAsync(reservaExistente.Id, "Stock insuficiente");
                            }
                            return BadRequest(new { success = false, message = $"Stock insuficiente para variante {item.VarianteId}. Disponible: {varianteInfo.StockDisponible}, Solicitado: {item.Cantidad}" });
                        }

                        _logger.LogInformation("Stock OK, procediendo a reservar...");
                        
                        // Reservar stock
                        var nuevaReserva = await _stockService.ReservarStockAsync(item.VarianteId, item.Cantidad, sessionId);
                        reservasCreadas.Add(nuevaReserva);
                        
                        _logger.LogInformation("Reserva creada exitosamente - ReservaId: {reservaId}", nuevaReserva.Id);
                    }
                    
                    _logger.LogInformation("✅ Todas las verificaciones de stock exitosas");
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
                    Quantity = item.Cantidad,
                    CurrencyId = "ARS",
                    UnitPrice = item.Precio
                }).ToList();

                _logger.LogInformation("Items creados: {count}", items.Count);

                // Generar external reference único
                var externalReference = Guid.NewGuid().ToString();

                var isDevelopment = _configuration.GetValue<bool>("Development") ||
                           Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
                
                // Configurar back URLs desde variables de entorno
                var ngrokUrl = _configuration.GetValue<string>("ngrok:BaseUrl");
                var productionUrl = _configuration.GetValue<string>("PRODUCTION_BASE_URL");
                
                var baseUrl = isDevelopment 
                    ? ngrokUrl ?? "http://localhost:5000" 
                    : productionUrl ?? $"{Request.Scheme}://{Request.Host}";
                
                _logger.LogInformation("🔧 isDevelopment: {isDevelopment}, baseUrl: {baseUrl}", isDevelopment, baseUrl);
                
                // Verificar que el baseUrl no esté vacío
                if (string.IsNullOrEmpty(baseUrl))
                {
                    baseUrl = "http://localhost:5000"; // Fallback
                    _logger.LogWarning("⚠️ BaseUrl estaba vacío, usando fallback: {baseUrl}", baseUrl);
                }
                
                var backUrls = new PreferenceBackUrlsRequest
                {
                    Success = $"{baseUrl}/Pagos/Success",
                    Failure = $"{baseUrl}/Pagos/Failure", 
                    Pending = $"{baseUrl}/Pagos/Pending"
                };
                
                // Validar que las URLs estén correctamente formateadas
                if (!Uri.IsWellFormedUriString(backUrls.Success, UriKind.Absolute))
                {
                    _logger.LogError("❌ URL Success mal formateada: {url}", backUrls.Success);
                }
                if (!Uri.IsWellFormedUriString(backUrls.Failure, UriKind.Absolute))
                {
                    _logger.LogError("❌ URL Failure mal formateada: {url}", backUrls.Failure);
                }
                if (!Uri.IsWellFormedUriString(backUrls.Pending, UriKind.Absolute))
                {
                    _logger.LogError("❌ URL Pending mal formateada: {url}", backUrls.Pending);
                }
                
                _logger.LogInformation("🔗 BackUrls configuradas - Success: {success}, Failure: {failure}, Pending: {pending}", 
                    backUrls.Success, backUrls.Failure, backUrls.Pending);
                _logger.LogInformation("🔔 NotificationUrl configurada: {notificationUrl}", $"{baseUrl}/Pagos/webhooks/mercadopago");
                
                // Crear request CON BackUrls Y NotificationUrl para webhooks automáticos
                var request = new PreferenceRequest
                {
                    Items = items,
                    BackUrls = backUrls,
                    NotificationUrl = $"{baseUrl}/Pagos/webhooks/mercadopago", // 🔔 WEBHOOK AUTOMÁTICO
                    // AutoReturn = "all", // Comentado - MercadoPago tiene problemas con AutoReturn y BackUrls juntos
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
                _logger.LogInformation("Request completo: {request}", JsonSerializer.Serialize(request, new JsonSerializerOptions { WriteIndented = true }));
                
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
                _logger.LogError("Tipo de excepción: {type}", ex.GetType().Name);
                _logger.LogError("Mensaje: {message}", ex.Message);
                _logger.LogError("Inner: {inner}", ex.InnerException?.Message);
                _logger.LogError("Stack: {stack}", ex.StackTrace);
                
                // Si es un error de MercadoPago, logear más detalles
                if (ex.GetType().Name.Contains("MercadoPago"))
                {
                    _logger.LogError("Error específico de MercadoPago: {ex}", ex.ToString());
                }

                return BadRequest(new
                {
                    success = false,
                    message = "Error al crear la preferencia de pago",
                    error = ex.Message,
                    details = ex.InnerException?.Message,
                    type = ex.GetType().Name
                });
            }
        }

        [HttpGet("Success")]
        public async Task<IActionResult> Success([FromQuery] string? payment_id, [FromQuery] string? status, [FromQuery] string? external_reference, [FromQuery] string? preference_id)
        {
            try
            {
                _logger.LogInformation("🎉 =========================== PAGO EXITOSO RECIBIDO ===========================");
                _logger.LogInformation("PaymentId: {paymentId}", payment_id);
                _logger.LogInformation("Status: {status}", status);
                _logger.LogInformation("ExternalReference: {externalReference}", external_reference);
                _logger.LogInformation("PreferenceId: {preferenceId}", preference_id);
                
                // Log all query parameters for debugging
                _logger.LogInformation("🔍 ALL Query Parameters:");
                foreach (var param in Request.Query)
                {
                    _logger.LogInformation("  {key}: {value}", param.Key, param.Value);
                }
                
                _logger.LogInformation("==================================================================================");

                // Validar que tenemos la información mínima necesaria
                if (string.IsNullOrEmpty(payment_id) && string.IsNullOrEmpty(preference_id))
                {
                    _logger.LogError("❌ ERROR: No se recibió payment_id ni preference_id. Redirigiendo con error.");
                    var errorFrontendUrl = _configuration.GetValue<string>("Frontend:BaseUrl") ?? "http://localhost:3000";
                    return Redirect($"{errorFrontendUrl}/tienda?pago=error");
                }

                if (!string.IsNullOrEmpty(preference_id))
                {
                    _logger.LogInformation("✅ Iniciando confirmación de reservas para PreferenceId: {preferenceId}", preference_id);
                    
                    // Confirmar las reservas de stock (descontar del stock real)
                    var reservasConfirmadas = await _stockService.ConfirmarReservaAsync(preference_id);

                    if (reservasConfirmadas)
                    {
                        _logger.LogInformation("✅ Reservas confirmadas exitosamente - creando registro de venta...");
                        
                        try
                        {
                            // Crear registro de venta
                            await CrearRegistroVentaAsync(preference_id, payment_id);
                            _logger.LogInformation("✅ PROCESO COMPLETADO: Reservas confirmadas y venta registrada para PreferenceId: {preferenceId}", preference_id);
                        }
                        catch (Exception ventaEx)
                        {
                            _logger.LogError(ventaEx, "❌ ERROR ESPECÍFICO al crear registro de venta - PreferenceId: {preferenceId}", preference_id);
                            // No hacer throw aquí porque las reservas ya están confirmadas
                            // Continuar con la redirección pero loguear el error
                        }
                    }
                    else
                    {
                        _logger.LogWarning("⚠️ No se encontraron reservas para confirmar - PreferenceId: {preferenceId}", preference_id);
                    }
                }
                else
                {
                    _logger.LogWarning("⚠️ No se recibió PreferenceId - no se puede procesar el stock");
                }

                // Determinar URL de frontend dinámicamente
                var frontendUrl = _configuration.GetValue<string>("Frontend:BaseUrl") ?? "http://localhost:3000";
                var redirectUrl = $"{frontendUrl}/tienda?pago=exitoso&payment_id={payment_id}";
                _logger.LogInformation("🔀 Redirigiendo a: {url}", redirectUrl);
                return Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ERROR CRÍTICO al procesar resultado del pago exitoso");
                _logger.LogError("❌ Stack trace: {stackTrace}", ex.StackTrace);
                // En caso de error, también redirigir al frontend pero con parámetro de error
                var frontendUrl = _configuration.GetValue<string>("Frontend:BaseUrl") ?? "http://localhost:3000";
                return Redirect($"{frontendUrl}/tienda?pago=error");
            }
        }

        [HttpGet("Failure")]
        public async Task<IActionResult> Failure([FromQuery] string? payment_id, [FromQuery] string? status, [FromQuery] string? external_reference, [FromQuery] string? preference_id)
        {
            try
            {
                _logger.LogWarning("❌ =========================== PAGO FALLIDO RECIBIDO ===========================");
                _logger.LogWarning("PaymentId: {paymentId}", payment_id);
                _logger.LogWarning("Status: {status}", status);
                _logger.LogWarning("ExternalReference: {externalReference}", external_reference);
                _logger.LogWarning("PreferenceId: {preferenceId}", preference_id);
                
                // Log all query parameters for debugging
                _logger.LogWarning("🔍 ALL Query Parameters:");
                foreach (var param in Request.Query)
                {
                    _logger.LogWarning("  {key}: {value}", param.Key, param.Value);
                }
                _logger.LogWarning("==================================================================================");

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

                // Redirigir al frontend con parámetros de fallo
                var frontendUrl = _configuration.GetValue<string>("Frontend:BaseUrl") ?? "http://localhost:3000";
                var redirectUrl = $"{frontendUrl}/tienda?pago=fallido&payment_id={payment_id}";
                return Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar fallo del pago");
                // En caso de error, redirigir al frontend con parámetro de error
                var frontendUrl = _configuration.GetValue<string>("Frontend:BaseUrl") ?? "http://localhost:3000";
                return Redirect($"{frontendUrl}/tienda?pago=error");
            }
        }

        [HttpGet("Pending")]
        public async Task<IActionResult> Pending([FromQuery] string? payment_id, [FromQuery] string? status, [FromQuery] string? external_reference, [FromQuery] string? preference_id)
        {
            try
            {
                _logger.LogInformation("⏳ =========================== PAGO PENDIENTE RECIBIDO ===========================");
                _logger.LogInformation("PaymentId: {paymentId}", payment_id);
                _logger.LogInformation("Status: {status}", status);
                _logger.LogInformation("ExternalReference: {externalReference}", external_reference);
                _logger.LogInformation("PreferenceId: {preferenceId}", preference_id);
                
                // Log all query parameters for debugging
                _logger.LogInformation("🔍 ALL Query Parameters:");
                foreach (var param in Request.Query)
                {
                    _logger.LogInformation("  {key}: {value}", param.Key, param.Value);
                }
                _logger.LogInformation("==================================================================================");

                // Para pagos pendientes, mantenemos las reservas activas
                // El StockCleanupJob se encargará de liberarlas si expiran

                // Redirigir al frontend con parámetros de pendiente
                var frontendUrl = _configuration.GetValue<string>("Frontend:BaseUrl") ?? "http://localhost:3000";
                var redirectUrl = $"{frontendUrl}/tienda?pago=pendiente&payment_id={payment_id}";
                return Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar pago pendiente");
                // En caso de error, redirigir al frontend con parámetro de error
                var frontendUrl = _configuration.GetValue<string>("Frontend:BaseUrl") ?? "http://localhost:3000";
                return Redirect($"{frontendUrl}/tienda?pago=error");
            }
        }

        // Método auxiliar para crear el registro de venta
        private async Task CrearRegistroVentaAsync(string preferenceId, string? paymentId)
        {
            try
            {
                _logger.LogInformation("🔄 =========================== CREANDO REGISTRO DE VENTA ===========================");
                _logger.LogInformation("📝 PreferenceId: {preferenceId}, PaymentId: {paymentId}", preferenceId, paymentId);

                // Paso 1: Buscar reservas confirmadas
                _logger.LogInformation("🔍 PASO 1: Buscando reservas CONFIRMADAS...");
                var reservas = await _context.StockReserva
                    .Include(r => r.Variante)
                    .Where(r => r.PreferenceId == preferenceId && r.Estado == "CONFIRMADO")
                    .ToListAsync();

                _logger.LogInformation("📊 Reservas encontradas: {count}", reservas.Count);

                if (!reservas.Any()) 
                {
                    _logger.LogWarning("⚠️ No se encontraron reservas CONFIRMADAS para PreferenceId: {preferenceId}", preferenceId);
                    
                    // Debug: Verificar si hay reservas con otros estados
                    var todasReservas = await _context.StockReserva
                        .Where(r => r.PreferenceId == preferenceId)
                        .ToListAsync();
                    _logger.LogInformation("🔍 DEBUG: Total reservas para este PreferenceId: {count}", todasReservas.Count);
                    foreach (var res in todasReservas)
                    {
                        _logger.LogInformation("🔍 DEBUG: Reserva ID {id}, Estado: {estado}", res.Id, res.Estado);
                    }
                    return;
                }

                // Paso 2: Calcular monto total
                _logger.LogInformation("💰 PASO 2: Calculando monto total...");
                var montoTotal = reservas.Sum(r => r.Variante.Precio * r.Cantidad);
                _logger.LogInformation("💰 Monto total calculado: {montoTotal}", montoTotal);

                // Paso 3: Verificar si ya existe una venta para este PreferenceId
                _logger.LogInformation("🔍 PASO 3: Verificando si ya existe una venta...");
                var ventaExistente = await _context.Ventas
                    .FirstOrDefaultAsync(v => v.PreferenceId == preferenceId);
                
                if (ventaExistente != null)
                {
                    _logger.LogWarning("⚠️ Ya existe una venta para PreferenceId: {preferenceId}, VentaId: {ventaId}", 
                        preferenceId, ventaExistente.Id);
                    return;
                }

                // Paso 4: Crear la venta
                _logger.LogInformation("📝 PASO 4: Creando registro de venta...");
                var venta = new Venta
                {
                    PreferenceId = preferenceId,
                    PaymentId = paymentId ?? "",
                    MontoTotal = montoTotal,
                    Estado = "APPROVED",
                    FechaVenta = DateTime.UtcNow
                };

                _logger.LogInformation("📝 Venta creada en memoria: PreferenceId={preferenceId}, MontoTotal={monto}", 
                    venta.PreferenceId, venta.MontoTotal);

                _context.Ventas.Add(venta);
                _logger.LogInformation("📝 Venta agregada al contexto, guardando...");
                
                var filasAfectadas1 = await _context.SaveChangesAsync();
                _logger.LogInformation("✅ SaveChanges() completado - Filas afectadas: {filas}, VentaId generado: {ventaId}", 
                    filasAfectadas1, venta.Id);

                // Paso 5: Crear los items de la venta
                _logger.LogInformation("📝 PASO 5: Creando items de venta...");
                var ventaItems = reservas.Select(r => new VentaItem
                {
                    VentaId = venta.Id,
                    VarianteId = r.VarianteId,
                    Cantidad = r.Cantidad,
                    PrecioUnitario = r.Variante.Precio,
                    Subtotal = r.Variante.Precio * r.Cantidad
                }).ToList();

                _logger.LogInformation("📝 Items creados: {count}", ventaItems.Count);
                foreach (var item in ventaItems)
                {
                    _logger.LogInformation("📝 Item: VentaId={ventaId}, VarianteId={varianteId}, Cantidad={cantidad}, Precio={precio}", 
                        item.VentaId, item.VarianteId, item.Cantidad, item.PrecioUnitario);
                }

                _context.VentaItems.AddRange(ventaItems);
                _logger.LogInformation("📝 Items agregados al contexto, guardando...");
                
                var filasAfectadas2 = await _context.SaveChangesAsync();
                _logger.LogInformation("✅ Items guardados - Filas afectadas: {filas}", filasAfectadas2);

                // Paso 6: Verificación final
                _logger.LogInformation("🔍 PASO 6: Verificación final...");
                var ventaGuardada = await _context.Ventas
                    .Include(v => v.Items)
                    .FirstOrDefaultAsync(v => v.Id == venta.Id);

                if (ventaGuardada != null)
                {
                    _logger.LogInformation("✅ VERIFICACIÓN: Venta encontrada en BD - ID: {id}, Items: {itemsCount}", 
                        ventaGuardada.Id, ventaGuardada.Items.Count);
                }
                else
                {
                    _logger.LogError("❌ VERIFICACIÓN FALLIDA: No se encontró la venta en la BD");
                }

                _logger.LogInformation("🎉 ======================= VENTA REGISTRADA EXITOSAMENTE =======================");
                _logger.LogInformation("🎉 VentaId: {ventaId}, PreferenceId: {preferenceId}, MontoTotal: {monto}, Items: {itemsCount}",
                    venta.Id, preferenceId, montoTotal, ventaItems.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ======================= ERROR AL CREAR REGISTRO DE VENTA =======================");
                _logger.LogError("❌ PreferenceId: {preferenceId}", preferenceId);
                _logger.LogError("❌ Error detalle: {message}", ex.Message);
                _logger.LogError("❌ Inner Exception: {innerException}", ex.InnerException?.Message);
                _logger.LogError("❌ Stack trace: {stackTrace}", ex.StackTrace);
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
                        Success = GetCallbackUrl("Success"),
                        Failure = GetCallbackUrl("Failure"),
                        Pending = GetCallbackUrl("Pending")
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
                    ExpirationDateTo = DateTime.Now.AddMinutes(10),

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

        /*[HttpPost("webhooks/mercadopago")]
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
        */

        [HttpPost("webhooks/mercadopago")]
        public async Task<IActionResult> WebhookMercadoPago([FromBody] object notification)
        {
            try
            {
                _logger.LogInformation("🔔 Webhook MercadoPago recibido: {notification}", JsonSerializer.Serialize(notification));

                // Parsear la notificación JSON
                var notificationJson = JsonSerializer.Serialize(notification);
                var notificationData = JsonSerializer.Deserialize<MercadoPagoNotification>(notificationJson);

                // Validar que sea una notificación de payment
                if (notificationData?.Type != "payment" || notificationData?.Data?.Id == null)
                {
                    _logger.LogWarning("⚠️ Notificación ignorada - Tipo: {type}, DataId: {dataId}", 
                        notificationData?.Type, notificationData?.Data?.Id);
                    return Ok(); // Responder 200 para que MP no reintente
                }

                var paymentId = notificationData.Data.Id;
                _logger.LogInformation("💳 Procesando payment ID: {paymentId}", paymentId);

                // Configurar MercadoPago API
                var accessToken = GetAccessToken();
                if (string.IsNullOrEmpty(accessToken))
                {
                    _logger.LogError("❌ AccessToken no configurado");
                    return StatusCode(500);
                }

                MercadoPagoConfig.AccessToken = accessToken;
                var paymentClient = new PaymentClient();

                // Obtener información completa del pago desde MercadoPago
                var payment = await paymentClient.GetAsync(long.Parse(paymentId));
                
                if (payment == null)
                {
                    _logger.LogWarning("⚠️ No se pudo obtener información del pago: {paymentId}", paymentId);
                    return Ok();
                }

                _logger.LogInformation("📊 Pago obtenido - Status: {status}, ExternalRef: {externalRef}", 
                    payment.Status, payment.ExternalReference);

                // Buscar las reservas asociadas a este pago
                // Usamos external_reference o preference_id para encontrar nuestras reservas
                var preferenceId = payment.AdditionalInfo?.Items?.FirstOrDefault()?.Id ?? 
                                 await BuscarPreferenceIdPorFecha(payment.DateCreated);

                if (string.IsNullOrEmpty(preferenceId))
                {
                    _logger.LogWarning("⚠️ No se encontró PreferenceId para el pago: {paymentId}", paymentId);
                    return Ok();
                }

                _logger.LogInformation("🎯 PreferenceId encontrado: {preferenceId}", preferenceId);

                // Procesar según el estado del pago
                await ProcesarCambioEstadoPago(payment.Status, preferenceId, paymentId);

                _logger.LogInformation("✅ Webhook procesado exitosamente - PaymentId: {paymentId}", paymentId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ERROR procesando webhook MercadoPago");
                // Siempre devolver 200 para evitar reintentos infinitos de MP
                return Ok(); 
            }
        }

        // Método auxiliar para procesar el cambio de estado
        private async Task ProcesarCambioEstadoPago(string? status, string preferenceId, string paymentId)
        {
            switch (status?.ToLower())
            {
                case "approved":
                    _logger.LogInformation("✅ Pago APROBADO - Confirmando reservas...");
                    
                    var reservasConfirmadas = await _stockService.ConfirmarReservaAsync(preferenceId);
                    if (reservasConfirmadas)
                    {
                        await CrearRegistroVentaAsync(preferenceId, paymentId);
                        _logger.LogInformation("🎉 Stock descontado y venta registrada para PreferenceId: {preferenceId}", preferenceId);
                    }
                    else
                    {
                        _logger.LogWarning("⚠️ No se encontraron reservas pendientes para confirmar");
                    }
                    break;

                case "rejected":
                case "cancelled":
                    _logger.LogInformation("❌ Pago {status} - Liberando reservas...", status?.ToUpper());
                    await LiberarReservasPorPreferenceId(preferenceId, $"Pago {status}");
                    break;

                case "pending":
                case "in_process":
                case "in_mediation":
                    _logger.LogInformation("⏳ Pago {status} - Manteniendo reservas activas", status?.ToUpper());
                    // No hacer nada, las reservas se mantienen hasta que expiren o se confirme/rechace
                    break;

                default:
                    _logger.LogWarning("❓ Estado de pago desconocido: {status}", status);
                    break;
            }
        }

        // Método auxiliar para buscar PreferenceId por fecha (fallback)
        private async Task<string?> BuscarPreferenceIdPorFecha(DateTime? fechaPago)
        {
            if (!fechaPago.HasValue) return null;

            var reserva = await _context.StockReserva
                .Where(r => r.FechaCreacion >= fechaPago.Value.AddMinutes(-10) && 
                           r.FechaCreacion <= fechaPago.Value.AddMinutes(10) &&
                           r.Estado == "PENDIENTE")
                .OrderBy(r => Math.Abs((r.FechaCreacion - fechaPago.Value).TotalMinutes))
                .FirstOrDefaultAsync();

            return reserva?.PreferenceId;
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

[HttpGet("debug/verificar-stock/{varianteId}")]
public async Task<IActionResult> VerificarStockVariante(int varianteId)
{
    try
    {
        var variante = await _context.ProductosVariantes
            .FirstOrDefaultAsync(v => v.Id == varianteId);

        if (variante == null)
        {
            return NotFound(new { message = "Variante no encontrada" });
        }

        var reservasActivas = await _context.StockReserva
            .Where(r => r.VarianteId == varianteId && r.Estado == "PENDIENTE")
            .ToListAsync();

        var reservasConfirmadas = await _context.StockReserva
            .Where(r => r.VarianteId == varianteId && r.Estado == "CONFIRMADO")
            .ToListAsync();

        return Ok(new
        {
            varianteId = variante.Id,
            stockTotal = variante.Stock,
            stockReservado = variante.StockReservado,
            stockDisponible = variante.StockDisponible,
            reservasActivas = reservasActivas.Count,
            reservasConfirmadas = reservasConfirmadas.Count,
            detalleReservasActivas = reservasActivas.Select(r => new {
                r.Id,
                r.Cantidad,
                r.Estado,
                r.PreferenceId,
                r.FechaCreacion
            }),
            detalleReservasConfirmadas = reservasConfirmadas.Select(r => new {
                r.Id,
                r.Cantidad,
                r.Estado,
                r.PreferenceId,
                r.FechaCreacion
            })
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.Message });
    }
}

[HttpPost("debug/verificar-carrito")]
public async Task<IActionResult> VerificarCarrito([FromBody] CrearPreferenciaDto preferenciaData)
{
    try
    {
        _logger.LogInformation("=== DEBUG CARRITO ===");
        _logger.LogInformation("Items recibidos: {count}", preferenciaData?.Items?.Count ?? 0);
        
        if (preferenciaData?.Items == null || !preferenciaData.Items.Any())
        {
            return Ok(new { error = "No hay items en el carrito" });
        }

        var resultados = new List<object>();

        foreach (var item in preferenciaData.Items)
        {
            _logger.LogInformation("Verificando item - VarianteId: {varianteId}, Cantidad: {cantidad}", item.VarianteId, item.Cantidad);
            
            var variante = await _context.ProductosVariantes
                .FirstOrDefaultAsync(v => v.Id == item.VarianteId);

            if (variante == null)
            {
                resultados.Add(new
                {
                    varianteId = item.VarianteId,
                    error = "Variante no encontrada",
                    item = item
                });
                continue;
            }

            var stockDisponible = await _stockService.VerificarStockDisponibleAsync(item.VarianteId, item.Cantidad);

            resultados.Add(new
            {
                varianteId = item.VarianteId,
                producto = $"{item.Marca} {item.Modelo}",
                variante = $"{item.Color} - {item.Ram}/{item.Almacenamiento}",
                cantidadSolicitada = item.Cantidad,
                stockTotal = variante.Stock,
                stockReservado = variante.StockReservado,
                stockDisponible = variante.StockDisponible,
                verificacionOK = stockDisponible,
                itemCompleto = item
            });
        }

        return Ok(new
        {
            totalItems = preferenciaData.Items.Count,
            resultados = resultados,
            todosDisponibles = resultados.All(r => r.GetType().GetProperty("verificacionOK")?.GetValue(r) as bool? == true)
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al verificar carrito");
        return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
    }
}

[HttpPost("debug/confirmar-pago-manual")]
public async Task<IActionResult> ConfirmarPagoManual([FromBody] ConfirmarPagoManualDto datos)
{
    try
    {
        _logger.LogInformation("=== CONFIRMACIÓN MANUAL DE PAGO ===");
        _logger.LogInformation("PreferenceId: {preferenceId}", datos.PreferenceId);

        if (string.IsNullOrEmpty(datos.PreferenceId))
        {
            return BadRequest(new { success = false, message = "PreferenceId requerido" });
        }

        // Confirmar las reservas de stock
        var reservasConfirmadas = await _stockService.ConfirmarReservaAsync(datos.PreferenceId);

        if (reservasConfirmadas)
        {
            // Crear registro de venta
            await CrearRegistroVentaAsync(datos.PreferenceId, datos.PaymentId ?? "MANUAL-" + DateTime.Now.Ticks);

            _logger.LogInformation("✅ Pago confirmado manualmente - PreferenceId: {preferenceId}", datos.PreferenceId);

            return Ok(new
            {
                success = true,
                message = "Pago confirmado exitosamente",
                preferenceId = datos.PreferenceId,
                stockDescontado = true,
                ventaRegistrada = true
            });
        }
        else
        {
            _logger.LogWarning("❌ No se encontraron reservas para confirmar - PreferenceId: {preferenceId}", datos.PreferenceId);
            return NotFound(new { success = false, message = "No se encontraron reservas pendientes para este preference ID" });
        }
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "❌ Error al confirmar pago manualmente");
        return StatusCode(500, new { success = false, message = "Error al confirmar pago", error = ex.Message });
    }
}

[HttpPost("debug/crear-venta-directa")]
public async Task<IActionResult> CrearVentaDirecta([FromBody] ConfirmarPagoManualDto datos)
{
    try
    {
        _logger.LogInformation("=== CREAR VENTA DIRECTA ===");
        _logger.LogInformation("PreferenceId: {preferenceId}", datos.PreferenceId);

        if (string.IsNullOrEmpty(datos.PreferenceId))
        {
            return BadRequest(new { success = false, message = "PreferenceId requerido" });
        }

        // Llamar directamente al método CrearRegistroVentaAsync
        await CrearRegistroVentaAsync(datos.PreferenceId, datos.PaymentId ?? "DIRECTO-" + DateTime.Now.Ticks);

        _logger.LogInformation("✅ Venta creada directamente - PreferenceId: {preferenceId}", datos.PreferenceId);

        return Ok(new
        {
            success = true,
            message = "Venta creada exitosamente",
            preferenceId = datos.PreferenceId
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "❌ Error al crear venta directamente");
        return StatusCode(500, new { 
            success = false, 
            message = "Error al crear venta", 
            error = ex.Message,
            stackTrace = ex.StackTrace?.Substring(0, Math.Min(1000, ex.StackTrace.Length))
        });
    }
}

public class ConfirmarPagoManualDto
{
    public string PreferenceId { get; set; } = string.Empty;
    public string? PaymentId { get; set; }
}

[HttpGet("debug/listar-reservas-pendientes")]
public async Task<IActionResult> ListarReservasPendientes()
{
    try
    {
        var reservasPendientes = await _context.StockReserva
            .Include(r => r.Variante)
            .ThenInclude(v => v.Producto)
            .Where(r => r.Estado == "PENDIENTE")
            .OrderByDescending(r => r.FechaCreacion)
            .Take(10)
            .Select(r => new {
                r.Id,
                r.PreferenceId,
                r.SessionId,
                r.VarianteId,
                r.Cantidad,
                r.Estado,
                r.FechaCreacion,
                r.FechaExpiracion,
                Producto = $"{r.Variante.Producto.Marca} {r.Variante.Producto.Modelo}",
                Variante = $"{r.Variante.Color} - {r.Variante.Ram}/{r.Variante.Almacenamiento}"
            })
            .ToListAsync();

        return Ok(new {
            success = true,
            reservasPendientes = reservasPendientes,
            total = reservasPendientes.Count
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.Message });
    }
}

[HttpGet("debug/listar-reservas-confirmadas")]
public async Task<IActionResult> ListarReservasConfirmadas()
{
    try
    {
        var reservasConfirmadas = await _context.StockReserva
            .Include(r => r.Variante)
            .ThenInclude(v => v.Producto)
            .Where(r => r.Estado == "CONFIRMADO")
            .OrderByDescending(r => r.FechaCreacion)
            .Take(10)
            .Select(r => new {
                r.Id,
                r.PreferenceId,
                r.SessionId,
                r.VarianteId,
                r.Cantidad,
                r.Estado,
                r.FechaCreacion,
                r.FechaExpiracion,
                Producto = $"{r.Variante.Producto.Marca} {r.Variante.Producto.Modelo}",
                Variante = $"{r.Variante.Color} - {r.Variante.Ram}/{r.Variante.Almacenamiento}"
            })
            .ToListAsync();

        return Ok(new {
            success = true,
            reservasConfirmadas = reservasConfirmadas,
            total = reservasConfirmadas.Count
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.Message });
    }
}

[HttpGet("debug/listar-ventas")]
public async Task<IActionResult> ListarVentas()
{
    try
    {
        var ventas = await _context.Ventas
            .Include(v => v.Items)
            .ThenInclude(i => i.Variante)
            .ThenInclude(v => v.Producto)
            .OrderByDescending(v => v.FechaVenta)
            .Take(10)
            .Select(v => new {
                v.Id,
                v.PreferenceId,
                v.PaymentId,
                v.MontoTotal,
                v.Estado,
                v.FechaVenta,
                Items = v.Items.Select(i => new {
                    i.Id,
                    i.VarianteId,
                    i.Cantidad,
                    i.PrecioUnitario,
                    i.Subtotal,
                    Producto = $"{i.Variante.Producto.Marca} {i.Variante.Producto.Modelo}",
                    Variante = $"{i.Variante.Color} - {i.Variante.Ram}/{i.Variante.Almacenamiento}"
                })
            })
            .ToListAsync();

        return Ok(new {
            success = true,
            ventas = ventas,
            total = ventas.Count
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.Message });
    }
}

        // Método auxiliar para obtener URLs de callback usando configuración de entorno
        private string GetCallbackUrl(string action)
        {
            var isDevelopment = _configuration.GetValue<bool>("Development") ||
                               Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
                               
            var ngrokUrl = _configuration.GetValue<string>("ngrok:BaseUrl");
            var productionUrl = _configuration.GetValue<string>("PRODUCTION_BASE_URL");
            
            var baseUrl = isDevelopment 
                ? ngrokUrl ?? "http://localhost:5000" 
                : productionUrl ?? $"{Request.Scheme}://{Request.Host}";
                
            return $"{baseUrl}/Pagos/{action}";
        }
    }
    
    
}