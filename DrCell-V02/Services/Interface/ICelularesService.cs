using DrCell_V01.Data.Modelos;

namespace DrCell_V01.Services.Interface
{
    public interface ICelularesService
    {
        Task<List<object>> ObtenerEquiposUnicosAsync();
        Task<List<string>> ObtenerMarcasAsync();
        Task<List<string>> ObtenerModelosAsync();
        Task<List<string>> ObtenerModelosPorMarcaAsync(string marca);
        Task<List<object>> ObtenerInfoPorMarcaYModeloAsync(string marca, string modelo);

    }
}
