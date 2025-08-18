using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DrCell_V02.Middleware
{
    /// <summary>
    /// Middleware para manejar autenticación JWT con cookies httpOnly
    /// Extrae el token JWT de las cookies y lo agrega al header Authorization
    /// </summary>
    public class JwtCookieMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;
        private readonly ILogger<JwtCookieMiddleware> _logger;

        public JwtCookieMiddleware(RequestDelegate next, IConfiguration configuration, ILogger<JwtCookieMiddleware> logger)
        {
            _next = next;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Verificar si hay token en cookies
                if (context.Request.Cookies.TryGetValue("AuthToken", out var token))
                {
                    // Validar el token JWT
                    if (ValidateJwtToken(token))
                    {
                        // Agregar el token al header Authorization para que el middleware JWT predeterminado lo procese
                        context.Request.Headers.Add("Authorization", $"Bearer {token}");
                        _logger.LogDebug("Token JWT extraído de cookie y agregado al header Authorization");
                    }
                    else
                    {
                        _logger.LogWarning("Token JWT en cookie es inválido o expirado");
                        // Limpiar cookie inválida
                        context.Response.Cookies.Delete("AuthToken");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar token JWT de cookie");
            }

            await _next(context);
        }

        /// <summary>
        /// Valida si el token JWT es válido
        /// </summary>
        private bool ValidateJwtToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["JWT:Secret"] ?? "");
                
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["JWT:ValidIssuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["JWT:ValidAudience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Token JWT inválido: {Message}", ex.Message);
                return false;
            }
        }
    }
} 