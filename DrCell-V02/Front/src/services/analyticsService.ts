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
  const { data } = await axios.get<RecentActivity[]>(
    `${API_URL}/admin/ventas/analytics/recent`,
    { params: { limit }, withCredentials: true }
  );
  return data;
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
  const { data } = await axios.get<DashboardKpiDto>(
    `${API_URL}/admin/ventas/analytics/dashboard`,
    { withCredentials: true }
  );
  return data;
}

export async function getProyeccionVentas(
  dias = 30
): Promise<ProyeccionVentasDto> {
  const { data } = await axios.get<ProyeccionVentasDto>(
    `${API_URL}/admin/ventas/analytics/proyecciones`,
    { params: { diasProyeccion: dias }, withCredentials: true }
  );
  return data;
}

export async function getAnalisisClientes(): Promise<AnalisisClientesDto> {
  const { data } = await axios.get<AnalisisClientesDto>(
    `${API_URL}/admin/ventas/analytics/clientes`,
    { withCredentials: true }
  );
  return data;
}

export async function getAnalisisInventario(): Promise<AnalisisInventarioDto> {
  const { data } = await axios.get<AnalisisInventarioDto>(
    `${API_URL}/admin/ventas/analytics/inventario`,
    { withCredentials: true }
  );
  return data;
}

// Aliases para compatibilidad
export const getActividadesRecientesHoy = fetchRecentToday;
