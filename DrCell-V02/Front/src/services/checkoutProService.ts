import api from '@/config/axios';

// Tipos para Checkout Pro
export interface CheckoutProItem {
  productoId: number;
  varianteId: number;
  marca: string;
  modelo: string;
  ram: string;
  almacenamiento: string;
  color: string;
  cantidad: number;
  precio: number;
}

interface CreatePreferenceRequest {
  items: CheckoutProItem[];
}

export interface CreatePreferenceResponse {
  success: boolean;
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

class CheckoutProService {
  /**
   * Solo necesitamos crear la preferencia - el SDK React se encarga del resto
   */

  /**
   * Crea una preferencia de pago en el backend
   */
  async createPreference(items: CheckoutProItem[]): Promise<CreatePreferenceResponse> {
    try {
      const requestData = {
        items: items.map(item => ({
          ProductoId: item.productoId,
          VarianteId: item.varianteId,
          Marca: item.marca,
          Modelo: item.modelo,
          Ram: item.ram,
          Almacenamiento: item.almacenamiento,
          Color: item.color,
          Cantidad: item.cantidad,
          Precio: item.precio
        }))
      };

      console.log('🔧 Creando preferencia:', requestData);

      const response = await api.post<CreatePreferenceResponse>('/Pagos/crear-preferencia', requestData);
      
      console.log('✅ Preferencia creada:', response.data);
      
      if (!response.data.success || !response.data.preferenceId) {
        throw new Error('La respuesta del servidor no contiene un preferenceId válido');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al crear preferencia:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al crear la preferencia de pago');
    }
  }

  /**
   * Obtiene la clave pública desde el backend (opcional, ya está hardcodeada)
   */
  async getPublicKey(): Promise<string> {
    try {
      const response = await api.get<{ publicKey: string }>('/Pagos/mercadopago/public-key');
      return response.data.publicKey;
    } catch (error) {
      console.error('❌ Error al obtener public key:', error);
      // Fallback a la clave hardcodeada
      return 'APP_USR-2fd73940-1ce1-4521-956e-b5fcf2c7db9c';
    }
  }
}

// Instancia singleton
export const checkoutProService = new CheckoutProService();
