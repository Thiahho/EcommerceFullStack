using AutoMapper;
using EcommerceFullStack.Data;
using EcommerceFullStack.Data.Dtos;
using EcommerceFullStack.Data.Modelos;
using EcommerceFullStack.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EcommerceFullStack.Services
{
    public class ProductosService : IProductoService
    {
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<ProductosService> _logger;

        public ProductosService(ApplicationDbContext applicationDbContext, IMapper mapper, ILogger<ProductosService> logger)
        {
            _dbContext = applicationDbContext;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<ProductoDto> AddAsyncProducto(ProductoDto productos)
        {
            try
            {
                // Verificar si ya existe un producto con la misma marca y nombre
                var exists = await ExistsProductoAsync(productos.Marca, productos.Nombre);
                if (exists)
                {
                    throw new InvalidOperationException($"Ya existe un producto con la marca {productos.Marca} y nombre {productos.Nombre}");
                }

                var entidad = _mapper.Map<Productos>(productos);
                await _dbContext.Productos.AddAsync(entidad);
                await _dbContext.SaveChangesAsync();
                
                _logger.LogInformation("Producto creado exitosamente: {Marca} {Nombre}", productos.Marca, productos.Nombre);
                return _mapper.Map<ProductoDto>(entidad);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el producto: {Marca} {Nombre}", productos.Marca, productos.Nombre);
                throw;
            }
        }

        public async Task<ProductosVariantesDto> AddVarianteAsync(ProductosVariantesDto productosVariantesDto)
        {
            try
            {
                // Verificar si ya existe una variante con las mismas especificaciones
                var exists = await ExistsVarianteAsync(
                    productosVariantesDto.ProductoId,
                    productosVariantesDto.Stock,
                    productosVariantesDto.Precio,
                    productosVariantesDto.Color ?? string.Empty,
                    productosVariantesDto.Descuento,
                    productosVariantesDto.Ram ?? string.Empty,
                    productosVariantesDto.Almacenamiento ?? string.Empty);

                if (exists)
                {
                    throw new InvalidOperationException("Ya existe una variante con estas especificaciones");
                }

                var entidad = _mapper.Map<ProductosVariantes>(productosVariantesDto);
                await _dbContext.ProductosVariantes.AddAsync(entidad);
                await _dbContext.SaveChangesAsync();
                
                _logger.LogInformation("Variante creada exitosamente para producto ID: {ProductoId}", productosVariantesDto.ProductoId);
                return _mapper.Map<ProductosVariantesDto>(entidad);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la variante para producto ID: {ProductoId}", productosVariantesDto.ProductoId);
                throw;
            }
        }

        public async Task DeleteProductoAsync(int id)
        {
            try
            {
                var producto = await _dbContext.Productos
                    .Include(p => p.Variantes)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (producto == null)
                {
                    throw new InvalidOperationException($"No se encontró el producto con ID {id}");
                }

                // Las variantes se eliminan automáticamente por cascade
                _dbContext.Productos.Remove(producto);
                await _dbContext.SaveChangesAsync();
                
                _logger.LogInformation("Producto eliminado exitosamente: ID {Id}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el producto ID: {Id}", id);
                throw;
            }
        }

        public async Task DeleteVarianteAsync(int varianteId)
        {
            try
            {
                var variante = await _dbContext.ProductosVariantes.FindAsync(varianteId);
                if (variante == null)
                {
                    throw new InvalidOperationException($"No se encontró la variante con ID {varianteId}");
                }

                _dbContext.ProductosVariantes.Remove(variante);
                await _dbContext.SaveChangesAsync();
                
                _logger.LogInformation("Variante eliminada exitosamente: ID {Id}", varianteId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la variante ID: {Id}", varianteId);
                throw;
            }
        }

        public async Task<bool> ExistsProductoAsync(string marca, string nombre)
        {
            return await _dbContext.Productos
                .AnyAsync(p => p.Marca.ToLower() == marca.ToLower() && 
                               p.Nombre.ToLower() == nombre.ToLower());
        }

        public async Task<bool> ExistsVarianteAsync(int productoId, int stock, decimal precio, string color, decimal descuento, string ram, string almacenamiento)
        {
            return await _dbContext.ProductosVariantes
                .AnyAsync(v => v.ProductoId == productoId &&
                               v.Stock == stock &&
                               v.Precio == precio &&
                               v.Color == color &&
                               v.Almacenamiento == almacenamiento &&
                               v.Descuento == descuento &&
                               v.Ram == ram);
        }

        public async Task<IEnumerable<ProductoDto>> GetAllProductsAsync()
        {
            try
            {
                var productos = await _dbContext.Productos
                    .Include(p => p.Variantes)
                    .Include(p => p.Categoria)
                    .AsNoTracking()
                    .ToListAsync();

                return _mapper.Map<List<ProductoDto>>(productos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los productos");
                throw;
            }
        }

        public async Task<IEnumerable<ProductosVariantesDto>> GetAllVariantesAsync()
        {
            try
            {
                var variantes = await _dbContext.ProductosVariantes
                    .Include(v => v.Producto)
                    .AsNoTracking()
                    .ToListAsync();

                return _mapper.Map<List<ProductosVariantesDto>>(variantes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las variantes");
                throw;
            }
        }

        public async Task<ProductoDto?> GetByIdVarianteAsync(int id)
        {
            try
            {
                var producto = await _dbContext.Productos
                    .Include(p => p.Variantes)
                    .Include(p => p.Categoria)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (producto == null) return null;

                return _mapper.Map<ProductoDto>(producto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el producto ID: {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<string>> GetDistintAlmacenamientosAsync(string almacenamiento, int productId)
        {
            return await _dbContext.ProductosVariantes
                .Where(v => v.ProductoId == productId && v.Almacenamiento == almacenamiento)
                .Select(v => v.Almacenamiento)
                .Where(s => !string.IsNullOrEmpty(s))
                .Distinct()
                .OrderBy(s => s)
                .ToListAsync();
        }

        public async Task<IEnumerable<string>> GetDistintColorAsync(string almacenamiento, int productId)
        {
            return await _dbContext.ProductosVariantes
                .Where(v => v.ProductoId == productId && v.Almacenamiento == almacenamiento)
                .Select(v => v.Color)
                .Where(c => !string.IsNullOrEmpty(c))
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }

        public async Task<IEnumerable<ProductosVariantesDto>> GetVariantesByProductIdAsync(int productoId)
        {
            try
            {
                var variantes = await _dbContext.ProductosVariantes
                    .Where(v => v.ProductoId == productoId)
                    .AsNoTracking()
                    .ToListAsync();

                return _mapper.Map<List<ProductosVariantesDto>>(variantes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener variantes para producto ID: {ProductoId}", productoId);
                throw;
            }
        }

        public async Task<ProductosVariantesDto?> GetVarianteByIdAsync(int varianteId)
        {
            try
            {
                var variante = await _dbContext.ProductosVariantes
                    .FirstOrDefaultAsync(v => v.Id == varianteId);

                if (variante == null) return null;
                
                return _mapper.Map<ProductosVariantesDto>(variante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la variante ID: {Id}", varianteId);
                throw;
            }
        }

        public async Task<ProductosVariantesDto?> GetVarianteSpecAsync(int productId, int stock, decimal precio, string color, decimal descuento, string almacenamiento, string ram)
        {
            try
            {
                var variante = await _dbContext.ProductosVariantes
                    .Where(v => v.ProductoId == productId &&
                               v.Ram == ram &&
                               v.Stock == stock &&
                               v.Precio == precio &&
                               v.Color == color &&
                               v.Descuento == descuento &&
                               v.Almacenamiento == almacenamiento)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (variante == null) return null;
                
                return _mapper.Map<ProductosVariantesDto>(variante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener variante específica para producto ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task UpdateProductoAsync(ProductoDto productoDto)
        {
            try
            {
                var entidad = await _dbContext.Productos
                    .FirstOrDefaultAsync(p => p.Id == productoDto.Id);

                if (entidad == null)
                {
                    throw new InvalidOperationException($"No se encontró el producto con ID {productoDto.Id}");
                }

                // Actualizar solo los campos permitidos
                entidad.Marca = productoDto.Marca;
                entidad.Nombre = productoDto.Nombre;
                entidad.Descripcion = productoDto.Descripcion;
                entidad.CategoriaId = productoDto.CategoriaId;

                if (!string.IsNullOrEmpty(productoDto.Images))
                {
                    entidad.Images = Convert.FromBase64String(productoDto.Images);
                }

                _dbContext.Productos.Update(entidad);
                await _dbContext.SaveChangesAsync();
                
                _logger.LogInformation("Producto actualizado exitosamente: ID {Id}", productoDto.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el producto ID: {Id}", productoDto.Id);
                throw;
            }
        }

        public async Task UpdateVarianteAsync(ProductosVariantesDto variante)
        {
            try
            {
                var entidad = await _dbContext.ProductosVariantes
                    .FirstOrDefaultAsync(v => v.Id == variante.Id);

                if (entidad == null)
                {
                    throw new InvalidOperationException($"No se encontró la variante con ID {variante.Id}");
                }

                // Actualizar solo los campos permitidos
                entidad.Descuento = variante.Descuento;
                entidad.Almacenamiento = variante.Almacenamiento;
                entidad.Color = variante.Color;
                entidad.Precio = variante.Precio;
                entidad.Stock = variante.Stock;
                entidad.Ram = variante.Ram;

                _dbContext.ProductosVariantes.Update(entidad);
                await _dbContext.SaveChangesAsync();
                
                _logger.LogInformation("Variante actualizada exitosamente: ID {Id}", variante.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la variante ID: {Id}", variante.Id);
                throw;
            }
        }
    }
}
