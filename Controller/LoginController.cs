using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.RateLimiting;
using EcommerceFullStack.Data;
using EcommerceFullStack.Services.Interfaces;
using EcommerceFullStack.Data.Modelos;
namespace EcommerceFS.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
   // [EnableRateLimiting("AuthPolicy")]
    public class LoginController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IUsuarioService _usuarioService;
        public LoginController(ApplicationDbContext context, IConfiguration config, IUsuarioService usuarioService)
        {
            _context = context;
            _configuration = config;
            _usuarioService = usuarioService;
        }

        [HttpPost("registro")]
        //[RateLimit("registro", 2, 10)]
        public async Task<IActionResult> CrearAdmin([FromBody] Usuarios usuario)
        {
            try
            {
                if (string.IsNullOrEmpty(usuario.Email) || string.IsNullOrEmpty(usuario.Password))
                {
                    return BadRequest(new { message = "Email y contraseña son requeridos" });
                }

                usuario.Rol = "ADMIN";
                var usuarioCreado = await _usuarioService.CrearUsuarioAsync(usuario);

                return Ok(new
                {
                    message = "Administrador creado correctamente",
                    usuario = new
                    {
                        id = usuarioCreado.Id,
                        email = usuarioCreado.Email,
                        rol = usuarioCreado.Rol
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el administrador", error = ex.Message });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        //[RateLimit("login", 3, 5)]
        public async Task<IActionResult> Login([FromBody] Auth auth)
        {
            try
            {
                if (string.IsNullOrEmpty(auth.Email) || string.IsNullOrEmpty(auth.Password))
                {
                    return BadRequest("Email y contraseña son requeridos");
                }

                var usuario = await _usuarioService.ValidarCredencialesAsync(auth.Email, auth.Password);

                if (usuario == null)
                {
                    return Unauthorized(new { message = "Credenciales inválidas" });
                }

                if (usuario.Rol?.ToUpper() != "ADMIN")
                {
                    return Unauthorized(new { message = "No tienes permisos de administrador" });
                }

                var token = _usuarioService.GenerarToken(usuario);

                // Configurar cookie httpOnly
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, // Solo en HTTPS
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddHours(24), // Expira en 24 horas
                    Path = "/"
                };

                // En desarrollo, permitir HTTP
                if (_configuration["ASPNETCORE_ENVIRONMENT"] == "Development")
                {
                    cookieOptions.Secure = false;
                }

                Response.Cookies.Append("AuthToken", token, cookieOptions);

                return Ok(new
                {
                    message = "Inicio de sesión exitoso",
                    usuario = new
                    {
                        id = usuario.Id,
                        email = usuario.Email,
                        rol = usuario.Rol
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al iniciar sesión", error = ex.Message });
            }
        }

        [HttpPost("logout")]
        [AllowAnonymous]
        public IActionResult Logout()
        {
            try
            {
                // Eliminar cookie de autenticación
                Response.Cookies.Delete("AuthToken");

                return Ok(new { message = "Sesión cerrada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cerrar sesión", error = ex.Message });
            }
        }

        [HttpGet("verify")]
        [AllowAnonymous]
        public IActionResult VerifySession()
        {
            try
            {
                // Verificar si hay token en cookies
                if (Request.Cookies.TryGetValue("AuthToken", out var token))
                {
                    // El middleware JwtCookieMiddleware ya habrá validado el token
                    // Si llegamos aquí y hay token, significa que es válido
                    if (User.Identity?.IsAuthenticated == true)
                    {
                        return Ok(new
                        {
                            isAuthenticated = true,
                            usuario = new
                            {
                                id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                                email = User.FindFirst(ClaimTypes.Email)?.Value,
                                rol = User.FindFirst(ClaimTypes.Role)?.Value
                            }
                        });
                    }
                }

                return Ok(new { isAuthenticated = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al verificar sesión", error = ex.Message });
            }
        }

        private async Task<bool> AlreadyExist(string email)
        {
            return await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        // ============================= ENDPOINTS PROTEGIDOS =============================



    }
}
