namespace DrCell_V02.Data.Dtos
{
    public class PagoTarjetaResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public long? PaymentId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string StatusDetail { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "COP";
        public DateTime? DateCreated { get; set; }
        public DateTime? DateApproved { get; set; }
        public string? TransactionId { get; set; }
        public string? AuthorizationCode { get; set; }
        public PaymentMethodInfo? PaymentMethod { get; set; }
        public ProductInfo? Product { get; set; }
        public CustomerInfo? Customer { get; set; }
    }

    public class PaymentMethodInfo
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? LastFourDigits { get; set; }
        public int? Installments { get; set; }
    }

    public class ProductInfo
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Variant { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class CustomerInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Identification { get; set; } = string.Empty;
    }
}
