using EcommerceFullStack.Data.Modelos;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EcommerceFullStack.Data.Dtos
{
    public class ProductosVariantesDto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        [Required, Column("stock")] public int Stock { get; set; }
        [Required, Column("precio")] public decimal Precio { get; set; }
        [Column("descuento")] public decimal Descuento { get; set; }
        [Column("descripcion")] public string? Descripcion { get; set; }
        [Column("almacenamiento")] public string? Almacenamiento { get; set; }
        [Required, Column("color")] public string? Color { get; set; }
        public ProductoDto? Producto { get; set; }
    }
}
