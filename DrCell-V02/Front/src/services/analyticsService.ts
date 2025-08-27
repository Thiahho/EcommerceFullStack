/* import api from '../config/axios';

export interface DashboardKpiDto {
  metricasGenerales: MetricasGeneralesDto;
  kpisPrincipales: KpiDto[];
  tendencias: TendenciaDto[];
  alertas: AlertaDto[];
  fechaGeneracion: string;
}

export interface MetricasGeneralesDto {
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
}

export interface KpiDto {
  nombre: string;
  valor: number;
  valorAnterior: number;
  cambioPorcentual: number;
  unidad: string;
  tendencia: 'Subiendo' | 'Bajando' | 'Estable' | 'Volatil';
  descripcion: string;
  esCritico: boolean;
}

export interface TendenciaDto {
  metrica: string;
  datos: PuntoTendenciaDto[];
  tasaCrecimiento: number;
  direccion: 'Creciente' | 'Decreciente' | 'Estable' | 'Ciclica';
  diasAnalizados: number;
}

export interface PuntoTendenciaDto {
  fecha: string;
  valor: number;
  etiqueta: string;
}

export interface AlertaDto {
  titulo: string;
  mensaje: string;
  tipo: string;
  nivel: 'Informacion' | 'Advertencia' | 'Critica' | 'Urgente';
  fecha: string;
  accion: string;
  datos: Record<string, any>;
}

export interface ProyeccionVentasDto {
  fechaProyeccion: string;
  ventasProyectadas: number;
  gananciasProyectadas: number;
  margenConfianza: number;
  escenarios: EscenarioProyeccionDto[];
  metodoProyeccion: string;
  factoresInfluencia: FactorInfluenciaDto[];
}

export interface EscenarioProyeccionDto {
  nombre: string;
  probabilidad: number;
  ventasProyectadas: number;
  gananciasProyectadas: number;
  descripcion: string;
}

export interface FactorInfluenciaDto {
  factor: string;
  impacto: number;
  descripcion: string;
}

export interface AnalisisClientesDto {
  totalClientes: number;
  clientesNuevos: number;
  clientesRecurrentes: number;
  tasaRetencion: number;
  valorVidaPromedio: number;
  segmentos: SegmentoClienteDto[];
  patronesCompra: ComportamientoClienteDto[];
}

export interface SegmentoClienteDto {
  nombre: string;
  cantidad: number;
  porcentajeTotal: number;
  ticketPromedio: number;
  frecuenciaCompra: number;
  caracteristicas: string;
}

export interface ComportamientoClienteDto {
  patron: string;
  frecuencia: number;
  valorPromedio: number;
  productosPreferidos: string[];
  horarioPreferido: string;
}

export interface AnalisisInventarioDto {
  productosTotales: number;
  productosStockBajo: number;
  productosSinStock: number;
  valorInventario: number;
  rotacionPromedio: number;
  productosLentaRotacion: ProductoRotacionDto[];
  productosAltaRotacion: ProductoRotacionDto[];
  alertas: AlertaInventarioDto[];
}

export interface ProductoRotacionDto {
  varianteId: number;
  productoNombre: string;
  stockActual: number;
  rotacionAnual: number;
  diasPromedioPermanencia: number;
  valorInventario: number;
  recomendacion: string;
}

export interface AlertaInventarioDto {
  varianteId: number;
  productoNombre: string;
  stockActual: number;
  stockMinimo: number;
  tipo: string;
  mensaje: string;
  diasStock: number;
}

export interface MetricasTemporalesDto {
  fecha: string;
  ventas: number;
  ganancias: number;
  transacciones: number;
  ticketPromedio: number;
  margenPromedio: number;
}

export interface AnalisisEstacionalidadDto {
  estacionalidadMensual: EstacionalidadMesDto[];
  estacionalidadSemanal: EstacionalidadDiaDto[];
  estacionalidadHoraria: EstacionalidadHoraDto[];
  tendenciaGeneral: string;
  mesMasVentas: string;
  diaMasVentas: string;
  horaMasVentas: string;
}

export interface EstacionalidadMesDto {
  mes: number;
  nombreMes: string;
  ventasPromedio: number;
  indiceEstacionalidad: number;
}

export interface EstacionalidadDiaDto {
  dia: number;
  nombreDia: string;
  ventasPromedio: number;
  indiceEstacionalidad: number;
}

export interface EstacionalidadHoraDto {
  hora: number;
  ventasPromedio: number;
  indiceEstacionalidad: number;
}

class AnalyticsService {
  private baseURL = '/admin/ventas/analytics';

  async getDashboardKpis(): Promise<DashboardKpiDto> {
    try {
      const response = await api.get<DashboardKpiDto>(`${this.baseURL}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      throw error;
    }
  }

  async getMetricasGenerales(): Promise<MetricasGeneralesDto> {
    try {
      const response = await api.get<MetricasGeneralesDto>(`${this.baseURL}/metricas-generales`);
      return response.data;
    } catch (error) {
      console.error('Error fetching general metrics:', error);
      throw error;
    }
  }

  async getKpisPrincipales(): Promise<KpiDto[]> {
    try {
      const response = await api.get<KpiDto[]>(`${this.baseURL}/kpis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching main KPIs:', error);
      throw error;
    }
  }

  async getTendencias(diasAnalisis = 30): Promise<TendenciaDto[]> {
    try {
      const response = await api.get<TendenciaDto[]>(`${this.baseURL}/tendencias`, {
        params: { diasAnalisis }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  }

  async getProyeccionVentas(diasProyeccion = 30): Promise<ProyeccionVentasDto> {
    try {
      const response = await api.get<ProyeccionVentasDto>(`${this.baseURL}/proyecciones`, {
        params: { diasProyeccion }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales projection:', error);
      throw error;
    }
  }

  async getEscenarios(diasProyeccion = 30): Promise<EscenarioProyeccionDto[]> {
    try {
      const response = await api.get<EscenarioProyeccionDto[]>(`${this.baseURL}/escenarios-proyeccion`, {
        params: { diasProyeccion }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching projection scenarios:', error);
      throw error;
    }
  }

  async getAnalisisClientes(fechaInicio?: string, fechaFin?: string): Promise<AnalisisClientesDto> {
    try {
      const response = await api.get<AnalisisClientesDto>(`${this.baseURL}/clientes`, {
        params: { fechaInicio, fechaFin }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching client analysis:', error);
      throw error;
    }
  }

  async getSegmentosClientes(): Promise<SegmentoClienteDto[]> {
    try {
      const response = await api.get<SegmentoClienteDto[]>(`${this.baseURL}/segmentos-clientes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching client segments:', error);
      throw error;
    }
  }

  async getPatronesCompra(): Promise<ComportamientoClienteDto[]> {
    try {
      const response = await api.get<ComportamientoClienteDto[]>(`${this.baseURL}/patrones-compra`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase patterns:', error);
      throw error;
    }
  }

  async getAnalisisInventario(): Promise<AnalisisInventarioDto> {
    try {
      const response = await api.get<AnalisisInventarioDto>(`${this.baseURL}/inventario`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory analysis:', error);
      throw error;
    }
  }

  async getProductosLentaRotacion(cantidad = 10): Promise<ProductoRotacionDto[]> {
    try {
      const response = await api.get<ProductoRotacionDto[]>(`${this.baseURL}/productos-lenta-rotacion`, {
        params: { cantidad }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching slow rotation products:', error);
      throw error;
    }
  }

  async getAlertasInventario(): Promise<AlertaInventarioDto[]> {
    try {
      const response = await api.get<AlertaInventarioDto[]>(`${this.baseURL}/alertas-inventario`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      throw error;
    }
  }

  async getAlertasInteligentes(): Promise<AlertaDto[]> {
    try {
      const response = await api.get<AlertaDto[]>(`${this.baseURL}/alertas`);
      return response.data;
    } catch (error) {
      console.error('Error fetching smart alerts:', error);
      throw error;
    }
  }

  async getAlertasTendenciasNegativas(): Promise<AlertaDto[]> {
    try {
      const response = await api.get<AlertaDto[]>(`${this.baseURL}/alertas-tendencias-negativas`);
      return response.data;
    } catch (error) {
      console.error('Error fetching negative trend alerts:', error);
      throw error;
    }
  }

  async getAnalisisTemporal(
    fechaInicio: string,
    fechaFin: string,
    agrupacion = 'dia'
  ): Promise<MetricasTemporalesDto[]> {
    try {
      const response = await api.get<MetricasTemporalesDto[]>(`${this.baseURL}/temporal`, {
        params: { fechaInicio, fechaFin, agrupacion }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching temporal analysis:', error);
      throw error;
    }
  }

  async getAnalisisEstacionalidad(mesesAnalisis = 12): Promise<AnalisisEstacionalidadDto> {
    try {
      const response = await api.get<AnalisisEstacionalidadDto>(`${this.baseURL}/estacionalidad`, {
        params: { mesesAnalisis }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching seasonality analysis:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService(); */

// src/services/analyticsService.ts
import axios from "axios";

const API_URL = "http:localhost:5000"; // ej: https://api.tu-dominio.com
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
