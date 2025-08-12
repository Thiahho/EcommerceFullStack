using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS.Data.Modelos
{
    public class Productos
    {
        public int Id { get; set; }
        
        [Required]
        [Column("Nombre")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;
        
        [Required]
        [Column("Marca")]
        [MaxLength(50)]
        public string Marca { get; set; } = string.Empty;
        
        [Required]
        [Column("Descripcion")]
        [MaxLength(1000)]
        public string Descripcion { get; set; } = string.Empty;
        
        [Column("Images")]
        public byte[]? Images { get; set; }
        
        [Column("CategoriaId")]
        public int? CategoriaId { get; set; }
        
        // Navigation properties
        public Categorias? Categoria { get; set; }
        public ICollection<ProductosVariantes> Variantes { get; set; } = new List<ProductosVariantes>();
    }
}
