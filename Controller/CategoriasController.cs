using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.RateLimiting;
using EcommerceFullStack.Data;
using EcommerceFullStack.Services.Interfaces;
using EcommerceFullStack.Data.Modelos;
using EcommerceFullStack.Data.Dtos;
namespace EcommerceFullStack.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    //[EnableRateLimiting("AuthPolicy")]
    public class CategoriasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IProductoService _productoService;
        private readonly ICategoriaService _categoriaService;
        private readonly ILogger<CategoriasController> _logger;
        public CategoriasController(ApplicationDbContext context, IConfiguration config, IProductoService productoService, ICategoriaService categoriaService, ILogger<CategoriasController> logger)
        {
            _context = context;
            _configuration = config;
            _productoService = productoService;
            _categoriaService = categoriaService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CrearCategoria([FromBody] CategoriaDto categoria)
        {
            try
            {
                var nuevaCategoria = await _categoriaService.AddCategoriaAsync(categoria);
                return CreatedAtAction(nameof(GetCategoriaById), new { id = nuevaCategoria.Id }, nuevaCategoria);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la categoria");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> ActualizarCategoria(int id, [FromBody] CategoriaDto categoria)
        {
            try
            {
                if (id != categoria.Id)
                {
                    return BadRequest("El ID de la categoria no coincide");
                }

                var categoriaExistente = await _categoriaService.GetCategoriaByIdAsync(id);
                if (categoriaExistente == null)
                {
                    return NotFound("Categoria no encontrada");
                }

                categoriaExistente.Nombre = categoria.Nombre;
                await _categoriaService.UpdateCategoriaAsync(categoriaExistente);
                return Ok(categoriaExistente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la categoria");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN")]
       // [EnableRateLimiting("CriticalPolicy")]
        public async Task<IActionResult> EliminarCategoria(int id)
        {
            try
            {
                var categoriaExistente = await _categoriaService.GetCategoriaByIdAsync(id);
                if (categoriaExistente == null)
                {
                    return NotFound("Categoria no encontrada");
                }

                await _categoriaService.DeleteCategoriaAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la categoria");
                return StatusCode(500, "Error interno del servidor");
            }

        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetCategorias()
        {
            try
            {
                var categorias = await _categoriaService.GetAllCategoriasAsync();
                return Ok(categorias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las categorias");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [AllowAnonymous]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCategoriaById(int id)
        {
            try
            {
                var categoria = await _categoriaService.GetCategoriaByIdAsync(id);
                if (categoria == null)
                {
                    return NotFound("Categoria no encontrada");
                }
                return Ok(categoria);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la categoria por id");
                return StatusCode(500, "Error interno del servidor");
            }
        }

    }
}
