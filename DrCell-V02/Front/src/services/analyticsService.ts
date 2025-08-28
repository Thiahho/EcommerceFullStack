// src/services/analyticsService.ts
import axios from "axios";

const API_URL = "http://localhost:5000"; // ej: https://api.tu-dominio.com
export type AnalyticsSummary = {
  date: string; // ISO de la fecha
  ordersCount: number;
  totalAmount: number;
  avgTicket: number;
  byStatus: Record<string, number>;
};

export type RecentActivity = {
  orderId: string;
  createdAtLocal: string; // ISO local ya convertido por el back
  customerName?: string | null;
  status: string;
  total: number;
};

export async function fetchDailySummary(dateISO?: string) {
  const params = dateISO ? { date: dateISO } : {};
  const { data } = await axios.get<AnalyticsSummary>(
    `${API_URL}/admin/ventas/analytics/summary`,
    { params, withCredentials: true }
  );
  return data;
}

export async function fetchRecentToday(limit = 20) {
  try {
    const { data } = await axios.get<RecentActivity[]>(
      `${API_URL}/admin/ventas/analytics/recent`,
      { params: { limit }, withCredentials: true }
    );
    return data;
  } catch (error) {
    console.warn("Analytics recent endpoint failing, using GetAll as fallback");
    // Fallback usando GetAll y filtrando en el frontend
    try {
      const { data: todasVentas } = await axios.get<any[]>(
        `${API_URL}/admin/ventas/GetAll`,
        { withCredentials: true }
      );

      // Filtrar ventas del día de hoy
      const hoy = new Date().toDateString();
      const ventasHoy = todasVentas
        .filter((v) => new Date(v.fechaVenta).toDateString() === hoy)
        .slice(0, limit)
        .map((v) => ({
          orderId: v.id?.toString() || "",
          createdAtLocal: v.fechaVenta,
          customerName: null,
          status: v.estado,
          total: v.montoTotal,
        }));

      return ventasHoy;
    } catch (fallbackError) {
      console.error("Both endpoints failed:", fallbackError);
      return [];
    }
  }
}

// Tipos necesarios para el componente AnalyticasAdmin
export type MetricasGeneralesDto = {
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  gananciasHoy: number;
  gananciasSemana: number;
  gananciasMes: number;
  productosVendidosHoy: number;
  productosVendidosSemana: number;
  productosVendidosMes: number;
  ventasPendientes: number;
  ticketPromedioMes: number;
};

export type KpiDto = {
  nombre: string;
  valor: number;
  valorAnterior: number;
  cambioPorcentual: number;
  unidad: string;
  tendencia: string;
  descripcion: string;
  esCritico: boolean;
};

export type TendenciaDto = {
  metrica: string;
  datos: Array<{ fecha: string; valor: number; etiqueta: string }>;
  tasaCrecimiento: number;
  direccion: string;
  diasAnalizados: number;
};

export type AlertaDto = {
  titulo: string;
  mensaje: string;
  tipo: string;
  nivel: string;
  fecha: string;
  accion: string;
  datos: Record<string, any>;
};

export type DashboardKpiDto = {
  metricasGenerales: MetricasGeneralesDto;
  kpisPrincipales: KpiDto[];
  tendencias: TendenciaDto[];
  alertas: AlertaDto[];
  fechaGeneracion: string;
};

export type EscenarioProyeccionDto = {
  nombre: string;
  probabilidad: number;
  ventasProyectadas: number;
  gananciasProyectadas: number;
  descripcion: string;
};

export type ProyeccionVentasDto = {
  fechaProyeccion: string;
  ventasProyectadas: number;
  gananciasProyectadas: number;
  margenConfianza: number;
  escenarios: EscenarioProyeccionDto[];
  metodoProyeccion: string;
};

export type SegmentoClienteDto = {
  nombre: string;
  cantidad: number;
  porcentajeTotal: number;
  ticketPromedio: number;
  frecuenciaCompra: number;
  caracteristicas: string;
};

export type AnalisisClientesDto = {
  totalClientes: number;
  clientesNuevos: number;
  clientesRecurrentes: number;
  tasaRetencion: number;
  valorVidaPromedio: number;
  segmentos: SegmentoClienteDto[];
};

export type AlertaInventarioDto = {
  varianteId: number;
  productoNombre: string;
  stockActual: number;
  stockMinimo: number;
  tipo: string;
  mensaje: string;
  diasStock: number;
};

export type AnalisisInventarioDto = {
  productosTotales: number;
  productosStockBajo: number;
  productosSinStock: number;
  valorInventario: number;
  rotacionPromedio: number;
  alertas: AlertaInventarioDto[];
};

