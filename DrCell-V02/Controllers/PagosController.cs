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

namespace DrCell_V02.Controllers
{
    [ApiController]
    [Route("Pagos")]
    public class PagosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PagosController> _logger;

        public PagosController(ApplicationDbContext context, IConfiguration configuration, ILogger<PagosController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        private string GetAccessToken()
        {
            var token = _configuration.GetValue<string>("MercadoPago:AccessToken");
            return token ?? string.Empty;
        }

        private string GetPublicKey()
        {
            var publicKey = _configuration.GetValue<string>("MercadoPago:PublicKey");
            return publicKey ?? string.Empty;
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { 
                message = "🎉 ¡PagosController funcionando correctamente!", 
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

        [HttpPost("crear-preferencia")]
        public async Task<IActionResult> CrearPreferencia([FromBody] CrearPreferenciaDto preferenciaData)
        {
            try
            {
                _logger.LogInformation("🔧 Endpoint crear-preferencia llamado");
                _logger.LogInformation("🔧 Datos recibidos: {data}", JsonSerializer.Serialize(preferenciaData));
                _logger.LogInformation("🔧 Items count: {count}", preferenciaData?.Items?.Count ?? 0);
                
                // Validar modelo
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("❌ ModelState inválido:");
                    foreach (var error in ModelState)
                    {
                        _logger.LogWarning("   - {key}: {errors}", error.Key, string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage)));
                    }
                    return BadRequest(new { success = false, message = "Datos inválidos", errors = ModelState });
                }

                if (preferenciaData?.Items == null || !preferenciaData.Items.Any())
                {
                    return BadRequest(new { success = false, message = "No se proporcionaron items para el pago" });
                }

                // Configurar MercadoPago
                var accessToken = GetAccessToken();
                if (string.IsNullOrEmpty(accessToken))
                {
                    _logger.LogError("❌ AccessToken no configurado");
                    return StatusCode(500, new { success = false, message = "Error de configuración: AccessToken no configurado" });
                }

                MercadoPagoConfig.AccessToken = accessToken;
                _logger.LogInformation("✅ MercadoPago configurado correctamente");
                
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

                var request = new PreferenceRequest
                {
                    Items = items,
                    BackUrls = new PreferenceBackUrlsRequest
                    {
                        Success = $"{Request.Scheme}://{Request.Host}/Pagos/payment-success",
                        Failure = $"{Request.Scheme}://{Request.Host}/Pagos/payment-failure",
                        Pending = $"{Request.Scheme}://{Request.Host}/Pagos/payment-pending"
                    },
                    AutoReturn = "approved",
                    PaymentMethods = new PreferencePaymentMethodsRequest
                    {
                        DefaultPaymentMethodId = null,
                        ExcludedPaymentTypes = new List<PreferencePaymentTypeRequest>(),
                        ExcludedPaymentMethods = new List<PreferencePaymentMethodRequest>(),
                        DefaultInstallments = 1
                    },
                    NotificationUrl = $"{Request.Scheme}://{Request.Host}/Pagos/webhooks/mercadopago",
                    StatementDescriptor = "DRCELL",
                    ExternalReference = Guid.NewGuid().ToString(),
                    Expires = true,
                    ExpirationDateFrom = DateTime.Now,
                    ExpirationDateTo = DateTime.Now.AddMinutes(30)
                };

                _logger.LogInformation("🔄 Creando preferencia en MercadoPago...");
                var preference = await client.CreateAsync(request);
                
                _logger.LogInformation("✅ Preferencia creada exitosamente: {id}", preference.Id);
                
                return Ok(new
                {
                    success = true,
                    preferenceId = preference.Id,
                    initPoint = preference.InitPoint,
                    sandboxInitPoint = preference.SandboxInitPoint
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear preferencia de MercadoPago");
                return BadRequest(new { 
                    success = false, 
                    message = "Error al crear la preferencia de pago",
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("Success")]
        public IActionResult Success([FromQuery] PaymentResponse paymentResponse)
        {
            try
            {
                _logger.LogInformation("✅ Pago exitoso recibido: {paymentResponse}", JsonSerializer.Serialize(paymentResponse));
                
                // Obtener información del pedido desde la sesión
                var pedidoInfoJson = HttpContext.Session.GetString("PedidoInfo");
                if (!string.IsNullOrEmpty(pedidoInfoJson))
                {
                    var pedidoInfo = JsonSerializer.Deserialize<object>(pedidoInfoJson);
                    
                    // Aquí puedes procesar el pago exitoso
                    // - Actualizar stock
                    // - Crear registro de venta
                    // - Enviar confirmación por email
                    
                    // Limpiar sesión
                    HttpContext.Session.Remove("PedidoInfo");
                    
                    _logger.LogInformation("🎉 Pago procesado exitosamente para pedido: {pedidoInfo}", pedidoInfo);
                    
                    return Ok(new { 
                        status = "success", 
                        message = "Pago procesado exitosamente",
                        paymentInfo = paymentResponse,
                        pedidoInfo = pedidoInfo
                    });
                }
                
                return Ok(new { 
                    status = "success", 
                    message = "Pago procesado exitosamente",
                    data = paymentResponse 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al procesar resultado del pago exitoso");
                return Ok(new { 
                    status = "error", 
                    message = "Error al procesar el resultado del pago",
                    error = ex.Message 
                });
            }
        }

        [HttpGet("Failure")]
        public IActionResult Failure([FromQuery] PaymentResponse paymentResponse)
        {
            try
            {
                _logger.LogWarning("❌ Pago fallido recibido: {paymentResponse}", JsonSerializer.Serialize(paymentResponse));
                
                return Ok(new { 
                    status = "failure", 
                    message = "El pago no pudo ser procesado",
                    error = "Pago rechazado por MercadoPago",
                    data = paymentResponse 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al procesar fallo del pago");
                return Ok(new { 
                    status = "error", 
                    message = "Error al procesar el fallo del pago",
                    error = ex.Message,
                    data = paymentResponse 
                });
            }
        }

        [HttpGet("Pending")]
        public IActionResult Pending([FromQuery] PaymentResponse paymentResponse)
        {
            try
            {
                _logger.LogInformation("⏳ Pago pendiente recibido: {paymentResponse}", JsonSerializer.Serialize(paymentResponse));
                
                return Ok(new { 
                    status = "pending", 
                    message = "El pago está pendiente de confirmación",
                    data = paymentResponse 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al procesar pago pendiente");
                return Ok(new { 
                    status = "error", 
                    message = "Error al procesar el pago pendiente",
                    error = ex.Message,
                    data = paymentResponse 
                });
            }
        }



        [HttpGet("payment-success")]
        public IActionResult PaymentSuccess()
        {
            return Ok(new { message = "Pago procesado exitosamente" });
        }

        [HttpGet("payment-failure")]  
        public IActionResult PaymentFailure()
        {
            return Ok(new { message = "El pago no pudo ser procesado" });
        }

        [HttpGet("payment-pending")]
        public IActionResult PaymentPending()
        {
            return Ok(new { message = "El pago está pendiente de confirmación" });
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
                _logger.LogInformation("Webhook recibido de MercadoPago: {notification}", notification);
                
                // Aquí puedes procesar la notificación de pago
                // Por ejemplo, actualizar el estado del pedido en la base de datos
                await Task.CompletedTask; // Placeholder para operación async
                
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error procesando webhook de MercadoPago");
                return StatusCode(500);
            }
        }
    }
}