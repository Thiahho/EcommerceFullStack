using System.ComponentModel.DataAnnotations;
using EcommerceFullStack.Data.Modelos;

namespace EcommerceFullStack.Data.Dtos
{
    public class ProductoDto
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
        
        [MaxLength(1000000)] // 1MB max para imagen base64
        public string? Images { get; set; }
        
        [Required]
        public int CategoriaId { get; set; }
        
        public Categorias? Categoria { get; set; }
        
        public List<ProductosVariantesDto> Variantes { get; set; } = new();
        
        // Métodos de utilidad
        public int GetTotalStock()
        {
            return Variantes?.Sum(v => v.Stock) ?? 0;
        }

        public decimal? GetBasePrice()
        {
            return Variantes?.Min(v => v.Precio);
        }

        public IEnumerable<string> GetAvailableRAM()
        {
            return Variantes?.Select(v => v.Ram)
                .Where(r => !string.IsNullOrEmpty(r))
                .Distinct()
                .OrderBy(r => r) ?? Enumerable.Empty<string>();
        }

        public IEnumerable<string> GetAvailableStorage(string ram)
        {
            return Variantes?.Where(v => v.Ram == ram)
                .Select(v => v.Almacenamiento)
                .Where(s => !string.IsNullOrEmpty(s))
                .Distinct()
                .OrderBy(s => s) ?? Enumerable.Empty<string>();
        }

        public IEnumerable<string> GetAvailableColors(string ram, string storage)
        {
            return Variantes?.Where(v => v.Ram == ram && v.Almacenamiento == storage)
                .Select(v => v.Color)
                .Where(c => !string.IsNullOrEmpty(c))
                .Distinct()
                .OrderBy(c => c) ?? Enumerable.Empty<string>();
        }
    }
}
