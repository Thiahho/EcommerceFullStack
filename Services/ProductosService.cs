using AutoMapper;
using EcommerceFullStack.Data;
using EcommerceFullStack.Data.Dtos;
using EcommerceFullStack.Data.Modelos;
using EcommerceFullStack.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Runtime.Intrinsics.Arm;

namespace EcommerceFullStack.Services
{
    public class ProductosService : IProductoService
    {

        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _dbContext;

        public ProductosService(ApplicationDbContext applicationDbContext, IMapper mapper)
        {
            _dbContext = applicationDbContext;
            _mapper = mapper;
        }

        public async Task<ProductoDto> AddAsyncProducto(ProductoDto productos)
        {
            var entidad = _mapper.Map<Productos>(productos);
            _dbContext.Productos.AddAsync(entidad);
            await _dbContext.SaveChangesAsync();
            return _mapper.Map<ProductoDto>(entidad);
        }

        public async Task<ProductosVariantesDto> AddVarianteAsync(ProductosVariantesDto productosVariantesDto)
        {
            var entidad = _mapper.Map<ProductosVariantes>(productosVariantesDto);
            _dbContext.ProductosVariantes.AddAsync(entidad);
            await _dbContext.SaveChangesAsync();
            return _mapper.Map<ProductosVariantesDto>(entidad);
        }

        public async Task DeleteProductoAsync(int id)
        {
            var producto = await _dbContext.Productos.FindAsync(id);
            if (producto != null)
            {
                _dbContext.Productos.Remove(producto);
                await _dbContext.SaveChangesAsync();
            }
        }

