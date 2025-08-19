using System.ComponentModel.DataAnnotations;

namespace DrCell_V02.Data.Dtos
{
    public class PagoTarjetaDto
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

        public string IdentificationType { get; set; } = "DNI";

        [Required(ErrorMessage = "El número de identificación es requerido")]
        public string IdentificationNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "El ID del producto es requerido")]
        public int ProductoId { get; set; }

        [Required(ErrorMessage = "El ID de la variante es requerido")]
        public int VarianteId { get; set; }

        [Required(ErrorMessage = "La cantidad es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public int Cantidad { get; set; }

        // Información de la tarjeta
        [Required(ErrorMessage = "El token de la tarjeta es requerido")]
        public string CardToken { get; set; } = string.Empty;

        [Required(ErrorMessage = "El método de pago es requerido")]
        public string PaymentMethodId { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo de documento del tarjetahabiente es requerido")]
        public string CardholderIdentificationType { get; set; } = string.Empty;

        [Required(ErrorMessage = "El número de documento del tarjetahabiente es requerido")]
        public string CardholderIdentificationNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre del tarjetahabiente es requerido")]
        public string CardholderName { get; set; } = string.Empty;

        // Cuotas (opcional, por defecto 1)
        public int Installments { get; set; } = 1;

        // Información de dirección de facturación (opcional pero recomendado)
        public string? BillingAddress { get; set; }
        public string? BillingCity { get; set; }
        public string? BillingState { get; set; }
        public string? BillingZipCode { get; set; }
        public string? BillingCountry { get; set; } = "AR";
    }
}
