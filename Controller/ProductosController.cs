using EcommerceFullStack.Data.Dtos;
using EcommerceFullStack.Data.Modelos;
using EcommerceFullStack.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Drawing;
using System.Runtime.Intrinsics.Arm;

namespace EcommerceFullStack.Controller
{
    [ApiController]
    [Route("Productos")]
    //[EnableRateLimiting("AuthPolicy")]
    public class ProductosController : ControllerBase
    {

        private readonly IProductoService _productoService;
        private readonly ILogger<ProductosController> _logger;

        public ProductosController(IProductoService productoService, ILogger<ProductosController> logger)
        {
            _logger = logger;
            _productoService = productoService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoDto>>> GetAll()
        {
            try
            {
                var productos = await _productoService.GetAllProductsAsync();
                return Ok(productos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los productos");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoDto>> GetById(int id)
        {
            try
            {
                var producto = await _productoService.GetByIdVarianteAsync(id);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {id}");
                }
                return Ok(producto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el producto {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [AllowAnonymous]
        [HttpGet("variantes")]
        public async Task<ActionResult<IEnumerable<ProductosVariantesDto>>> GetAllVariantes()
        {
            try
            {
                var variantes = await _productoService.GetAllVariantesAsync();
                return Ok(variantes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las variantes");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [AllowAnonymous]
        [HttpGet("{productoId}/variantes")]
        public async Task<ActionResult<IEnumerable<ProductosVariantesDto>>> GetVariantesAsync(int productoId)
        {
            try
            {
                var variantes = await _productoService.GetVariantesByProductIdAsync(productoId);
                return Ok(variantes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener variantes para el producto {productoId}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("{productoId}/Ram-Opciones")]
        public async Task<ActionResult<IEnumerable<string>>> GetDistinctRamAsync(int productoId)
        {
            try
            {
                var producto = await _productoService.GetByIdVarianteAsync(productoId);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {productoId}");
                }
                var opciones = producto.GetAvailableRAM();
                return Ok(opciones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("{productoId}/Almacenamiento-Opciones")]
        public async Task<ActionResult<IEnumerable<string>>> GetDistinctAlmacenamientosAsync(int productoId, [FromQuery] string ram)
        {
            try
            {
                var producto = await _productoService.GetByIdVarianteAsync(productoId);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {productoId}");
                }
                var almacenamientos = producto.GetAvailableStorage(ram);
                return Ok(almacenamientos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("{productoId}/Color-Opciones")]
        public async Task<ActionResult<IEnumerable<string>>> GetDistinctColorsAsync(int productoId, [FromQuery] string ram, [FromQuery] string almacenamiento)
        {
            try
            {
                var producto = await _productoService.GetByIdVarianteAsync(productoId);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {productoId}");
                }
                var colores = producto.GetAvailableColors(ram, almacenamiento);
                return Ok(colores);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("{productId}/variante")]
        public async Task<ActionResult<ProductosVariantesDto>> GetVarianteSpecAsync(
            int productId,
            [FromQuery] string ram,
            [FromQuery] string storage,
            [FromQuery] string color,
            [FromQuery] decimal precio,
            [FromQuery] int stock,
            [FromQuery] decimal descuento,
            [FromQuery] string descripcion,
            [FromQuery] string almacenamiento)
        {
            try
            {
                var variante = await _productoService.GetVarianteSpecAsync(
                    productId,
                    stock,
                    precio,
                    color,
                    descuento,
                    almacenamiento,
                    ram);
                if (variante == null)
                {
                    return NotFound($"No se encontró la variante con las especificaciones solicitadas");
                }
                return Ok(variante);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        //[EnableRateLimiting("CriticalPolicy")]
        public async Task<ActionResult<ProductoDto>> Create([FromBody] ProductoDto producto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nuevoProducto = await _productoService.AddAsyncProducto(producto);
                return CreatedAtAction(nameof(GetById), new { id = nuevoProducto.Id }, nuevoProducto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el producto");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductoDto productoDto)
        {
            try
            {
                if (id != productoDto.Id)
                    return BadRequest("El ID del producto no coincide");

                // Obtener el producto existente
                var existingProducto = await _productoService.GetByIdVarianteAsync(id);
                if (existingProducto == null)
                    return NotFound($"No se encontró el producto con ID {id}");

                // Si no se proporciona una nueva imagen, mantener la existente
                if (string.IsNullOrEmpty(productoDto.Images))
                    productoDto.Images= existingProducto.Images;

                await _productoService.UpdateProductoAsync(productoDto);
                return Ok(productoDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el producto {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
      //  [EnableRateLimiting("CriticalPolicy")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var producto = await _productoService.GetByIdVarianteAsync(id);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {id}");
                }

                await _productoService.DeleteProductoAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el producto {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("variante/{id}")]
        public async Task<ActionResult<ProductosVariantesDto>> GetVarianteById(int id)
        {
            try
            {
                var variante = await _productoService.GetVarianteByIdAsync(id);
                if (variante == null)
                {
                    return NotFound($"No se encontró la variante con ID {id}");
                }
                return Ok(variante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener la variante {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPost("variante")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateVariante([FromBody] ProductosVariantesDto varianteDto)
        {
            try
            {
                // Verificar si ya existe una variante con las mismas especificaciones usando ExistsVarianteAsync
                var exists = await _productoService.ExistsVarianteAsync(
                    varianteDto.ProductoId,
                    varianteDto.Stock,
                    varianteDto.Precio,
                    varianteDto.Color,
                    varianteDto.Descuento,
                    varianteDto.Ram,
                    varianteDto.Almacenamiento
                );

                if (exists)
                {
                    return BadRequest("Ya existe una variante con estas especificaciones");
                }

                // Crear la nueva variante
                var createdVariante = await _productoService.AddVarianteAsync(varianteDto);
                return CreatedAtAction(nameof(GetVarianteById), new { id = createdVariante.Id }, createdVariante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la variante");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPut("variante/{varianteId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateVariante(int varianteId, [FromBody] ProductosVariantesDto varianteDto)
        {
            try
            {
                // 1. Buscar la variante existente
                var existingVariante = await _productoService.GetVarianteByIdAsync(varianteId);
                if (existingVariante == null)
                    return NotFound($"No se encontró la variante con ID {varianteId}");

                // 2. Validar duplicados usando ExistsVarianteAsync
                var exists = await _productoService.ExistsVarianteAsync(
                    varianteDto.ProductoId,
                    varianteDto.Stock,
                    varianteDto.Precio,
                    varianteDto.Color,
                    varianteDto.Descuento,
                    varianteDto.Ram,
                    varianteDto.Almacenamiento ?? null 
                );

                // Si existe y no es la misma variante que estamos actualizando
                if (exists)
                {
                    // Verificar si es la misma variante o una diferente
                    var duplicateCheck = await _productoService.GetVarianteSpecAsync(
                        varianteDto.ProductoId,
                        varianteDto.Stock,
                        varianteDto.Precio,
                        varianteDto.Color,
                        varianteDto.Descuento,
                        varianteDto.Almacenamiento,
                        varianteDto.Ram
                    );
                    
                    if (duplicateCheck != null && duplicateCheck.Id != varianteId)
                        return BadRequest("Ya existe una variante con estas especificaciones");
                }

                // 3. Asignar los IDs correctos al DTO
                varianteDto.Id = varianteId;
                varianteDto.ProductoId = existingVariante.ProductoId;

                // 4. Actualizar la variante
                await _productoService.UpdateVarianteAsync(varianteDto);

                // 5. Devolver la variante actualizada
                return Ok(varianteDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar la variante {varianteId}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpDelete("variante/{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteVariante(int id)
        {
            try
            {
                var variante = await _productoService.GetVarianteByIdAsync(id);
                if (variante == null)
                {
                    return NotFound($"No se encontró la variante con ID {id}");
                }

                await _productoService.DeleteVarianteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar la variante {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
