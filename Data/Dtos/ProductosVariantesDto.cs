using EcommerceFullStack.Data.Modelos;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EcommerceFullStack.Data.Dtos
{
    public class ProductosVariantesDto
    {
        public int Id { get; set; }
        
        [Required]
        public int ProductoId { get; set; }
        
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "El stock debe ser mayor o igual a 0")]
        public int Stock { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
        public decimal Precio { get; set; }
        
        [Range(0, 100, ErrorMessage = "El descuento debe estar entre 0 y 100")]
        public decimal Descuento { get; set; }
        
        [MaxLength(50)]
        public string? Almacenamiento { get; set; }
        
        [MaxLength(20)]
        public string? Ram { get; set; }
        
        [MaxLength(30)]
        public string? Color { get; set; }
        
        // Navigation property (opcional para evitar referencias circulares)
        public ProductoDto? Producto { get; set; }
    }
}
