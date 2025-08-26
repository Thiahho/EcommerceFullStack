using DrCell_V02.Data.Dtos;
using DrCell_V02.Data.Modelos;

namespace DrCell_V02.Services.Interface
{
    public interface IVentaService
    {
        Task<VentaDto> GetVentaByIdAsync(int id);
        Task<IEnumerable<VentaDto>> GetAllVentasAsync();
    }
}