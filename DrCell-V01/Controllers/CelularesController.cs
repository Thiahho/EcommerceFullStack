using DrCell_V01.Data;
using DrCell_V01.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
namespace DrCell_V01.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [EnableRateLimiting("AuthPolicy")]
    public class CelularesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IvCelularesInfoService _celularesService;
        public CelularesController(ApplicationDbContext context, IvCelularesInfoService celularesService)
        {
            _context = context;
            _celularesService = celularesService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCelulares()
         => Ok(await _celularesService.ObtenerCelularesInfoAsync());

        [HttpGet("marcas")]
        public async Task<IActionResult> GetMarcas()
            => Ok(await _celularesService.ObtenerMarcasAsync());

        [HttpGet("modelos")]
        public async Task<IActionResult> GetModelos()
            => Ok(await _celularesService.ObtenerModelosAsync());
    
        [HttpGet("modelos/{marca}")]
        public async Task<IActionResult> GetModelosPorMarca(string marca) 
            => Ok(await _celularesService.ObtenerCelularesInfoByMarcaAsync(marca));

        [HttpGet("celulares/buscar/{marca}/{modelo}")]
        public async Task<IActionResult> GetModulosByModelo(string marca, string modelo)
            => Ok(await _celularesService.ObtenerCelularesInfoByModeloYMarcaAsync(marca, modelo));

        [HttpGet("vista-completa")]
        public async Task<IActionResult> GetVistaCompleta()
        {
            try
            {
                var resultado = await _context.vCelularesMBP
                    .Take(50) // Limitar a 50 registros para no sobrecargar
                    .Select(v => new{
                        v.marca,
                        v.modelo,
                        v.arreglomodulo,
                        v.arreglobat,
                        v.arreglopin,
                        v.color,
                        v.tipo,
                        v.placa,
                    })
                    .ToListAsync();
                return Ok(new{
                    success = true,
                    message = "Vista completa obtenida correctamente",
                    count = resultado.Count,
                    data = resultado
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new{
                    success = false,
                    message = "Error al obtener la vista completa",
                    error = ex.Message
                });
            }
        }

        [HttpGet("buscar")]
        public async Task<IActionResult> BuscarReparaciones([FromQuery] string? termino = null, [FromQuery] string? marca = null, [FromQuery] string? modelo = null)
        {
            try
            {
                var query = _context.vCelularesMBP.AsQueryable();

                if (!string.IsNullOrEmpty(termino))
                {
                    query = query.Where(v => 
                        (v.marca != null && EF.Functions.ILike(v.marca, $"%{termino}%")) || 
                        (v.modelo != null && EF.Functions.ILike(v.modelo, $"%{termino}%"))
                    );
                }

                if (!string.IsNullOrEmpty(marca))
                {
                    query = query.Where(v => v.marca == marca);
                }

                if (!string.IsNullOrEmpty(modelo))
                {
                    query = query.Where(v => v.modelo == modelo);
                }

                var resultado = await query
                    .Take(100) // Limitar resultados
                    .Select(v => new
                    {
                        v.marca,
                        v.modelo,
                        v.arreglomodulo,
                        v.arreglobat,
                        v.arreglopin,
                        v.color,
                        v.tipo,
                        v.tipopin,
                        v.placa,
                        v.marco,
                        v.version
                     })
                    .ToListAsync();

            return Ok(new{
                success = true,
                message = "Busqueda realizada correctamente",
                count = resultado.Count,
                filters = new { termino, marca, modelo },
                data = resultado
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new{
                success = false,
                message = "Error al realizar la busqueda",
                error = ex.Message
            });
            }
        }


        
    }
}
