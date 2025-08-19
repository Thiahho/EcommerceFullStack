using DrCell_V02.Data;
using DrCell_V02.Data.Dtos;
using DrCell_V02.Data.Modelos;
using DrCell_V02.Data.Vistas;
using k8s.Models;
using MercadoPago.Client.Common;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MercadoPago.Resource.Preference;
using MercadoPago.Resource.Payment;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Drawing;
using System.Text.Json;

namespace DrCell_V02.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<HomeController> _logger;

        public HomeController(ApplicationDbContext applicationDb, IConfiguration configuration, ILogger<HomeController> logger)
        {
            _context = applicationDb;
            _configuration = configuration;
            _logger = logger;
        }

        private string GetAccessToken()
        {
            var token = _configuration.GetValue<string>("MercadoPago:AccessToken");
            return token ?? string.Empty;

        }
        private string  GetPublicKey()
        {
            var x = _configuration.GetValue<string>("MercadoPago:PublicKey");
            return x ?? string.Empty;

        }

        [HttpGet("Success")]
        public IActionResult Success([FromQuery] PaymentResponse paymentResponse)
        {
            try
            {
                // Obtener información del pedido desde la sesión
                var pedidoInfoJson = HttpContext.Session.GetString("PedidoInfo");
                if (!string.IsNullOrEmpty(pedidoInfoJson))
                {
                    var pedidoInfo = JsonSerializer.Deserialize<dynamic>(pedidoInfoJson);
                    
                    // Aquí puedes procesar el pago exitoso
                    // - Actualizar stock
                    // - Crear registro de venta
                    // - Enviar confirmación por email
                    
                    ViewBag.PaymentInfo = paymentResponse;
                    ViewBag.PedidoInfo = pedidoInfo;
                    
                    // Limpiar sesión
                    HttpContext.Session.Remove("PedidoInfo");
                    
                    return View("PaymentSuccess");
                }
                
                return Json(new { 
                    status = "success", 
                    message = "Pago procesado exitosamente",
                    data = paymentResponse 
                });
            }
            catch (Exception ex)
            {
                return Json(new { 
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
                ViewBag.PaymentInfo = paymentResponse;
                return View("PaymentFailure");
            }
            catch (Exception ex)
            {
                return Json(new { 
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
                ViewBag.PaymentInfo = paymentResponse;
                return View("PaymentPending");
            }
            catch (Exception ex)
            {
                return Json(new { 
                    status = "error", 
                    message = "Error al procesar el pago pendiente",
                    error = ex.Message,
                    data = paymentResponse 
                });
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
                            CurrencyId = "COP" // Peso colombiano
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
                        Success = $"{Request.Scheme}://{Request.Host}/Success",
                        Failure = $"{Request.Scheme}://{Request.Host}/Failure",
                        Pending = $"{Request.Scheme}://{Request.Host}/Pending"
                    },
                    AutoReturn = "approved",

                    PaymentMethods = new PreferencePaymentMethodsRequest
                    {
                        ExcludedPaymentMethods = new List<PreferencePaymentMethodRequest>(),
                        ExcludedPaymentTypes = new List<PreferencePaymentTypeRequest>(),
                        Installments = 12 // Máximo 12 cuotas
                    },

                    StatementDescriptor = "DrCell - Tienda de Celulares",
                    ExternalReference = $"ORDEN-{producto.Id}-{variante.Id}-{DateTimeOffset.Now.ToUnixTimeSeconds()}",
                    
                    Expires = true,
                    ExpirationDateFrom = DateTime.Now,
                    ExpirationDateTo = DateTime.Now.AddMinutes(30), // 30 minutos para completar el pago

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

                // Guardar información del pedido en sesión (opcional)
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

                // Retornar información del pago
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
                // Log del error
                Console.WriteLine($"Error al procesar pago: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("procesar-pago-carrito")]
        public async Task<IActionResult> ProcesarPagoCarrito()
        {
            try
            {
                // Leer el JSON raw del body
                string jsonBody;
                using (var reader = new StreamReader(Request.Body))
                {
                    jsonBody = await reader.ReadToEndAsync();
                }
                
                Console.WriteLine($"🔍 JSON recibido (raw): {jsonBody}");
                
                // Validar que no esté vacío
                if (string.IsNullOrEmpty(jsonBody))
                {
                    Console.WriteLine("❌ ERROR: Body JSON está vacío");
                    return BadRequest(new { message = "Body de la petición está vacío" });
                }
                
                // Deserializar manualmente
                EnviarPagoCarritoDto enviarPagoCarritoDto;
                try
                {
                    enviarPagoCarritoDto = JsonSerializer.Deserialize<EnviarPagoCarritoDto>(jsonBody, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error deserializando JSON: {ex.Message}");
                    return BadRequest(new { message = "Error deserializando JSON", error = ex.Message });
                }

                // Validación crítica: verificar que el objeto no sea null
                if (enviarPagoCarritoDto == null)
                {
                    Console.WriteLine("❌ ERROR CRÍTICO: enviarPagoCarritoDto es NULL tras deserialización");
                    return BadRequest(new { message = "Error de deserialización: objeto resultante es null" });
                }

                // Debug: Log de los datos recibidos
                Console.WriteLine($"🔍 Datos recibidos en backend:");
                Console.WriteLine($"🔍 DTO no es null: ✅");
                Console.WriteLine($"🔍 Name: '{enviarPagoCarritoDto.Name ?? "NULL"}'");
                Console.WriteLine($"🔍 Email: '{enviarPagoCarritoDto.Email ?? "NULL"}'");
                Console.WriteLine($"🔍 TotalPrice: {enviarPagoCarritoDto.TotalPrice}");
                Console.WriteLine($"🔍 Items es null: {enviarPagoCarritoDto.Items == null}");
                Console.WriteLine($"🔍 Items count: {enviarPagoCarritoDto.Items?.Count ?? 0}");

                // Validar modelo
                if (!ModelState.IsValid)
                {
                    Console.WriteLine($"❌ ModelState inválido:");
                    foreach (var error in ModelState)
                    {
                        Console.WriteLine($"❌ Campo '{error.Key}': {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                    }
                    return BadRequest(new { message = "Datos inválidos", errors = ModelState });
                }

                // Establecer valor por defecto para IdentificationType
                if (string.IsNullOrEmpty(enviarPagoCarritoDto.IdentificationType))
                {
                    enviarPagoCarritoDto.IdentificationType = "CC";
                }

                // Validar que hay items en el carrito
                if (!enviarPagoCarritoDto.Items.Any())
                {
                    return BadRequest(new { message = "El carrito está vacío" });
                }

                // Configurar MercadoPago
                var accessToken = GetAccessToken();
                Console.WriteLine($"🔑 AccessToken obtenido: {(!string.IsNullOrEmpty(accessToken) ? "✅ Válido" : "❌ Vacío")}");
                
                if (string.IsNullOrEmpty(accessToken))
                {
                    Console.WriteLine("❌ AccessToken no configurado en appsettings.json");
                    return StatusCode(500, new { message = "Error de configuración: AccessToken no configurado" });
                }

                MercadoPagoConfig.AccessToken = accessToken;
                Console.WriteLine("✅ MercadoPago configurado correctamente");

                // Crear items para MercadoPago
                Console.WriteLine($"🛒 Creando {enviarPagoCarritoDto.Items.Count} items para MercadoPago...");
                var mercadoPagoItems = enviarPagoCarritoDto.Items.Select(item => new PreferenceItemRequest
                {
                    Title = item.Descripcion,
                    Quantity = item.Cantidad,
                    UnitPrice = item.Precio,
                    CurrencyId = "COP"
                }).ToList();

                // Crear la preferencia de pago con configuración avanzada de Checkout Pro
                var request = new PreferenceRequest
                {
                    Items = mercadoPagoItems,

                    Payer = new PreferencePayerRequest
                    {
                        Name = enviarPagoCarritoDto.Name,
                        Surname = enviarPagoCarritoDto.Surname,
                        Email = enviarPagoCarritoDto.Email,
                        Phone = new PhoneRequest
                        {
                            AreaCode = enviarPagoCarritoDto.AreaCode,
                            Number = enviarPagoCarritoDto.PhoneNumber
                        },
                        Identification = new IdentificationRequest
                        {
                            Type = enviarPagoCarritoDto.IdentificationType,
                            Number = enviarPagoCarritoDto.IdentificationNumber
                        }
                    },

                    BackUrls = new PreferenceBackUrlsRequest
                    {
                        Success = $"{Request.Scheme}://{Request.Host}/Success",
                        Failure = $"{Request.Scheme}://{Request.Host}/Failure",
                        Pending = $"{Request.Scheme}://{Request.Host}/Pending"
                    },
                    AutoReturn = "approved",

                PaymentMethods = new PreferencePaymentMethodsRequest
                    {
                        ExcludedPaymentMethods = new List<PreferencePaymentMethodRequest>(),
                        ExcludedPaymentTypes = new List<PreferencePaymentTypeRequest>(),
                        Installments = 24, // Hasta 24 cuotas para mayor flexibilidad
                        DefaultInstallments = 1 // Pago en 1 cuota por defecto
                    },

                    // Configuración avanzada de Checkout Pro
                    StatementDescriptor = "DrCell - Tienda de Celulares",
                    ExternalReference = $"CART-{DateTimeOffset.Now.ToUnixTimeSeconds()}-{enviarPagoCarritoDto.Items.Count}ITEMS",
                    
                    // Configuración de expiración
                    Expires = true,
                    ExpirationDateFrom = DateTime.Now,
                    ExpirationDateTo = DateTime.Now.AddMinutes(30),

                    // Configuración de notificaciones
                    NotificationUrl = $"{Request.Scheme}://{Request.Host}/webhooks/mercadopago",

                    // Metadatos para tracking y analytics
                    Metadata = new Dictionary<string, object>
                    {
                        { "integration_type", "checkout_pro" },
                        { "platform", "drcell_ecommerce" },
                        { "version", "v2.0" },
                        { "customer_type", "retail" },
                        { "order_type", "cart_purchase" },
                        { "items_count", enviarPagoCarritoDto.Items.Count },
                        { "total_amount", enviarPagoCarritoDto.TotalPrice },
                        { "currency", "COP" },
                        { "payment_source", "web" },
                        { "customer_email", enviarPagoCarritoDto.Email },
                        { "timestamp", DateTimeOffset.Now.ToUnixTimeSeconds() },
                        { "cart_hash", $"CART_{enviarPagoCarritoDto.GetHashCode()}" }
                    }
                };

                // Crear la preferencia
                Console.WriteLine("🔄 Creando preferencia en MercadoPago...");
                var client = new PreferenceClient();
                
                Preference preference;
                try
                {
                    preference = await client.CreateAsync(request);
                    Console.WriteLine($"✅ Preferencia creada exitosamente: {preference.Id}");
                    Console.WriteLine($"🔗 Init Point: {preference.InitPoint}");
                    Console.WriteLine($"🔗 Sandbox Init Point: {preference.SandboxInitPoint}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error creando preferencia: {ex.Message}");
                    Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                    throw new Exception($"Error al crear preferencia de MercadoPago: {ex.Message}", ex);
                }

                // Guardar información del pedido en sesión
                var pedidoInfo = new
                {
                    TipoCompra = "carrito",
                    Items = enviarPagoCarritoDto.Items,
                    PrecioTotal = enviarPagoCarritoDto.TotalPrice,
                    PreferenceId = preference.Id,
                    FechaCreacion = DateTime.Now
                };

                HttpContext.Session.SetString("PedidoCarritoInfo", JsonSerializer.Serialize(pedidoInfo));

                // Retornar información del pago
                return Ok(new
                {
                    success = true,
                    preferenceId = preference.Id,
                    initPoint = preference.InitPoint,
                    sandboxInitPoint = preference.SandboxInitPoint,
                    publicKey = GetPublicKey(),
                    pedido = new
                    {
                        tipo = "carrito",
                        cantidadItems = enviarPagoCarritoDto.Items.Count,
                        precioTotal = enviarPagoCarritoDto.TotalPrice,
                        items = enviarPagoCarritoDto.Items.Select(i => new
                        {
                            descripcion = i.Descripcion,
                            cantidad = i.Cantidad,
                            precio = i.Precio
                        })
                    }
                });
            }
            catch (Exception ex)
            {
                // Log del error
                Console.WriteLine($"Error al procesar pago del carrito: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("webhooks/mercadopago")]
        public async Task<IActionResult> MercadoPagoWebhook([FromBody] dynamic notification)
        {
            try
            {
                Console.WriteLine($"🔔 Webhook recibido de MercadoPago: {JsonSerializer.Serialize(notification)}");
                
                // Verificar el tipo de notificación
                string topic = notification.GetProperty("topic").GetString();
                string action = notification.GetProperty("action").GetString();
                
                if (topic == "payment")
                {
                    string paymentId = notification.GetProperty("data").GetProperty("id").GetString();
                    Console.WriteLine($"💰 Notificación de pago ID: {paymentId}");
                    
                    // Aquí puedes implementar la lógica para:
                    // 1. Consultar el estado del pago en MercadoPago
                    // 2. Actualizar el estado de la orden en tu base de datos
                    // 3. Enviar emails de confirmación
                    // 4. Actualizar inventario/stock
                    
                    // TODO: Implementar lógica de procesamiento de webhook
                    await ProcessPaymentWebhook(paymentId);
                }
                
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error procesando webhook: {ex.Message}");
                return StatusCode(500);
            }
        }

        private async Task ProcessPaymentWebhook(string paymentId)
        {
            try
            {
                // Configurar MercadoPago
                var accessToken = GetAccessToken();
                MercadoPagoConfig.AccessToken = accessToken;
                
                // Consultar el pago en MercadoPago
                var paymentClient = new PaymentClient();
                var payment = await paymentClient.GetAsync(long.Parse(paymentId));
                
                Console.WriteLine($"💳 Estado del pago {paymentId}: {payment.Status}");
                Console.WriteLine($"💳 Monto: {payment.TransactionAmount} {payment.CurrencyId}");
                Console.WriteLine($"💳 Referencia externa: {payment.ExternalReference}");
                
                // Según el estado del pago, realizar acciones
                switch (payment.Status?.ToLower())
                {
                    case "approved":
                        Console.WriteLine("✅ Pago aprobado - procesando orden...");
                        // TODO: Actualizar base de datos, reducir stock, enviar confirmación
                        break;
                        
                    case "rejected":
                        Console.WriteLine("❌ Pago rechazado");
                        // TODO: Notificar al cliente, liberar stock reservado
                        break;
                        
                    case "pending":
                        Console.WriteLine("⏳ Pago pendiente");
                        // TODO: Notificar estado pendiente
                        break;
                        
                    default:
                        Console.WriteLine($"❓ Estado de pago desconocido: {payment.Status}");
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error consultando pago {paymentId}: {ex.Message}");
            }
        }

        public IActionResult Index()
        {
            var Marcas = _context.Celulares.Select(c => c.marca).Where(m => !string.IsNullOrEmpty(m)).Distinct().ToList();
            ViewBag.marca = Marcas;
            var viewModel = new PresupuestoConsultaViewModel();
            return View(viewModel);
        }

        [HttpPost]
        public IActionResult Buscar(PresupuestoConsultaViewModel modelo)
        {
            // Buscar módulos
            var modulos = _context.Modulos
                .Where(x => x.marca == modelo.Marca && x.modelo == modelo.Modelo)
                .Select(m => new ModuloOpcionViewModel
                {
                    Color = m.color ?? "",
                    Tipo = m.tipo ?? "",
                    ConMarco = m.marco,
                    Arreglo = m.arreglo
                }).ToList();

            modelo.ModuloOpciones = modulos;

            if (modulos.Count == 1)
            {
                modelo.ArregloModuloSeleccionado = modulos[0].Arreglo;
            }

            // Buscar batería
            var bateria = _context.Baterias
                .FirstOrDefault(x => x.marca == modelo.Marca && x.modelo == modelo.Modelo);
            modelo.ArregloBateria = bateria?.arreglo;

            // Buscar pin
            var pin = _context.Pines
                .FirstOrDefault(x => x.marca == modelo.Marca && x.modelo == modelo.Modelo);
            modelo.ArregloPin = pin?.arreglo;

            // Guardar presupuesto completo en sesión
            var jsonString = JsonSerializer.Serialize(modelo);
            HttpContext.Session.SetString("Presupuesto", jsonString);

            ViewBag.Marcas = _context.Celulares.Select(c => c.marca).Where(m => !string.IsNullOrEmpty(m)).Distinct().ToList();
            return View("Index", modelo);
        }

        // Nueva acción para mostrar el resumen desde sesión
        [HttpGet]
        public IActionResult Resumen()
        {
            var jsonString = HttpContext.Session.GetString("Presupuesto");
            if (string.IsNullOrEmpty(jsonString))
            {
                return RedirectToAction("Index");
            }

            var modelo = JsonSerializer.Deserialize<PresupuestoConsultaViewModel>(jsonString);
            if (modelo == null)
            {
                return RedirectToAction("Index");
            }

            return View(modelo);
        }

        [HttpGet]
        public JsonResult ObtenerModelos(string Marca)
        {
            var modelos = _context.Celulares
                .Where(c => c.marca == Marca)
                .Select(c => c.modelo)
                .Where(m => !string.IsNullOrEmpty(m))
                .Distinct()
                .ToList();

            return Json(modelos);
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
                Console.WriteLine($"Error al obtener clave pública: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("crear-preferencia")]
        public async Task<IActionResult> CrearPreferencia([FromBody] CrearPreferenciaDto preferenciaData)
        {
            try
            {
                // Debug logging
                Console.WriteLine("🔧 Endpoint crear-preferencia llamado");
                Console.WriteLine($"🔧 Datos recibidos: {JsonSerializer.Serialize(preferenciaData)}");
                Console.WriteLine($"🔧 Items count: {preferenciaData?.Items?.Count ?? 0}");
                
                // Validar modelo
                if (!ModelState.IsValid)
                {
                    Console.WriteLine("❌ ModelState inválido:");
                    foreach (var error in ModelState)
                    {
                        Console.WriteLine($"   - {error.Key}: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                    }
                    return BadRequest(new { success = false, message = "Datos inválidos", errors = ModelState });
                }
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
                        Success = $"{Request.Scheme}://{Request.Host}/payment-success",
                        Failure = $"{Request.Scheme}://{Request.Host}/payment-failure",
                        Pending = $"{Request.Scheme}://{Request.Host}/payment-pending"
                    },
                    AutoReturn = "approved",
                    PaymentMethods = new PreferencePaymentMethodsRequest
                    {
                        DefaultPaymentMethodId = null,
                        ExcludedPaymentTypes = new List<PreferencePaymentTypeRequest>(),
                        ExcludedPaymentMethods = new List<PreferencePaymentMethodRequest>(),
                        DefaultInstallments = 1
                    },
                    NotificationUrl = $"{Request.Scheme}://{Request.Host}/webhooks/mercadopago-checkout",
                    StatementDescriptor = "DRCELL",
                    ExternalReference = Guid.NewGuid().ToString(),
                    Expires = false,
                    ExpirationDateFrom = null,
                    ExpirationDateTo = null
                };

                var preference = await client.CreateAsync(request);
                
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
                return BadRequest(new { success = false, message = "Error al crear la preferencia de pago" });
            }
        }

        [HttpGet("payment-success")]
        public IActionResult PaymentSuccess()
        {
            return View("PaymentSuccess");
        }

        [HttpGet("payment-failure")]  
        public IActionResult PaymentFailure()
        {
            return View("PaymentFailure");
        }

        [HttpGet("payment-pending")]
        public IActionResult PaymentPending()
        {
            return View("PaymentPending");
        }

        [HttpPost("webhooks/mercadopago-checkout")]
        public async Task<IActionResult> WebhookMercadopagoCheckout([FromBody] object notification)
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

        [HttpPost("procesar-pago-tarjeta")]
        public async Task<IActionResult> ProcesarPagoTarjeta([FromBody] PagoTarjetaDto pagoTarjetaDto)
        {
            try
            {
                // Debug logging
                Console.WriteLine("🔧 Datos recibidos en ProcesarPagoTarjeta:");
                Console.WriteLine($"   - Name: '{pagoTarjetaDto.Name}'");
                Console.WriteLine($"   - Surname: '{pagoTarjetaDto.Surname}'");
                Console.WriteLine($"   - Email: '{pagoTarjetaDto.Email}'");
                Console.WriteLine($"   - ProductoId: {pagoTarjetaDto.ProductoId}");
                Console.WriteLine($"   - VarianteId: {pagoTarjetaDto.VarianteId}");
                Console.WriteLine($"   - CardToken: '{pagoTarjetaDto.CardToken}'");
                Console.WriteLine($"   - PaymentMethodId: '{pagoTarjetaDto.PaymentMethodId}'");

                // Validar modelo
                if (!ModelState.IsValid)
                {
                    Console.WriteLine("❌ ModelState es inválido:");
                    foreach (var error in ModelState)
                    {
                        Console.WriteLine($"   - {error.Key}: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                    }
                    return BadRequest(new { message = "Datos inválidos", errors = ModelState });
                }

                // Obtener el producto y variante desde la base de datos
                var producto = await _context.Productos
                    .Include(p => p.Variantes)
                    .FirstOrDefaultAsync(p => p.Id == pagoTarjetaDto.ProductoId);

                if (producto == null)
                {
                    return BadRequest(new { message = "Producto no encontrado" });
                }

                var variante = producto.Variantes
                    .FirstOrDefault(v => v.Id == pagoTarjetaDto.VarianteId);

                if (variante == null)
                {
                    return BadRequest(new { message = "Variante del producto no encontrada" });
                }

                // Validar stock disponible
                if (variante.Stock < pagoTarjetaDto.Cantidad)
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
                var precioTotal = variante.Precio * pagoTarjetaDto.Cantidad;

                // Crear el cliente de pagos
                var paymentClient = new PaymentClient();

                // Configurar la solicitud de pago
                var paymentCreateRequest = new PaymentCreateRequest
                {
                    TransactionAmount = precioTotal,
                    Token = pagoTarjetaDto.CardToken,
                    Description = $"{producto.Marca} {producto.Modelo} - {variante.Color} ({variante.Ram}/{variante.Almacenamiento})",
                    PaymentMethodId = pagoTarjetaDto.PaymentMethodId,
                    Installments = pagoTarjetaDto.Installments,
                    Payer = new PaymentPayerRequest
                    {
                        Email = pagoTarjetaDto.Email,
                        FirstName = pagoTarjetaDto.Name,
                        LastName = pagoTarjetaDto.Surname,
                        Identification = new IdentificationRequest
                        {
                            Type = pagoTarjetaDto.IdentificationType,
                            Number = pagoTarjetaDto.IdentificationNumber
                        }
                    },
                    AdditionalInfo = new PaymentAdditionalInfoRequest
                    {
                        Items = new List<PaymentItemRequest>
                        {
                            new PaymentItemRequest
                            {
                                Id = variante.Id.ToString(),
                                Title = $"{producto.Marca} {producto.Modelo}",
                                Description = $"{variante.Color} - {variante.Ram}/{variante.Almacenamiento}",
                                Quantity = pagoTarjetaDto.Cantidad,
                                UnitPrice = variante.Precio
                            }
                        },
                        Payer = new PaymentAdditionalInfoPayerRequest
                        {
                            FirstName = pagoTarjetaDto.Name,
                            LastName = pagoTarjetaDto.Surname,
                            Phone = new PhoneRequest
                            {
                                AreaCode = pagoTarjetaDto.AreaCode,
                                Number = pagoTarjetaDto.PhoneNumber
                            },
                            Address = !string.IsNullOrEmpty(pagoTarjetaDto.BillingAddress) ? new AddressRequest
                            {
                                StreetName = pagoTarjetaDto.BillingAddress,
                                ZipCode = pagoTarjetaDto.BillingZipCode ?? ""
                            } : null
                        }
                    },
                    ExternalReference = $"PROD_{producto.Id}_VAR_{variante.Id}_{DateTime.Now:yyyyMMddHHmmss}",
                    StatementDescriptor = "DrCell Store",
                    Metadata = new Dictionary<string, object>
                    {
                        ["producto_id"] = producto.Id,
                        ["variante_id"] = variante.Id,
                        ["cantidad"] = pagoTarjetaDto.Cantidad,
                        ["customer_name"] = $"{pagoTarjetaDto.Name} {pagoTarjetaDto.Surname}",
                        ["customer_email"] = pagoTarjetaDto.Email
                    }
                };

                // Procesar el pago
                Payment payment = await paymentClient.CreateAsync(paymentCreateRequest);

                // Crear la respuesta
                var response = new PagoTarjetaResponseDto
                {
                    Success = payment.Status == "approved",
                    Message = GetPaymentStatusMessage(payment.Status, payment.StatusDetail),
                    PaymentId = payment.Id,
                    Status = payment.Status ?? "unknown",
                    StatusDetail = payment.StatusDetail ?? "unknown",
                    Amount = payment.TransactionAmount ?? 0,
                    Currency = payment.CurrencyId ?? "COP",
                    DateCreated = payment.DateCreated,
                    DateApproved = payment.DateApproved,
                    TransactionId = payment.ExternalReference,
                    AuthorizationCode = payment.AuthorizationCode,
                    PaymentMethod = new PaymentMethodInfo
                    {
                        Id = payment.PaymentMethodId ?? "",
                        Type = payment.PaymentTypeId ?? "",
                        Name = payment.PaymentMethodId ?? "",
                        LastFourDigits = payment.Card?.LastFourDigits ?? "",
                        Installments = payment.Installments
                    },
                    Product = new ProductInfo
                    {
                        Id = producto.Id,
                        Name = $"{producto.Marca} {producto.Modelo}",
                        Variant = $"{variante.Color} - {variante.Ram}/{variante.Almacenamiento}",
                        Quantity = pagoTarjetaDto.Cantidad,
                        UnitPrice = variante.Precio,
                        TotalPrice = precioTotal
                    },
                    Customer = new CustomerInfo
                    {
                        Name = pagoTarjetaDto.Name,
                        Surname = pagoTarjetaDto.Surname,
                        Email = pagoTarjetaDto.Email,
                        Phone = $"{pagoTarjetaDto.AreaCode}{pagoTarjetaDto.PhoneNumber}",
                        Identification = $"{pagoTarjetaDto.IdentificationType}-{pagoTarjetaDto.IdentificationNumber}"
                    }
                };

                // Si el pago fue aprobado, reducir el stock
                if (payment.Status == "approved")
                {
                    variante.Stock -= pagoTarjetaDto.Cantidad;
                    _context.Update(variante);
                    await _context.SaveChangesAsync();

                    Console.WriteLine($"✅ Pago aprobado - ID: {payment.Id}, Monto: {payment.TransactionAmount}");
                }
                else
                {
                    Console.WriteLine($"❌ Pago no aprobado - Status: {payment.Status}, Detail: {payment.StatusDetail}");
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al procesar pago con tarjeta: {ex.Message}");
                return StatusCode(500, new PagoTarjetaResponseDto
                {
                    Success = false,
                    Message = "Error interno del servidor al procesar el pago",
                    Status = "error",
                    StatusDetail = ex.Message
                });
            }
        }

        private string GetPaymentStatusMessage(string? status, string? statusDetail)
        {
            return status switch
            {
                "approved" => "Pago aprobado exitosamente",
                "pending" => GetPendingMessage(statusDetail),
                "rejected" => GetRejectedMessage(statusDetail),
                "cancelled" => "Pago cancelado",
                "refunded" => "Pago reembolsado",
                "charged_back" => "Pago con contracargo",
                _ => "Estado de pago desconocido"
            };
        }

        private string GetPendingMessage(string? statusDetail)
        {
            return statusDetail switch
            {
                "pending_contingency" => "Pago pendiente por contingencia",
                "pending_review_manual" => "Pago pendiente de revisión manual",
                "pending_waiting_payment" => "Esperando el pago",
                "pending_waiting_transfer" => "Esperando transferencia",
                _ => "Pago pendiente de procesamiento"
            };
        }

        private string GetRejectedMessage(string? statusDetail)
        {
            return statusDetail switch
            {
                "cc_rejected_insufficient_amount" => "Fondos insuficientes",
                "cc_rejected_bad_filled_card_number" => "Número de tarjeta incorrecto",
                "cc_rejected_bad_filled_date" => "Fecha de vencimiento incorrecta",
                "cc_rejected_bad_filled_security_code" => "Código de seguridad incorrecto",
                "cc_rejected_bad_filled_other" => "Datos de tarjeta incorrectos",
                "cc_rejected_blacklist" => "Tarjeta en lista negra",
                "cc_rejected_call_for_authorize" => "Debe autorizar el pago con su banco",
                "cc_rejected_card_disabled" => "Tarjeta deshabilitada",
                "cc_rejected_duplicated_payment" => "Pago duplicado",
                "cc_rejected_high_risk" => "Pago rechazado por alto riesgo",
                "cc_rejected_max_attempts" => "Máximo de intentos alcanzado",
                _ => "Pago rechazado por el procesador"
            };
        }
    }
}
