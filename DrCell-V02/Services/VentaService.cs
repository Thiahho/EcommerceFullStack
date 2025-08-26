using AutoMapper;
using DrCell_V02.Data;
using DrCell_V02.Data.Dtos;
using DrCell_V02.Data.Modelos;
using DrCell_V02.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace DrCell_V02.Services
{
    public class VentaService : IVentaService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public VentaService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<VentaDto>> GetAllVentasAsync()
        {
            var variantes = await _context.Ventas
                .Include(v => v.Items) // Incluir los items de la venta
                .ThenInclude(vi => vi.Variante) // Incluir la variante de cada item
                .ToListAsync();

            return _mapper.Map<IEnumerable<VentaDto>>(variantes);
        }


        public async Task<VentaDto> GetVentaByIdAsync(int id)
        {
            var producto = await _context.Ventas.Include(v => v.Items)
                .ThenInclude(vi => vi.Variante)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (producto == null) return null;

            return new VentaDto
            {
                Id = producto.Id,
                PreferenceId = producto.PreferenceId,
                PaymentId = producto.PaymentId,
                MontoTotal = producto.MontoTotal,
                Estado = producto.Estado,
                FechaVenta = producto.FechaVenta,
                Items = _mapper.Map<List<VentaItemDto>>(producto.Items).ToList()
            };
            
        }
    }
}