// Funciones principales que el componente AnalyticasAdmin necesita
export async function getDashboardKpis(): Promise<DashboardKpiDto> {
  try {
    const { data } = await axios.get<DashboardKpiDto>(
      `${API_URL}/admin/ventas/analytics/dashboard`,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    console.warn("Analytics service not implemented, using fallback data");
    // Fallback con datos de ejemplo para evitar errores en el frontend
    return {
      metricasGenerales: {
        ventasHoy: 0,
        ventasSemana: 0,
        gananciasHoy: 0,
        gananciasSemana: 0,
        productosVendidosHoy: 0,
        productosVendidosMes: 0,
        ticketPromedioMes: 0,
        ventasPendientes: 0,
      },
      kpisPrincipales: [],
      tendencias: [],
      alertas: [],
      fechaGeneracion: new Date().toISOString(),
    };
  }
}

export async function getProyeccionVentas(
  dias = 30
): Promise<ProyeccionVentasDto> {
  try {
    const { data } = await axios.get<ProyeccionVentasDto>(
      `${API_URL}/admin/ventas/analytics/proyecciones`,
      { params: { diasProyeccion: dias }, withCredentials: true }
    );
    return data;
  } catch (error) {
    console.warn("Analytics service not implemented, using fallback data");
    return {
      fechaProyeccion: new Date().toISOString(),
      ventasProyectadas: 0,
      gananciasProyectadas: 0,
      margenConfianza: 0,
      escenarios: [],
      metodoProyeccion: "No disponible",
    };
  }
}

export async function getAnalisisClientes(): Promise<AnalisisClientesDto> {
  try {
    const { data } = await axios.get<AnalisisClientesDto>(
      `${API_URL}/admin/ventas/analytics/clientes`,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    console.warn("Analytics service not implemented, using fallback data");
    return {
      totalClientes: 0,
      clientesNuevos: 0,
      clientesRecurrentes: 0,
      tasaRetencion: 0,
      valorVidaPromedio: 0,
      segmentos: [],
    };
  }
}

export async function getAnalisisInventario(): Promise<AnalisisInventarioDto> {
  try {
    const { data } = await axios.get<AnalisisInventarioDto>(
      `${API_URL}/admin/ventas/analytics/inventario`,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    console.warn("Analytics service not implemented, using fallback data");
    return {
      productosTotales: 0,
      productosStockBajo: 0,
      productosSinStock: 0,
      valorInventario: 0,
      rotacionPromedio: 0,
      alertas: [],
    };
  }
}

// Nuevos tipos para el panel de ventas
export type VentaDetalleDto = {
  orderId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  createdAtLocal: string;
  status: string;
  total: number;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod?: string;
};

export type VentasResumenDto = {
  totalVentasHoy: number;
  cantidadVentasHoy: number;
  ticketPromedio: number;
  ventasMes: number;
  ventas: VentaDetalleDto[];
};

// Función para obtener todas las ventas reales
export async function getVentasResumen(): Promise<VentasResumenDto> {
  try {
    // Intentar usar el endpoint con datos de productos primero
    let ventasCompletas: any[] = [];
    
    try {
      const { data } = await axios.get<any[]>(
        `${API_URL}/admin/ventas/GetAllWithProducts`,
        { withCredentials: true }
      );
      ventasCompletas = data;
      console.log('✅ Usando endpoint GetAllWithProducts con datos completos');
    } catch (error) {
      console.warn('⚠️ GetAllWithProducts no disponible, usando GetAll como fallback');
      const { data } = await axios.get<any[]>(
        `${API_URL}/admin/ventas/GetAll`,
        { withCredentials: true }
      );
      ventasCompletas = data;
    }

    // Mapear las ventas a nuestro formato con datos de productos si están disponibles
    const ventasFormateadas: VentaDetalleDto[] = ventasCompletas.map(
      (venta) => ({
        orderId: venta.id?.toString() || "N/A",
        customerName: null, // No disponible en el endpoint actual
        customerEmail: null, // No disponible en el endpoint actual
        createdAtLocal: venta.fechaVenta,
        status: venta.estado,
        total: venta.montoTotal,
        items: (venta.items || []).map((item: any) => {
          // Construir nombre del producto con los datos disponibles
          const productParts = [
            item.marca,
            item.modelo,
            item.color,
            item.ram,
            item.almacenamiento
          ].filter(part => part && part.trim() !== "");
          
          const productName = productParts.length > 0 
            ? productParts.join(" ") 
            : `Variante ID ${item.varianteId}`;

          return {
            productName: `${productName} - $${item.precioUnitario}`,
            quantity: item.cantidad,
            price: item.precioUnitario,
          };
        }),
        paymentMethod: venta.metodoEnvio || null,
      })
    );

    // Calcular métricas
    const hoy = new Date().toDateString();
    const ventasHoy = ventasFormateadas.filter((v) => {
      const fechaVenta = new Date(v.createdAtLocal).toDateString();
      return fechaVenta === hoy;
    });

    const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    const cantidadVentasHoy = ventasHoy.length;
    const ticketPromedio =
      cantidadVentasHoy > 0 ? totalVentasHoy / cantidadVentasHoy : 0;

    const inicioMes = new Date();
    inicioMes.setDate(1);
    const ventasMes = ventasFormateadas
      .filter((v) => new Date(v.createdAtLocal) >= inicioMes)
      .reduce((sum, v) => sum + v.total, 0);

    return {
      totalVentasHoy,
      cantidadVentasHoy,
      ticketPromedio,
      ventasMes,
      ventas: ventasFormateadas,
    };
  } catch (error) {
    console.error("Error al obtener resumen de ventas:", error);

    // Fallback con datos vacíos
    return {
      totalVentasHoy: 0,
      cantidadVentasHoy: 0,
      ticketPromedio: 0,
      ventasMes: 0,
      ventas: [],
    };
  }
}

// Tipos para el nuevo endpoint detallado
type VentaDetalladaDto = {
  VentaId: number;
  PreferenceId: string;
  PaymentId: string;
  FechaVenta: string;
  Estado: string;
  VentaTotal: number;
  CostoTotal?: number;
  MargenTotal?: number;
  UsuarioId?: string;
  MetodoEnvio?: string;
  DireccionEnvio?: string;
  NumeroSeguimiento?: string;
  Items: VentaItemDetalladoDto[];
};

type VentaItemDetalladoDto = {
  VentaItemId: number;
  VarianteId: number;
  Cantidad: number;
  PrecioUnitario: number;
  LineaTotal: number;
  ProductoId: number;
  Marca?: string;
  Modelo?: string;
  Categoria?: string;
  Color?: string;
  Ram?: string;
  Almacenamiento?: string;
  Stock: number;
  CostoLineaEstimado?: number;
  MargenLineaEstimado?: number;
};

// Aliases para compatibilidad
export const getActividadesRecientesHoy = fetchRecentToday;
