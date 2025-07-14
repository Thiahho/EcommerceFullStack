using DrCell_V01.Data.Modelos;

namespace DrCell_V01.Services.Interface
{
    public interface IModulosService
    {

        //////
        //MODULOS
        Task<List<object>> ObtenerModulosAsync();
        Task<List<object>> ObtenerModulosByMarcaAsync(string marca);
        Task<List<object>> ObtenerModulosByModeloAsync(string modelo);
        Task<List<object>> ObtenerModulosByModeloYMarcaAsync(string marca, string modelo);

        Task<Modulos?> GetModuloByIdAsync(int id);
        Task UpdateAsync(Modulos modulo);
        Task DeleteAsync(int id);
        Task<bool> ExistsModuloAsync(string marca, string modelo);
        Task<Modulos> AddAsync(Modulos modulo);
    }
}
