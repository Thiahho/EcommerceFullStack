using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFullStack.Data.Modelos
{
    public class Productos
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Marca { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(1000)]
        public string Descripcion { get; set; } = string.Empty;
        
        [Column("images")]
        public byte[]? Images { get; set; }
        
        [Column("categoria_id")]
        public int? CategoriaId { get; set; }
        
        // Navigation properties
        public Categorias? Categoria { get; set; }
        public ICollection<ProductosVariantes> Variantes { get; set; } = new List<ProductosVariantes>();
    }
}
