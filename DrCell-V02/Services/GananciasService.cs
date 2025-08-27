using AutoMapper;
using DrCell_V02.Data;
using DrCell_V02.Data.Dtos;
using DrCell_V02.Data.Modelos;
using DrCell_V02.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace DrCell_V02.Services
{
    // TEMPORALMENTE COMENTADO - FALTA TABLA CostoProductos EN LA BASE DE DATOS
    /*public class GananciasService : IGananciasService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GananciasService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ReporteGananciasDto> GenerarReporteGananciasAsync(FiltroGananciasDto filtro)
        {
            var query = _context.VentaItems
                .Include(vi => vi.Venta)
                .Include(vi => vi.Variante)
                    .ThenInclude(v => v.Producto)
                    .ThenInclude(p => p.Categoria)
                .Where(vi => vi.Venta.Estado == "APPROVED");

            // Aplicar filtros
            if (filtro.FechaInicio.HasValue)
                query = query.Where(vi => vi.Venta.FechaVenta >= filtro.FechaInicio.Value);

            if (filtro.FechaFin.HasValue)
                query = query.Where(vi => vi.Venta.FechaVenta <= filtro.FechaFin.Value);

            if (filtro.CategoriaId.HasValue)
                query = query.Where(vi => vi.Variante.Producto.CategoriaId == filtro.CategoriaId.Value);

            var ventaItems = await query.ToListAsync();

            // Obtener costos actuales para cada variante - TEMPORALMENTE COMENTADO
            // var varianteIds = ventaItems.Select(vi => vi.VarianteId).Distinct();
            // var costos = await _context.CostoProductos
            //     .Where(cp => varianteIds.Contains(cp.VarianteId) && cp.EsVigente)
            //     .GroupBy(cp => cp.VarianteId)
            //     .Select(g => new { VarianteId = g.Key, Costo = g.OrderByDescending(c => c.FechaVigencia).First().CostoCompra })
            //     .ToDictionaryAsync(x => x.VarianteId, x => x.Costo);

            var totalVentas = ventaItems.Sum(vi => vi.Subtotal);
            var totalCostos = 0m; // Temporalmente en 0 - falta tabla CostoProductos
            var gananciaBruta = totalVentas - totalCostos;
            var productosVendidos = ventaItems.Sum(vi => vi.Cantidad);

            var ventasConGanancia = ventaItems.Count(vi => 
            {
                var costo = costos.GetValueOrDefault(vi.VarianteId, 0) * vi.Cantidad;
                return vi.Subtotal > costo;
            });

            // Calcular productos más y menos rentables
            var productosRentabilidad = ventaItems
                .GroupBy(vi => new { vi.VarianteId, vi.Variante.Producto.Marca, vi.Variante.Producto.Modelo, vi.Variante.Color, vi.Variante.Ram, vi.Variante.Almacenamiento })
                .Select(g =>
                {
                    var totalVendidoProducto = g.Sum(vi => vi.Subtotal);
                    var totalCostosProducto = g.Sum(vi => costos.GetValueOrDefault(vi.VarianteId, 0) * vi.Cantidad);
                    var gananciaProducto = totalVendidoProducto - totalCostosProducto;

                    return new ProductoRentabilidadDto
                    {
                        VarianteId = g.Key.VarianteId,
                        ProductoNombre = $"{g.Key.Marca} {g.Key.Modelo}",
                        VarianteDescripcion = $"{g.Key.Color} - {g.Key.Ram} - {g.Key.Almacenamiento}",
                        CantidadVendida = g.Sum(vi => vi.Cantidad),
                        TotalVendido = totalVendidoProducto,
                        TotalCostos = totalCostosProducto,
                        GananciaTotal = gananciaProducto,
                        MargenPromedio = totalVendidoProducto > 0 ? (gananciaProducto / totalVendidoProducto) * 100 : 0,
                        PorcentajeMargen = totalVendidoProducto > 0 ? (gananciaProducto / totalVendidoProducto) * 100 : 0,
                        GananciaPorUnidad = g.Count() > 0 ? gananciaProducto / g.Sum(vi => vi.Cantidad) : 0
                    };
                })
                .OrderByDescending(p => p.GananciaTotal)
                .ToList();

            return new ReporteGananciasDto
            {
                FechaInicio = filtro.FechaInicio ?? DateTime.Today.AddMonths(-1),
                FechaFin = filtro.FechaFin ?? DateTime.Today,
                TotalVentas = totalVentas,
                TotalCostos = totalCostos,
                GananciaBruta = gananciaBruta,
                MargenPromedio = totalVentas > 0 ? (gananciaBruta / totalVentas) * 100 : 0,
                ProductosVendidos = productosVendidos,
                VentasConGanancia = ventasConGanancia,
                VentasSinGanancia = ventaItems.Count - ventasConGanancia,
                PorcentajeRentabilidad = ventaItems.Count > 0 ? (decimal)ventasConGanancia / ventaItems.Count * 100 : 0,
                ProductoMasRentable = productosRentabilidad.FirstOrDefault(),
                ProductoMenosRentable = productosRentabilidad.LastOrDefault()
            };
        }

        public async Task<IEnumerable<ProductoRentabilidadDto>> GetProductosMasRentablesAsync(int cantidad = 10, FiltroGananciasDto? filtro = null)
        {
            filtro ??= new FiltroGananciasDto();
            var reporte = await GenerarReporteGananciasAsync(filtro);
            
            // Obtener productos detallados
            return await GetProductosRentabilidadDetalladoAsync(filtro, cantidad, true);
        }

        public async Task<IEnumerable<ProductoRentabilidadDto>> GetProductosMenosRentablesAsync(int cantidad = 10, FiltroGananciasDto? filtro = null)
        {
            filtro ??= new FiltroGananciasDto();
            return await GetProductosRentabilidadDetalladoAsync(filtro, cantidad, false);
        }

        public async Task<IEnumerable<RentabilidadPorCategoriaDto>> GetRentabilidadPorCategoriaAsync(FiltroGananciasDto? filtro = null)
        {
            filtro ??= new FiltroGananciasDto();

            var query = _context.VentaItems
                .Include(vi => vi.Venta)
                .Include(vi => vi.Variante)
                    .ThenInclude(v => v.Producto)
                    .ThenInclude(p => p.Categoria)
                .Where(vi => vi.Venta.Estado == "APPROVED");

            // Aplicar filtros de fecha
            if (filtro.FechaInicio.HasValue)
                query = query.Where(vi => vi.Venta.FechaVenta >= filtro.FechaInicio.Value);

            if (filtro.FechaFin.HasValue)
                query = query.Where(vi => vi.Venta.FechaVenta <= filtro.FechaFin.Value);

            var ventaItems = await query.ToListAsync();

            // Obtener costos
            var varianteIds = ventaItems.Select(vi => vi.VarianteId).Distinct();
            var costos = await _context.CostoProductos
                .Where(cp => varianteIds.Contains(cp.VarianteId) && cp.EsVigente)
                .GroupBy(cp => cp.VarianteId)
                .Select(g => new { VarianteId = g.Key, Costo = g.OrderByDescending(c => c.FechaVigencia).First().CostoCompra })
                .ToDictionaryAsync(x => x.VarianteId, x => x.Costo);

            var rentabilidadPorCategoria = ventaItems
                .GroupBy(vi => new { vi.Variante.Producto.CategoriaId, vi.Variante.Producto.Categoria.Nombre })
                .Select(g =>
                {
                    var totalVendido = g.Sum(vi => vi.Subtotal);
                    var totalCostos = g.Sum(vi => costos.GetValueOrDefault(vi.VarianteId, 0) * vi.Cantidad);
                    var gananciaTotal = totalVendido - totalCostos;

                    var productosEnCategoria = g.GroupBy(vi => vi.VarianteId)
                        .Select(pg =>
                        {
                            var totalVendidoProducto = pg.Sum(vi => vi.Subtotal);
                            var totalCostosProducto = pg.Sum(vi => costos.GetValueOrDefault(vi.VarianteId, 0) * vi.Cantidad);
                            return new ProductoRentabilidadDto
                            {
                                VarianteId = pg.Key,
                                GananciaTotal = totalVendidoProducto - totalCostosProducto,
                                TotalVendido = totalVendidoProducto,
                                TotalCostos = totalCostosProducto
                            };
                        })
                        .ToList();

                    return new RentabilidadPorCategoriaDto
                    {
                        CategoriaId = g.Key.CategoriaId,
                        CategoriaNombre = g.Key.Nombre,
                        TotalVendido = totalVendido,
                        TotalCostos = totalCostos,
                        GananciaTotal = gananciaTotal,
                        MargenPromedio = totalVendido > 0 ? (gananciaTotal / totalVendido) * 100 : 0,
                        ProductosVendidos = g.Sum(vi => vi.Cantidad),
                        VariantesActivas = g.Select(vi => vi.VarianteId).Distinct().Count(),
                        MejorProducto = productosEnCategoria.OrderByDescending(p => p.GananciaTotal).FirstOrDefault(),
                        PeorProducto = productosEnCategoria.OrderBy(p => p.GananciaTotal).FirstOrDefault()
                    };
                })
                .OrderByDescending(r => r.GananciaTotal)
                .ToList();

            return rentabilidadPorCategoria;
        }

        public async Task<ComparativaGananciasDto> GetComparativaGananciasAsync(TipoPeriodo periodo)
        {
            var (fechaInicioActual, fechaFinActual) = CalcularPeriodo(periodo);
            var duracion = fechaFinActual - fechaInicioActual;
            var fechaInicioAnterior = fechaInicioActual - duracion;
            var fechaFinAnterior = fechaInicioActual.AddMilliseconds(-1);

            var filtroActual = new FiltroGananciasDto { FechaInicio = fechaInicioActual, FechaFin = fechaFinActual };
            var filtroAnterior = new FiltroGananciasDto { FechaInicio = fechaInicioAnterior, FechaFin = fechaFinAnterior };

            var reporteActual = await GenerarReporteGananciasAsync(filtroActual);
            var reporteAnterior = await GenerarReporteGananciasAsync(filtroAnterior);

            var crecimientoVentas = CalcularCrecimiento(reporteAnterior.TotalVentas, reporteActual.TotalVentas);
            var crecimientoGanancias = CalcularCrecimiento(reporteAnterior.GananciaBruta, reporteActual.GananciaBruta);
            var cambioMargen = reporteActual.MargenPromedio - reporteAnterior.MargenPromedio;

            var tendencia = DeterminarTendencia(crecimientoGanancias, cambioMargen);
            var alertas = GenerarAlertas(reporteActual, reporteAnterior, crecimientoGanancias, cambioMargen);

            return new ComparativaGananciasDto
            {
                PeriodoActual = reporteActual,
                PeriodoAnterior = reporteAnterior,
                CrecimientoVentas = crecimientoVentas,
                CrecimientoGanancias = crecimientoGanancias,
                CambioMargenPromedio = cambioMargen,
                Tendencia = tendencia,
                Alertas = alertas
            };
        }

        public async Task<IEnumerable<AlertaRentabilidadDto>> GetAlertasRentabilidadAsync(decimal margenMinimo = 20)
        {
            var alertas = new List<AlertaRentabilidadDto>();

            // Obtener ventas recientes (último mes)
            var fechaLimite = DateTime.UtcNow.AddMonths(-1);
            var ventaItems = await _context.VentaItems
                .Include(vi => vi.Venta)
                .Include(vi => vi.Variante)
                    .ThenInclude(v => v.Producto)
                .Where(vi => vi.Venta.FechaVenta >= fechaLimite && vi.Venta.Estado == "APPROVED")
                .ToListAsync();

            // Obtener costos actuales
            var varianteIds = ventaItems.Select(vi => vi.VarianteId).Distinct();
            var costos = await _context.CostoProductos
                .Where(cp => varianteIds.Contains(cp.VarianteId) && cp.EsVigente)
                .GroupBy(cp => cp.VarianteId)
                .Select(g => new { VarianteId = g.Key, Costo = g.OrderByDescending(c => c.FechaVigencia).First().CostoCompra })
                .ToDictionaryAsync(x => x.VarianteId, x => x.Costo);

            var productosConProblemas = ventaItems
                .GroupBy(vi => new { vi.VarianteId, vi.Variante.Producto.Marca, vi.Variante.Producto.Modelo, vi.Variante.Color })
                .Where(g =>
                {
                    var totalVendido = g.Sum(vi => vi.Subtotal);
                    var totalCosto = g.Sum(vi => costos.GetValueOrDefault(vi.VarianteId, 0) * vi.Cantidad);
                    var margen = totalVendido > 0 ? ((totalVendido - totalCosto) / totalVendido) * 100 : 0;
                    return margen < margenMinimo;
                })
                .Select(g =>
                {
                    var totalVendido = g.Sum(vi => vi.Subtotal);
                    var totalCosto = g.Sum(vi => costos.GetValueOrDefault(vi.VarianteId, 0) * vi.Cantidad);
                    var margen = totalVendido > 0 ? ((totalVendido - totalCosto) / totalVendido) * 100 : 0;

                    var tipoAlerta = margen <= 0 ? TipoAlertaEnum.SinGanancia : TipoAlertaEnum.MargenBajo;
                    var mensaje = tipoAlerta == TipoAlertaEnum.SinGanancia
                        ? "Producto sin ganancia o con pérdidas"
                        : $"Margen por debajo del mínimo ({margenMinimo}%)";

                    return new AlertaRentabilidadDto
                    {
                        VarianteId = g.Key.VarianteId,
                        ProductoNombre = $"{g.Key.Marca} {g.Key.Modelo}",
                        VarianteDescripcion = g.Key.Color ?? "Sin especificar",
                        MargenActual = margen,
                        MargenMinimo = margenMinimo,
                        TipoAlerta = tipoAlerta,
                        Mensaje = mensaje
                    };
                })
                .OrderBy(a => a.MargenActual)
                .ToList();

            return productosConProblemas;
        }

        public async Task<AnalisisMargenDto> AnalisisMargenProductoAsync(int varianteId)
        {
            var variante = await _context.ProductosVariantes
                .Include(v => v.Producto)
                .FirstOrDefaultAsync(v => v.Id == varianteId);

            if (variante == null)
                throw new ArgumentException($"No se encontró la variante con ID {varianteId}");

            var costoActual = await _context.CostoProductos
                .Where(cp => cp.VarianteId == varianteId && cp.EsVigente)
                .OrderByDescending(cp => cp.FechaVigencia)
                .Select(cp => cp.CostoCompra)
                .FirstOrDefaultAsync();

            var precioActual = variante.Precio;
            var margenActual = precioActual - costoActual;
            var porcentajeMargenActual = precioActual > 0 ? (margenActual / precioActual) * 100 : 0;

            // Generar escenarios de precios
            var escenarios = GenerarEscenariosPrecios(costoActual, precioActual);

            // Calcular margen óptimo (sugerir 30% como estándar)
            var margenOptimoSugerido = 30m;
            var precioOptimoSugerido = costoActual / (1 - (margenOptimoSugerido / 100));

            return new AnalisisMargenDto
            {
                VarianteId = varianteId,
                ProductoNombre = $"{variante.Producto.Marca} {variante.Producto.Modelo}",
                PrecioVentaActual = precioActual,
                CostoActual = costoActual,
                MargenActual = margenActual,
                PorcentajeMargenActual = porcentajeMargenActual,
                MargenOptimo = margenOptimoSugerido,
                PrecioOptimoSugerido = precioOptimoSugerido,
                ImpactoEnGanancias = precioOptimoSugerido - precioActual,
                Escenarios = escenarios
            };
        }

        public async Task ActualizarCostosProductoAsync(int varianteId, decimal nuevoCosto, string usuario)
        {
            // Marcar costo anterior como no vigente
            var costosAnteriores = await _context.CostoProductos
                .Where(cp => cp.VarianteId == varianteId && cp.EsVigente)
                .ToListAsync();

            foreach (var costo in costosAnteriores)
            {
                costo.EsVigente = false;
                costo.FechaFin = DateTime.UtcNow;
                costo.ModificadoPor = usuario;
                costo.FechaModificacion = DateTime.UtcNow;
            }

            // Crear nuevo registro de costo
            var nuevoCostoProducto = new CostoProducto
            {
                VarianteId = varianteId,
                CostoCompra = nuevoCosto,
                FechaVigencia = DateTime.UtcNow,
                EsVigente = true,
                CreadoPor = usuario,
                Observaciones = "Actualización de costo"
            };

            _context.CostoProductos.Add(nuevoCostoProducto);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> RecalcularMargenesVentasAsync(DateTime? fechaInicio = null)
        {
            fechaInicio ??= DateTime.UtcNow.AddMonths(-1);

            var ventas = await _context.Ventas
                .Where(v => v.FechaVenta >= fechaInicio && v.Estado == "APPROVED")
                .ToListAsync();

            foreach (var venta in ventas)
            {
                var ventaItems = await _context.VentaItems
                    .Where(vi => vi.VentaId == venta.Id)
                    .ToListAsync();

                var costoTotal = 0m;
                foreach (var item in ventaItems)
                {
                    var costo = await _context.CostoProductos
                        .Where(cp => cp.VarianteId == item.VarianteId && 
                                   cp.FechaVigencia <= venta.FechaVenta &&
                                   (cp.FechaFin == null || cp.FechaFin >= venta.FechaVenta))
                        .OrderByDescending(cp => cp.FechaVigencia)
                        .Select(cp => cp.CostoCompra)
                        .FirstOrDefaultAsync();

                    costoTotal += costo * item.Cantidad;
                }

                venta.CostoTotal = costoTotal;
                venta.Margen = venta.MontoTotal - costoTotal;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Métodos auxiliares privados
        private async Task<List<ProductoRentabilidadDto>> GetProductosRentabilidadDetalladoAsync(FiltroGananciasDto filtro, int cantidad, bool masRentables)
        {
            var query = _context.VentaItems
                .Include(vi => vi.Venta)
                .Include(vi => vi.Variante)
                    .ThenInclude(v => v.Producto)
                .Where(vi => vi.Venta.Estado == "APPROVED");

            // Aplicar filtros
            if (filtro.FechaInicio.HasValue)
                query = query.Where(vi => vi.Venta.FechaVenta >= filtro.FechaInicio.Value);

            if (filtro.FechaFin.HasValue)
                query = query.Where(vi => vi.Venta.FechaVenta <= filtro.FechaFin.Value);

            if (filtro.CategoriaId.HasValue)
                query = query.Where(vi => vi.Variante.Producto.CategoriaId == filtro.CategoriaId.Value);

            var ventaItems = await query.ToListAsync();

            // Obtener costos
            var varianteIds = ventaItems.Select(vi => vi.VarianteId).Distinct();
            var costos = await _context.CostoProductos
                .Where(cp => varianteIds.Contains(cp.VarianteId) && cp.EsVigente)
                .GroupBy(cp => cp.VarianteId)
                .Select(g => new { VarianteId = g.Key, Costo = g.OrderByDescending(c => c.FechaVigencia).First().CostoCompra })
                .ToDictionaryAsync(x => x.VarianteId, x => x.Costo);

            var productos = ventaItems
                .GroupBy(vi => new { vi.VarianteId, vi.Variante.Producto.Marca, vi.Variante.Producto.Modelo, vi.Variante.Color, vi.Variante.Ram, vi.Variante.Almacenamiento })
                .Select(g =>
                {
                    var totalVendido = g.Sum(vi => vi.Subtotal);
                    var totalCostos = g.Sum(vi => costos.GetValueOrDefault(vi.VarianteId, 0) * vi.Cantidad);
                    var gananciaTotal = totalVendido - totalCostos;

                    return new ProductoRentabilidadDto
                    {
                        VarianteId = g.Key.VarianteId,
                        ProductoNombre = $"{g.Key.Marca} {g.Key.Modelo}",
                        VarianteDescripcion = $"{g.Key.Color} - {g.Key.Ram} - {g.Key.Almacenamiento}",
                        CantidadVendida = g.Sum(vi => vi.Cantidad),
                        TotalVendido = totalVendido,
                        TotalCostos = totalCostos,
                        GananciaTotal = gananciaTotal,
                        MargenPromedio = totalVendido > 0 ? (gananciaTotal / totalVendido) * 100 : 0,
                        PorcentajeMargen = totalVendido > 0 ? (gananciaTotal / totalVendido) * 100 : 0,
                        GananciaPorUnidad = g.Sum(vi => vi.Cantidad) > 0 ? gananciaTotal / g.Sum(vi => vi.Cantidad) : 0
                    };
                });

            // Aplicar ordenamiento según el filtro
            switch (filtro.Ordenamiento)
            {
                case OrdenamientoGanancias.GananciaDesc:
                    productos = productos.OrderByDescending(p => p.GananciaTotal);
                    break;
                case OrdenamientoGanancias.GananciaAsc:
                    productos = productos.OrderBy(p => p.GananciaTotal);
                    break;
                case OrdenamientoGanancias.MargenDesc:
                    productos = productos.OrderByDescending(p => p.PorcentajeMargen);
                    break;
                case OrdenamientoGanancias.MargenAsc:
                    productos = productos.OrderBy(p => p.PorcentajeMargen);
                    break;
                case OrdenamientoGanancias.VentasDesc:
                    productos = productos.OrderByDescending(p => p.CantidadVendida);
                    break;
                case OrdenamientoGanancias.VentasAsc:
                    productos = productos.OrderBy(p => p.CantidadVendida);
                    break;
            }

            if (!masRentables)
                productos = productos.Reverse();

            return productos.Take(cantidad).ToList();
        }

        private (DateTime fechaInicio, DateTime fechaFin) CalcularPeriodo(TipoPeriodo tipoPeriodo)
        {
            var hoy = DateTime.Today;

            return tipoPeriodo switch
            {
                TipoPeriodo.Hoy => (hoy, hoy.AddDays(1).AddMilliseconds(-1)),
                TipoPeriodo.Semana => (hoy.AddDays(-(int)hoy.DayOfWeek), hoy.AddDays(7 - (int)hoy.DayOfWeek).AddMilliseconds(-1)),
                TipoPeriodo.Mes => (new DateTime(hoy.Year, hoy.Month, 1), new DateTime(hoy.Year, hoy.Month, DateTime.DaysInMonth(hoy.Year, hoy.Month)).AddDays(1).AddMilliseconds(-1)),
                TipoPeriodo.Año => (new DateTime(hoy.Year, 1, 1), new DateTime(hoy.Year, 12, 31).AddDays(1).AddMilliseconds(-1)),
                _ => (hoy.AddMonths(-1), hoy)
            };
        }

        private decimal CalcularCrecimiento(decimal valorAnterior, decimal valorActual)
        {
            if (valorAnterior == 0) return valorActual > 0 ? 100 : 0;
            return ((valorActual - valorAnterior) / valorAnterior) * 100;
        }

        private TendenciaEnum DeterminarTendencia(decimal crecimientoGanancias, decimal cambioMargen)
        {
            if (crecimientoGanancias > 5 && cambioMargen > 1) return TendenciaEnum.Mejorando;
            if (crecimientoGanancias < -5 || cambioMargen < -2) return TendenciaEnum.Empeorando;
            return TendenciaEnum.Estable;
        }

        private List<string> GenerarAlertas(ReporteGananciasDto actual, ReporteGananciasDto anterior, decimal crecimientoGanancias, decimal cambioMargen)
        {
            var alertas = new List<string>();

            if (crecimientoGanancias < -10)
                alertas.Add("Disminución significativa en ganancias (>10%)");

            if (cambioMargen < -5)
                alertas.Add("Reducción importante en margen promedio (>5%)");

            if (actual.PorcentajeRentabilidad < 70)
                alertas.Add("Bajo porcentaje de ventas rentables (<70%)");

            if (actual.MargenPromedio < 15)
                alertas.Add("Margen promedio por debajo del objetivo (15%)");

            return alertas;
        }

        private List<EscenarioPrecioDto> GenerarEscenariosPrecios(decimal costo, decimal precioActual)
        {
            var escenarios = new List<EscenarioPrecioDto>();

            var margenes = new[] { 15m, 20m, 25m, 30m, 35m, 40m };

            foreach (var margenObjetivo in margenes)
            {
                var precioSugerido = costo / (1 - (margenObjetivo / 100));
                var impacto = precioSugerido - precioActual;

                escenarios.Add(new EscenarioPrecioDto
                {
                    PrecioSugerido = Math.Round(precioSugerido, 2),
                    Margen = Math.Round(precioSugerido - costo, 2),
                    PorcentajeMargen = margenObjetivo,
                    ImpactoEstimado = Math.Round(impacto, 2),
                    Descripcion = $"Margen objetivo {margenObjetivo}%"
                });
            }

            return escenarios;
        }
    }*/

    // Implementación temporal simplificada sin CostoProductos - COMENTADA COMPLETAMENTE
    /*public class GananciasService : IGananciasService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GananciasService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<GananciasGeneralesDto> CalcularGananciasGeneralesAsync(FiltroGananciasDto filtro)
        {
            return new GananciasGeneralesDto
            {
                GananciaBruta = 0,
                GananciaNeta = 0,
                MargenGanancia = 0,
                ProductosVendidos = 0,
                VentasConGanancia = 0,
                VentasConPerdida = 0,
                VentasSinGanancia = 0,
                Productos = new List<ProductoGananciasDto>()
            };
        }

        public async Task<List<ProductoGananciasDto>> AnalisisGananciasProductosAsync(FiltroGananciasDto filtro)
        {
            return new List<ProductoGananciasDto>();
        }

        public async Task<List<TendenciaGananciasDto>> TendenciasGananciasAsync(int diasAnalisis = 30)
        {
            return new List<TendenciaGananciasDto>();
        }

        public async Task<OptimizacionPreciosDto> OptimizacionPreciosAsync(int varianteId)
        {
            return new OptimizacionPreciosDto
            {
                PrecioActual = 0,
                PrecioOptimoSugerido = 0,
                ImpactoEnGanancias = 0,
                Escenarios = new List<EscenarioPrecioDto>()
            };
        }

        public async Task<List<AlertaGananciasDto>> AlertasGananciasAsync()
        {
            return new List<AlertaGananciasDto>();
        }

        public async Task<EstadisticasCostosDto> EstadisticasCostosAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            return new EstadisticasCostosDto
            {
                CostoTotalPeriodo = 0,
                CostoPromedioPorProducto = 0,
                VariacionCostos = 0,
                ProductosMayorCosto = new List<ProductoCostoDto>()
            };
        }

        public async Task<bool> ActualizarCostoAsync(ActualizarCostoDto dto)
        {
            return true; // No hace nada por ahora
        }

        public async Task<List<ProductoRentabilidadDto>> ProductosMasRentablesAsync(int cantidad = 10)
        {
            return new List<ProductoRentabilidadDto>();
        }

        public async Task<bool> ImportarCostosAsync(List<ImportarCostoDto> costos)
        {
            return true; // No hace nada por ahora
        }
    }*/
}