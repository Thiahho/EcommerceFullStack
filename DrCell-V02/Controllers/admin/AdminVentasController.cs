using DrCell_V02.Data;
using DrCell_V02.Data.Dtos;
using DrCell_V02.Data.Modelos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MercadoPago.Client.Common;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MercadoPago.Resource.Payment;
using MercadoPago.Resource.Preference;
using System.Text.Json;
using DrCell_V02.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

namespace DrCell_V02.Controllers.admin
{
    [Route("admin/ventas")]
    [ApiController]
    //[Authorize(Roles = "ADMIN")]
    [EnableRateLimiting("AuthPolicy")]
    public class AdminVentasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AdminVentasController> _logger;
        private readonly IVentaService _ventaService;
        public AdminVentasController(ApplicationDbContext context, IConfiguration configuration, ILogger<AdminVentasController> logger, IVentaService ventaService)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _ventaService = ventaService;
            _configuration = configuration;
        }

        [HttpGet("GetAll")]
        [EnableRateLimiting("CriticalPolicy")]
        public virtual async Task<ActionResult<IEnumerable<VentaDto>>> GetAll()
        {
            try
            {
                var ventas = await _ventaService.GetAllVentasAsync();
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las ventas");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("GetById/{id}")]
        [EnableRateLimiting("CriticalPolicy")]
        public virtual async Task<ActionResult<VentaDto>> GetById(int id)
        {
            try
            {
                var venta = await _ventaService.GetVentaByIdAsync(id);
                if (venta == null)
                {
                    return NotFound($"No se encontró la venta con ID {id}");
                }
                return Ok(venta);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener la venta {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }


    }
}