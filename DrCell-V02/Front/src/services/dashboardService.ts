import api from '../config/axios';

export interface DashboardStatsDto {
  ventasHoy: number;
  cambioVentasHoy: number;
  clientesNuevos: number;
  cambioClientesNuevos: number;
  productosActivos: number;
  cambioProductosActivos: number;
  alertasActivas: number;
  cambioAlertas: number;
}

export interface ActividadRecienteDto {
  id: string;
  tipo: 'venta' | 'cliente' | 'alerta' | 'producto';
  titulo: string;
  descripcion: string;
  fecha: string;
  valor?: number;
  accion?: string;
}

class DashboardService {
  private baseURL = '/admin/ventas';

  async getDashboardStats(): Promise<DashboardStatsDto> {
    try {
      const response = await api.get<DashboardStatsDto>(`${this.baseURL}/dashboard-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getActividadReciente(): Promise<ActividadRecienteDto[]> {
    try {
      const response = await api.get<ActividadRecienteDto[]>(`${this.baseURL}/actividad-reciente`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();