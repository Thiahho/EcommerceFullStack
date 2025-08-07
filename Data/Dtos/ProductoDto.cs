using EcommerceFullStack.Data.Modelos;

namespace EcommerceFullStack.Data.Dtos
{
    public class ProductoDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Marca { get; set; }
        //public decimal Precio { get; set; }
        //public decimal Descuento { get; set; }
        public string Descripcion { get; set; }
        public string? Images { get; set; }
        public int CategoriaId { get; set; }
        public Categorias Categoria { get; set; }
        public List<ProductosVariantesDto> Variantes { get; set; } = new();

    }
}
