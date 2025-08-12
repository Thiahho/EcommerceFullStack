using System.ComponentModel.DataAnnotations;

namespace EcommerceFS.Data.Modelos
{
    public class Auth
    {

        [Required,EmailAddress,StringLength(128,ErrorMessage ="El correo es muy corto.")]
        public required string Email { get; set; }
        [Required, StringLength(128, ErrorMessage = "La contraseña es muy corta.", MinimumLength =6)]
        public required string Password { get; set; }
    }
}
