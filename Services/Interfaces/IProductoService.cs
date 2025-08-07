using EcommerceFullStack.Data.Dtos;

namespace EcommerceFullStack.Services.Interfaces
{
    public interface IProductoService
    {
        Task<IEnumerable<ProductoDto>> GetAllVariantesAsync();
        Task<ProductoDto?> GetByIdVarianteAsync(int id);
        Task<ProductoDto> AddAsyncProducto(ProductoDto productos);
        Task<ProductosVariantesDto> AddVarianteAsync(ProductosVariantesDto productosVariantesDto);
        Task UpdateProductoAsync(ProductoDto productoDto);
        Task DeleteProductoAsync(int id);
        Task<ProductosVariantesDto?> GetVarianteSpecAsync(int productId, int stock, decimal precio, string color, decimal descuento, string descripcion, string almacenamiento);
        Task<ProductosVariantesDto?> GetVarianteByIdAsync(int varianteId);
        Task<IEnumerable<string>> GetDistintAlmacenamientosAsync(string almacenamiento, int productId);
        Task<IEnumerable<string>> GetDistintColorAsync(string almacenamiento, int productId);
        Task<IEnumerable<ProductoDto>> GetAllProductsAsync();

        // Nuevos métodos
        Task UpdateVarianteAsync(ProductosVariantesDto variante);
        Task DeleteVarianteAsync(int varianteId);
        Task<bool> ExistsVarianteAsync(int productoId,string nombre, int stock, decimal precio, string color, decimal descuento, string descripcion, string almacenamiento);
        Task<bool> ExistsProductoAsync(string marca, string nombre);
    }
}
