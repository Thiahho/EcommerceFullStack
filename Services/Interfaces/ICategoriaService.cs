    using EcommerceFullStack.Data.Dtos;

    namespace EcommerceFullStack.Services.Interfaces
    {
    public interface ICategoriaService
    {
        Task<CategoriaDto> GetCategoriaByIdAsync(int id);
        Task<CategoriaDto> AddCategoriaAsync(CategoriaDto categoriaDto);
        Task UpdateCategoriaAsync(CategoriaDto categoriaDto);
        Task DeleteCategoriaAsync(int id);

        //Task<CategoriaDto?> GetCategoriasAsync(int id);  
        Task<IEnumerable<CategoriaDto>> GetAllCategoriasAsync();

    }
}
