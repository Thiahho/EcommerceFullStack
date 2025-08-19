using System.ComponentModel.DataAnnotations;

namespace DrCell_V02.Data.Dtos
{
    public class EnviarPagoCarritoDto
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

        [Required(ErrorMessage = "Los items del carrito son requeridos")]
        public List<CarritoItemDto> Items { get; set; } = new();

        [Required(ErrorMessage = "El precio total es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio total debe ser mayor a 0")]
        public decimal TotalPrice { get; set; }
    }

    public class CarritoItemDto
    {
        [Required(ErrorMessage = "El ID del producto es requerido")]
        public int ProductoId { get; set; }

        [Required(ErrorMessage = "El ID de la variante es requerido")]
        public long VarianteId { get; set; }

        [Required(ErrorMessage = "La cantidad es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public int Cantidad { get; set; }

        [Required(ErrorMessage = "El precio es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
        public decimal Precio { get; set; }

        [Required(ErrorMessage = "La descripción es requerida")]
        public string Descripcion { get; set; } = string.Empty;
    }
}
