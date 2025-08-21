using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DrCell_V02.Data.Modelos
{
    [Table("ventas")]
    public class Venta
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)][Column("preference_id")]
        public string PreferenceId { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)][Column("payment_id")]
        public string PaymentId { get; set; } = string.Empty;

        [Required][Column("monto_total")]
        public decimal MontoTotal { get; set; }

        [Required]
        [MaxLength(20)][Column("estado")]
        public string Estado { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED

        [Required][Column("fecha_venta")]
        public DateTime FechaVenta { get; set; } = DateTime.UtcNow;

        // Items vendidos
        public ICollection<VentaItem> Items { get; set; } = new List<VentaItem>();
    }


}