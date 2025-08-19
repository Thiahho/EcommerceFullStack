import axios from '../config/axios';

export interface PaymentData {
  name: string;
  surname: string;
  email: string;
  areaCode: string;
  phoneNumber: string;
  identificationType?: string;
  identificationNumber: string;
  productoId: number;
  varianteId: number;
  cantidad: number;
}

export interface PaymentResponse {
  success: boolean;
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  publicKey: string;
  pedido: {
    producto: string;
    variante: string;
    cantidad: number;
    precioUnitario: number;
    precioTotal: number;
  };
}

export interface PaymentResult {
  collection_id: string;
  collection_status: string;
  payment_id: string;
  status: string;
  external_reference: string;
  payment_type: string;
  merchant_order_id: string;
  preference_id: string;
  site_id: string;
  processing_mode: string;
  merchant_account_id: string;
}

class PaymentService {
  /**
   * Procesa el pago con Mercado Pago
   */
  async procesarPago(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await axios.post('/procesar-pago', paymentData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al procesar el pago');
    }
  }

  /**
   * Redirige al usuario a la página de pago de Mercado Pago
   */
  redirectToPayment(initPoint: string, sandbox = true): void {
    // Para sandbox, usar sandboxInitPoint directamente
    // Para producción, usar initPoint directamente
    window.location.href = initPoint;
  }

  /**
   * Obtiene el estado de un pago
   */
  async obtenerEstadoPago(paymentId: string): Promise<any> {
    try {
      const response = await axios.get(`/pago/estado/${paymentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener el estado del pago');
    }
  }

  /**
   * Valida los datos de pago antes de enviar
   */
  validarDatosPago(data: PaymentData): string[] {
    const errores: string[] = [];

    if (!data.name.trim()) errores.push('El nombre es requerido');
    if (!data.surname.trim()) errores.push('El apellido es requerido');
    if (!data.email.trim()) errores.push('El email es requerido');
    if (!data.areaCode.trim()) errores.push('El código de área es requerido');
    if (!data.phoneNumber.trim()) errores.push('El número de teléfono es requerido');
    if (!data.identificationNumber.trim()) errores.push('El número de identificación es requerido');
    if (!data.productoId) errores.push('Debe seleccionar un producto');
    if (!data.varianteId) errores.push('Debe seleccionar una variante del producto');
    if (data.cantidad <= 0) errores.push('La cantidad debe ser mayor a 0');

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errores.push('El formato del email es inválido');
    }

    return errores;
  }

  /**
   * Formatea el número de teléfono
   */
  formatearTelefono(areaCode: string, phoneNumber: string): string {
    return `${areaCode}${phoneNumber}`;
  }

  /**
   * Obtiene los tipos de identificación disponibles
   */
  getTiposIdentificacion(): Array<{ value: string; label: string }> {
    return [
      { value: 'DNI', label: 'DNI - Documento Nacional de Identidad' },
      { value: 'CI', label: 'CI - Cédula de Identidad' },
      { value: 'LC', label: 'LC - Libreta Cívica' },
      { value: 'LE', label: 'LE - Libreta de Enrolamiento' },
      { value: 'PASSPORT', label: 'Pasaporte' },
      { value: 'CUIL', label: 'CUIL' },
      { value: 'CUIT', label: 'CUIT' }
    ];
  }
}

export const paymentService = new PaymentService();
export default paymentService;
