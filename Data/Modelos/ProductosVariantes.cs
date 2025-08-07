using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFullStack.Data.Modelos
{
    public class ProductosVariantes
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        [Required, Column("stock")] public int Stock { get; set; }
        [Required, Column("precio")] public decimal Precio { get; set; }
        [Column("descuento")] public decimal Descuento { get; set; }
        [Column("descripcion")] public string? Descripcion { get; set; }
        [Column("nombre")] public string? Nombre { get; set; }
        [Column("almacenamiento")] public string? Almacenamiento { get; set; }
        [Required,Column("color")]public string? Color { get; set; }
        public Productos? Producto { get; set; }
    }
}
