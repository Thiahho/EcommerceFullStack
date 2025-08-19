using System.ComponentModel.DataAnnotations;

namespace DrCell_V02.Data.Dtos
{
    public class EnviarPagoDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "El apellido es requerido")]
        public string Surname { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "El código de área es requerido")]
        public string AreaCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "El número de teléfono es requerido")]
        public string PhoneNumber { get; set; } = string.Empty;

        public string? IdentificationType { get; set; } = "CC";

        [Required(ErrorMessage = "El número de identificación es requerido")]
        public string IdentificationNumber { get; set; } = string.Empty;

        // Información del producto y variante seleccionada
        [Required(ErrorMessage = "El ID del producto es requerido")]
        public int ProductoId { get; set; }

        [Required(ErrorMessage = "El ID de la variante es requerido")]
        public long VarianteId { get; set; }

        [Required(ErrorMessage = "La cantidad es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public int Cantidad { get; set; } = 1;
    }
}
