using DrCell_V02.Data;
using DrCell_V02.Data.Dtos;
using DrCell_V02.Data.Modelos;
using DrCell_V02.Services.Interface;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
namespace DrCell_V02.Services
{
    public class ProductosService : IProductoService
    {   
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;
        public ProductosService(ApplicationDbContext applicationDbContext, IMapper mapper)
        {
            _context = applicationDbContext;
            _mapper = mapper;
        }
        public async Task<ProductosVariantesDto?> GetVarianteByIdAsync(int varianteId)
        {
            var variante = await _context.ProductosVariantes
                .Include(pv => pv.Producto)
                .FirstOrDefaultAsync(pv => pv.Id == varianteId);

            if (variante == null || variante.Producto == null)
                return null;

            return new ProductosVariantesDto
            {
                Id = variante.Id,
                ProductoId = variante.ProductoId,
                Ram = variante.Ram,
                Almacenamiento = variante.Almacenamiento,
                Color = variante.Color,
                Stock = variante.Stock,
                Precio = variante.Precio,
                Producto = new ProductoDto
                {
                    Id = variante.Producto.Id,
                    Marca = variante.Producto.Marca,
                    Modelo = variante.Producto.Modelo,
                    Img = variante.Producto.Img  !=null ? Convert.ToBase64String(variante.Producto.Img) : null,
                }
            };
        }
        public async Task<ProductoDto> AddAsync(ProductoDto productoDto)
        {
            var entidad = _mapper.Map<Productos>(productoDto);
            _context.Productos.Add(entidad);
            await _context.SaveChangesAsync();
            return _mapper.Map<ProductoDto>(entidad);
        }

        public async Task<ProductosVariantesDto> AddVarianteAsync(ProductosVariantesDto varianteDto)
        {
            var entidad = _mapper.Map<ProductosVariantes>(varianteDto);
            _context.ProductosVariantes.Add(entidad);    
            await _context.SaveChangesAsync();
            return _mapper.Map<ProductosVariantesDto>(entidad);
        }

