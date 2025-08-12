using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFullStack.Data.Modelos
{
    public class ProductosVariantes
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        
        [Required]
        [Column("Stock")]
        public int Stock { get; set; }
        
        [Required]
        [Column("Precio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
        public decimal Precio { get; set; }
        
        [Column("Descuento")]
        [Range(0, 100, ErrorMessage = "El descuento debe estar entre 0 y 100")]
        public decimal Descuento { get; set; }
        
        [Column("Almacenamiento")]
        [MaxLength(50)]
        public string? Almacenamiento { get; set; }
        
        [Column("Ram")]
        [MaxLength(20)]
        public string? Ram { get; set; }
        
        [Column("Color")]
        [MaxLength(30)]
        public string? Color { get; set; }
        
        // Navigation properties
        public Productos? Producto { get; set; }
    }
}
