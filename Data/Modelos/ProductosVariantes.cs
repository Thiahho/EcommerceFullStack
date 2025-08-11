using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFullStack.Data.Modelos
{
    public class ProductosVariantes
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        
        [Required]
        [Column("stock")]
        public int Stock { get; set; }
        
        [Required]
        [Column("precio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
        public decimal Precio { get; set; }
        
        [Column("descuento")]
        [Range(0, 100, ErrorMessage = "El descuento debe estar entre 0 y 100")]
        public decimal Descuento { get; set; }
        
        [Column("descripcion")]
        [MaxLength(500)]
        public string? Descripcion { get; set; }
        
        [Column("almacenamiento")]
        [MaxLength(50)]
        public string? Almacenamiento { get; set; }
        
        [Column("ram")]
        [MaxLength(20)]
        public string? Ram { get; set; }
        
        [Column("color")]
        [MaxLength(30)]
        public string? Color { get; set; }
        
        // Navigation properties
        public Productos? Producto { get; set; }
    }
}
