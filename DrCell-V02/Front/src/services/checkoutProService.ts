import api from '@/config/axios';

// Tipos para Checkout Pro
interface CheckoutProItem {
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

interface CreatePreferenceResponse {
  success: boolean;
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

// Declaraciones para MercadoPago V2 Checkout Pro
declare global {
  interface Window {
    MercadoPago: any;
    mp: any;
  }
}

class CheckoutProService {
  private publicKey = '';
  private isInitialized = false;

  /**
   * Inicializa MercadoPago V2 para Checkout Pro
   */
  async initialize(publicKey: string): Promise<void> {
    try {
      this.publicKey = publicKey;
      
      // Verificar si MercadoPago SDK V2 está cargado
      if (typeof window.MercadoPago === 'undefined') {
        await this.loadMercadoPagoSDK();
      }

      // Para Checkout Pro V2, simplemente verificamos que el SDK esté cargado
      // No necesitamos crear una instancia como en pagos directos
      this.isInitialized = true;
      
      console.log('✅ MercadoPago V2 Checkout Pro inicializado correctamente');
      console.log('🔧 SDK disponible:', {
        MercadoPago: typeof window.MercadoPago,
        publicKey: this.publicKey
      });
    } catch (error) {
      console.error('❌ Error al inicializar MercadoPago V2 Checkout Pro:', error);
      throw new Error('Error al inicializar MercadoPago V2 para Checkout Pro');
    }
  }

  /**
   * Carga el SDK de MercadoPago V2 dinámicamente
   */
  private loadMercadoPagoSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="sdk.mercadopago.com"]')) {
        // Si ya existe, esperar un momento para que esté disponible
        setTimeout(() => {
          if (typeof window.MercadoPago !== 'undefined') {
            resolve();
          } else {
            reject(new Error('SDK cargado pero MercadoPago no disponible'));
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        // Esperar un momento para que el SDK esté disponible
        setTimeout(() => {
          if (typeof window.MercadoPago !== 'undefined') {
            console.log('✅ SDK V2 cargado correctamente');
            resolve();
          } else {
            reject(new Error('SDK cargado pero MercadoPago no disponible'));
          }
        }, 200);
      };
      script.onerror = () => reject(new Error('Error al cargar MercadoPago SDK V2'));
      document.head.appendChild(script);
    });
  }

  /**
   * Crea una preferencia de pago en el backend
   */
  async createPreference(items: CheckoutProItem[]): Promise<CreatePreferenceResponse> {
    try {
      const requestData: CreatePreferenceRequest = {
        items: items.map(item => ({
          productoId: item.productoId,
          varianteId: item.varianteId,
          marca: item.marca,
          modelo: item.modelo,
          ram: item.ram,
          almacenamiento: item.almacenamiento,
          color: item.color,
          cantidad: item.cantidad,
          precio: item.precio
        }))
      };

      console.log('🔧 Creando preferencia:', requestData);

      const response = await api.post<CreatePreferenceResponse>('/crear-preferencia', requestData);
      
      console.log('✅ Preferencia creada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al crear preferencia:', error);
      throw new Error(error.response?.data?.message || 'Error al crear la preferencia de pago');
    }
  }

  /**
   * Inicializa el checkout y redirige a MercadoPago
   */
  async initCheckout(preferenceId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('MercadoPago no está inicializado');
      }

      console.log('🔧 Inicializando Checkout Pro con preferenceId:', preferenceId);
      console.log('🔧 Public Key:', this.publicKey);

      // Inicializar MercadoPago V2 con la clave pública
      const mp = new window.MercadoPago(this.publicKey);
      
      // Crear el checkout con la preferencia
      const checkout = mp.checkout({
        preference: {
          id: preferenceId
        },
        autoOpen: true, // Abre automáticamente la ventana de pago
      });

      console.log('✅ Checkout Pro inicializado:', checkout);
    } catch (error) {
      console.error('❌ Error al inicializar Checkout Pro:', error);
      console.error('❌ Error completo:', error);
      throw new Error('Error al inicializar el checkout');
    }
  }

  /**
   * Proceso completo: crear preferencia e inicializar checkout
   */
  async processCheckout(items: CheckoutProItem[]): Promise<void> {
    try {
      // 1. Crear preferencia en el backend
      const preference = await this.createPreference(items);
      
      // 2. Inicializar checkout con la preferencia
      await this.initCheckout(preference.preferenceId);
      
    } catch (error) {
      console.error('❌ Error en proceso de checkout:', error);
      throw error;
    }
  }

  /**
   * Obtiene la clave pública desde el backend
   */
  async getPublicKey(): Promise<string> {
    try {
      const response = await api.get<{ publicKey: string }>('/mercadopago/public-key');
      return response.data.publicKey;
    } catch (error) {
      console.error('❌ Error al obtener public key:', error);
      throw new Error('Error al obtener la clave pública');
    }
  }
}

// Instancia singleton
export const checkoutProService = new CheckoutProService();

// Tipos para exportar
export type { CheckoutProItem, CreatePreferenceRequest, CreatePreferenceResponse };