        public async Task DeleteVarianteAsync(int varianteId)
        {
            var variante = await _dbContext.ProductosVariantes.FindAsync(varianteId);
            if(variante != null)
            {
                _dbContext.ProductosVariantes.Remove(variante);
                await _dbContext.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsProductoAsync(string marca, string nombre)
        {
            return await _dbContext.Productos
                .AnyAsync(p => p.Marca == marca && p.Nombre == nombre);
        }

        public async Task<bool> ExistsVarianteAsync(int productoId, string nombre, int stock, decimal precio, string color, decimal descuento, string descripcion, string almacenamiento)
        {
            return await _dbContext.ProductosVariantes
              .AnyAsync(v => v.ProductoId == productoId &&
                            v.Stock == stock &&
                            v.Nombre == nombre &&
                            v.Precio == precio &&
                            v.Color == color &&
                            v.Descripcion == descripcion &&
                            v.Almacenamiento == almacenamiento &&
                            v.Descuento == descuento &&
                            v.Almacenamiento == almacenamiento);
        }

        public async Task<IEnumerable<ProductoDto>> GetAllProductsAsync()
        {
            var productos = await _dbContext.Productos.Include(p => p.Variantes).AsNoTracking().ToListAsync();
            return _mapper.Map<List<ProductoDto>>(productos);
        }


        public async Task<IEnumerable<ProductoDto>> GetAllVariantesAsync()
        {
            var variantes = await _dbContext.ProductosVariantes.AsNoTracking().ToListAsync();
            return _mapper.Map<List<ProductoDto>>(variantes);
        }

        public async Task<ProductoDto?> GetByIdVarianteAsync(int id)
        {

            var producto = await _dbContext.Productos
       .Include(p => p.Variantes)
       .FirstOrDefaultAsync(p => p.Id == id);

            if (producto == null) return null;

            return new ProductoDto
            {
                Id = producto.Id,
                Marca = producto.Marca,
                Nombre = producto.Nombre,
                Categoria = producto.Categoria,
                Images = producto.Images != null ? Convert.ToBase64String(producto.Images) : null,
                Variantes = producto.Variantes.Select(v => new ProductosVariantesDto
                {
                    Id = v.Id,
                    ProductoId = v.ProductoId,
                    Descripcion = v.Descripcion,
                    Descuento = v.Descuento,
                    Almacenamiento = v.Almacenamiento,
                    Color = v.Color,
                    Precio = v.Precio,
                    Stock = v.Stock
                    // No incluir Producto aquí
                }).ToList()
            };
        }

        public async Task<IEnumerable<string>> GetDistintAlmacenamientosAsync(string almacenamiento, int productId)
        {
            return await _dbContext.ProductosVariantes
                .Where(v => v.ProductoId == productId && v.Almacenamiento == almacenamiento)
                .Select(v => v.Almacenamiento)
                .Where(s => s != null)
                .Distinct()
                .OrderBy(s => s)
                .ToListAsync();
        }

        public async Task<IEnumerable<string>> GetDistintColorAsync(string almacenamiento, int productId)
        {
            return await _dbContext.ProductosVariantes
             .Where(v => v.ProductoId == productId && v.Almacenamiento == almacenamiento)
             .Select(v => v.Color)
             .Where(c => c != null)
             .Distinct()
             .OrderBy(c => c)
             .ToListAsync();
        }

        public async Task<ProductosVariantesDto?> GetVarianteByIdAsync(int varianteId)
        {
            Console.WriteLine($"GetVarianteById con variante id: {varianteId}");

            var variantes = await _dbContext.ProductosVariantes
                .Where(v => v.ProductoId == varianteId)
                .AsNoTracking()
                .ToListAsync();

            Console.WriteLine($"Variantes encontradas: {variantes.Count}");
            foreach (var v in variantes)
            {
                Console.WriteLine($"Variante ID: {v.Id}, Producto ID: {v.ProductoId}, Color: {v.Color}, Almacenamiento: {v.Almacenamiento}, Precio: {v.Precio}");
            }

            var result = variantes.Select(v => new ProductosVariantesDto
            {
                Id = v.Id,
                ProductoId = v.ProductoId,
                Almacenamiento = v.Almacenamiento,
                Color = v.Color,
                Precio = v.Precio,
                Descuento = v.Descuento,
                Stock = v.Stock,
            }).ToList();

            Console.WriteLine($"Resultado mapeado: {result.Count} variantes encontradas");
            return result.FirstOrDefault();
        }

        public async Task<ProductosVariantesDto?> GetVarianteSpecAsync(int productId, int stock, decimal precio, string color, decimal descuento, string descripcion, string almacenamiento)
        {
            var variante= await _dbContext.ProductosVariantes
                .Where(v=>v.ProductoId == productId)
                .Where(v=>v.Stock== stock)
                .Where(v=>v.Precio== precio)
                .Where(v=>v.Color== color)
                .Where(v=>v.Descuento== descuento)
                .Where(v=>v.Descripcion== descripcion)
                .Where(v=>v.Almacenamiento== almacenamiento)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if(variante == null) return null;
            return _mapper.Map<ProductosVariantesDto>(variante);


        }

        public async Task UpdateProductoAsync(ProductoDto productoDto)
        {
            var entidad = await _dbContext.Productos
                .FirstOrDefaultAsync(p => p.Id == productoDto.Id);

            if(entidad != null)
            {
                entidad.Marca = productoDto.Marca;
                entidad.Nombre = productoDto.Nombre;
                entidad.Categoria = productoDto.Categoria;
                if(!string.IsNullOrEmpty(productoDto.Images))
                {
                    entidad.Images = Convert.FromBase64String(productoDto.Images);
                    _dbContext.Productos.Update(entidad);
                    await _dbContext.SaveChangesAsync();
                }
            }
        }

        public async Task UpdateVarianteAsync(ProductosVariantesDto variante)
        {
            var entidad= await _dbContext.ProductosVariantes
                .FirstOrDefaultAsync(v => v.Id == variante.Id);

            if(entidad != null)
            {
                entidad.Descripcion = variante.Descripcion;
                entidad.Descuento = variante.Descuento;
                entidad.Almacenamiento = variante.Almacenamiento;
                entidad.Color = variante.Color;
                entidad.Precio = variante.Precio;
                entidad.Stock = variante.Stock;
                _dbContext.ProductosVariantes.Update(entidad);
                await _dbContext.SaveChangesAsync();
            }
        }


    }

}
