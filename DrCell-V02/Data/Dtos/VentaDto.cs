

namespace DrCell_V02.Data.Dtos
{
    public class VentaDto
    {
        public int Id { get; set; }
        public string PreferenceId { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public decimal MontoTotal { get; set; }
        public string Estado { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED
        public DateTime FechaVenta { get; set; } = DateTime.UtcNow;

        // Items vendidos
        public List<VentaItemDto> Items { get; set; } = new List<VentaItemDto>();
    }

    public class VentaItemDto
    {
        public int Id { get; set; }
        public int VentaId { get; set; }
        public int VarianteId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }
}