        public async Task DeleteAsync(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto != null)
            {
                _context.Productos.Remove(producto);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<ProductoDto>> GetAllProductsAsync()
        {
           var productos = await _context.Productos
                .Include(p => p.Categoria)        // ✅ AGREGAR: Incluir categoría
                .Include(p => p.Variantes.Where(v => v.Activa)) // ✅ AGREGAR: Solo variantes activas
                .Where(p => p.Activo)             // ✅ AGREGAR: Solo productos activos
                .AsNoTracking()
                .ToListAsync();
        
            var productosDto = _mapper.Map<List<ProductoDto>>(productos);
            
            // ✅ AGREGAR: Calcular rangos de precios después del mapeo
            foreach (var producto in productosDto)
            {
                producto.CalcularRangoPrecios();
            }
            
            return productosDto;
        }

        public async Task<IEnumerable<ProductoDto>> GetAllVariantesAsync()
        {
            var variantes = await _context.ProductosVariantes.AsNoTracking().ToListAsync();
            return _mapper.Map<List<ProductoDto>>(variantes);
        }

        public async Task<ProductoDto?> GetByIdWithVarianteAsync(int id)
        {
         
            var producto = await _context.Productos
       .Include(p => p.Variantes)
       .FirstOrDefaultAsync(p => p.Id == id);

            if (producto == null) return null;

            return new ProductoDto
            {
                Id = producto.Id,
                Marca = producto.Marca,
                Modelo = producto.Modelo,
                Categoria = producto.Categoria?.Nombre,
                Img = producto.Img != null ? Convert.ToBase64String(producto.Img) : null,
                Variantes = producto.Variantes.Select(v => new ProductosVariantesDto
                {
                    Id = v.Id,
                    ProductoId = v.ProductoId,
                    Ram = v.Ram,
                    Almacenamiento = v.Almacenamiento,
                    Color = v.Color,
                    Precio = v.Precio,
                    Stock = v.Stock
                    // No incluir Producto aquí
                }).ToList()
            };
        }
            
        public async Task<IEnumerable<string>> GetDistintAlmacenamientosAsync(string ram, int productId)
        {
            return await _context.ProductosVariantes
                .Where(v => v.ProductoId == productId && v.Ram == ram)
                .Select(v => v.Almacenamiento)
                .Where(s => s != null)
                .Distinct()
                .OrderBy(s => s)
                .ToListAsync();
        }

        public async Task<IEnumerable<string>> GetDistintColorAsync(string ram, string almacenamiento, int productId)
        {
            return await _context.ProductosVariantes
                .Where(v => v.ProductoId == productId && v.Ram == ram && v.Almacenamiento == almacenamiento)
                .Select(v => v.Color)
                .Where(c => c != null)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }

        public async Task<IEnumerable<ProductosVariantesDto>> GetVariantesByIdAsync(int productId)
        {
            Console.WriteLine($"GetVariantesByIdAsync llamado con productId: {productId}");
            
            var variantes = await _context.ProductosVariantes
                .Where(v => v.ProductoId == productId)
                .AsNoTracking()
                .ToListAsync();
            
            Console.WriteLine($"Variantes encontradas en BD: {variantes.Count}");
            foreach (var v in variantes)
            {
                Console.WriteLine($"Variante ID: {v.Id}, RAM: {v.Ram}, Almacenamiento: {v.Almacenamiento}, Color: {v.Color}");
            }
            
            // Mapeo manual para evitar problemas con AutoMapper
            var result = variantes.Select(v => new ProductosVariantesDto
            {
                Id = v.Id,
                ProductoId = v.ProductoId,
                Ram = v.Ram,
                Almacenamiento = v.Almacenamiento,
                Color = v.Color,
                Precio = v.Precio,
                Stock = v.Stock
            }).ToList();
            
            Console.WriteLine($"Variantes mapeadas: {result.Count}");
            return result;
        }

        public async Task<ProductosVariantesDto?> GetVarianteSpecAsync(int productId, string ram, string storage, string color)
        {
            var variante = await _context.ProductosVariantes
                .Where(v => v.ProductoId == productId)
                .Where(v => v.Ram == ram)
                .Where(v => v.Almacenamiento == storage)
                .Where(v => v.Color == color)
                .AsNoTracking()
                .FirstOrDefaultAsync();
                
            if (variante == null)
                return null;
                
            return _mapper.Map<ProductosVariantesDto>(variante);
        }

      /*  public async Task UpdateAsync(ProductoDto productoDto)
        {
            var entidad = await _context.Productos
                .FirstOrDefaultAsync(p => p.Id == productoDto.Id);

            if (entidad != null)
            {
                entidad.Marca = productoDto.Marca;
                entidad.Modelo = productoDto.Modelo;
                entidad.Categoria = productoDto.Categoria;
                if (!string.IsNullOrEmpty(productoDto.Img))
                    entidad.Img = Convert.FromBase64String(productoDto.Img);

                _context.Productos.Update(entidad);
                await _context.SaveChangesAsync();
            }
        }*/

        public async Task UpdateVarianteAsync(ProductosVariantesDto varianteDto)
        {
            var entidad = await _context.ProductosVariantes
                .FirstOrDefaultAsync(v => v.Id == varianteDto.Id);

            if (entidad != null)
            {
                entidad.Ram = varianteDto.Ram;
                entidad.Almacenamiento = varianteDto.Almacenamiento;
                entidad.Color = varianteDto.Color;
                entidad.Precio = varianteDto.Precio;
                entidad.Stock = varianteDto.Stock;
                _context.ProductosVariantes.Update(entidad);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteVarianteAsync(int varianteId)
        {
            var variante = await _context.ProductosVariantes.FindAsync(varianteId);
            if (variante != null)
            {
                _context.ProductosVariantes.Remove(variante);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsVarianteAsync(int productoId, string ram, string almacenamiento, string color)
        {
            return await _context.ProductosVariantes
                .AnyAsync(v => v.ProductoId == productoId && 
                              v.Ram == ram && 
                              v.Almacenamiento == almacenamiento && 
                              v.Color == color);
        }

        public async Task<bool> ExistsProductoAsync(string marca, string modelo)
        {
            return await _context.Productos
                .AnyAsync(p => p.Marca == marca && p.Modelo == modelo);
        }

        public byte[] toWebpp(byte[] input, int size = 60, int quality = 80)
        {
            using var image = Image.Load(input); // admite jpg/png/webp
            // Lienzo cuadrado con fondo blanco y contenido centrado
            var scale = Math.Min((float)size / image.Width, (float)size / image.Height);
            var w = (int)(image.Width * scale);
            var h = (int)(image.Height * scale);

            using var canvas = new Image<Rgba32>(size, size, Color.White);
            image.Mutate(x => x.Resize(w, h));
            canvas.Mutate(x => x.DrawImage(image, new Point((size - w) / 2, (size - h) / 2), 1f));

            using var ms = new MemoryStream();
            canvas.Save(ms, new WebpEncoder { Quality = quality, FileFormat = WebpFileFormatType.Lossy });
            return ms.ToArray();
        }

        public bool IsReasonableSize(byte[] input, int maxBytes)
        => input.Length <= maxBytes;
    

     public async Task ActualizarAsync(ProductoDto dto, CancellationToken ct = default)
    {
        var p = await _context.Productos.FirstOrDefaultAsync(x => x.Id == dto.Id, ct)
                ?? throw new KeyNotFoundException("Producto no encontrado");

        p.Marca = dto.Marca;
        p.Modelo = dto.Modelo;
        p.CategoriaId = dto.CategoriaId;

        if (!string.IsNullOrWhiteSpace(dto.Img))
        {
            var raw = Convert.FromBase64String(dto.Img);
            if (!IsReasonableSize(raw, 2 * 1024 * 1024))
                throw new InvalidOperationException("Imagen > 2MB");

            p.Img = toWebpp(raw, 600, 80); // siempre WebP normalizado
        }

        await _context.SaveChangesAsync(ct);
    }

    public async Task<(byte[] bytes, string contentType)> ObtenerImagenAsync(int id, CancellationToken ct = default)
    {
        var bytes = await _context.Productos.Where(x => x.Id == id).Select(x => x.Img!).FirstOrDefaultAsync(ct);
        if (bytes == null || bytes.Length == 0) throw new KeyNotFoundException();
        return (bytes, "image/webp");
    }


}

}

