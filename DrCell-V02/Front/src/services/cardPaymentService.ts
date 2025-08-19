import axios from '../config/axios';

// Tipos para el pago con tarjeta
export interface CardPaymentData {
  name: string;
  surname: string;
  email: string;
  areaCode: string;
  phoneNumber: string;
  identificationType: string;
  identificationNumber: string;
  productoId: number;
  varianteId: number;
  cantidad: number;
  cardToken: string;
  paymentMethodId: string;
  cardholderIdentificationType: string;
  cardholderIdentificationNumber: string;
  cardholderName: string;
  installments: number;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  billingCountry?: string;
}

export interface CardPaymentResponse {
  success: boolean;
  message: string;
  paymentId: number | null;
  status: string;
  statusDetail: string;
  amount: number;
  currency: string;
  dateCreated: string | null;
  dateApproved: string | null;
  transactionId: string | null;
  authorizationCode: string | null;
  paymentMethod: {
    id: string;
    type: string;
    name: string;
    lastFourDigits: string | null;
    installments: number | null;
  } | null;
  product: {
    id: number;
    name: string;
    variant: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  } | null;
  customer: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    identification: string;
  } | null;
}

export interface CardData {
  cardNumber: string;
  securityCode: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  cardholderName: string;
  docType: string;
  docNumber: string;
}

export interface TokenResponse {
  id: string;
  public_key: string;
  first_six_digits: string;
  expiration_month: number;
  expiration_year: number;
  last_four_digits: string;
  cardholder: {
    name: string;
    identification: {
      number: string;
      type: string;
    };
  };
  status: string;
  date_created: string;
  date_last_updated: string;
  date_due: string;
  luhn_validation: boolean;
  live_mode: boolean;
  require_esc: boolean;
  card_number_length: number;
  security_code_length: number;
}

declare global {
  interface Window {
    MercadoPago: any;
    mp: any;
  }
}

class CardPaymentService {
  private publicKey = '';
  private isInitialized = false;

  /**
   * Inicializa MercadoPago V2 con la clave pública
   */
  async initialize(publicKey: string): Promise<void> {
    try {
      this.publicKey = publicKey;
      
      // Verificar si MercadoPago SDK V2 está cargado
      if (typeof window.MercadoPago === 'undefined') {
        // Cargar el SDK V2 dinámicamente
        await this.loadMercadoPagoSDK();
      }

      // Inicializar MercadoPago V2 con la clave pública
      window.mp = new window.MercadoPago(publicKey);
      this.isInitialized = true;
      
      console.log('✅ MercadoPago V2 inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar MercadoPago V2:', error);
      throw new Error('Error al inicializar MercadoPago V2');
    }
  }

  /**
   * Carga el SDK de MercadoPago V2 dinámicamente
   */
  private loadMercadoPagoSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="sdk.mercadopago.com"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error al cargar MercadoPago SDK V2'));
      document.head.appendChild(script);
    });
  }

  /**
   * Valida los datos de la tarjeta
   */
  validateCardData(cardData: CardData): string[] {
    const errors: string[] = [];

    if (!cardData.cardNumber || cardData.cardNumber.length < 13) {
      errors.push('Número de tarjeta inválido');
    }

    if (!cardData.securityCode || cardData.securityCode.length < 3) {
      errors.push('Código de seguridad inválido');
    }

    if (!cardData.cardExpirationMonth || !cardData.cardExpirationYear) {
      errors.push('Fecha de vencimiento inválida');
    }

    // Validar mes
    const month = parseInt(cardData.cardExpirationMonth);
    if (cardData.cardExpirationMonth && (month < 1 || month > 12)) {
      errors.push('Mes inválido (debe ser entre 01 y 12)');
    }

    // Validar año
    const year = parseInt(cardData.cardExpirationYear);
    if (cardData.cardExpirationYear && (year < 0 || (year < 100 && year < 23) || (year >= 100 && year < 2023))) {
      errors.push('Año inválido');
    }

    if (!cardData.cardholderName.trim()) {
      errors.push('Nombre del tarjetahabiente es requerido');
    }

    if (!cardData.docType || !cardData.docNumber) {
      errors.push('Documento del tarjetahabiente es requerido');
    }

    // Validar que la tarjeta no esté vencida
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Procesar el año correctamente (convertir YY a YYYY)
    let cardYear = parseInt(cardData.cardExpirationYear);
    const cardMonth = parseInt(cardData.cardExpirationMonth);
    
    // Si el año tiene 2 dígitos, convertirlo a 4 dígitos
    if (cardYear < 100) {
      // Si el año es menor que los últimos 2 dígitos del año actual, asumimos que es del siguiente siglo
      const currentYearShort = currentYear % 100;
      if (cardYear < currentYearShort - 10) {
        cardYear += 2100; // Próximo siglo
      } else {
        cardYear += 2000; // Siglo actual
      }
    }

    if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
      errors.push('La tarjeta está vencida');
    }

    return errors;
  }

  /**
   * Tokeniza una tarjeta de crédito
   */
  async createCardToken(cardData: CardData): Promise<TokenResponse> {
    try {
      if (!this.isInitialized) {
        throw new Error('MercadoPago no está inicializado');
      }

      // Validar datos antes de tokenizar
      const validationErrors = this.validateCardData(cardData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Normalizar el año para MercadoPago
      let normalizedYear = cardData.cardExpirationYear;
      const yearInt = parseInt(cardData.cardExpirationYear);
      
      // Si el año tiene 2 dígitos, convertirlo a 4 dígitos
      if (yearInt < 100) {
        const currentYear = new Date().getFullYear();
        const currentYearShort = currentYear % 100;
        if (yearInt < currentYearShort - 10) {
          normalizedYear = (2100 + yearInt).toString();
        } else {
          normalizedYear = (2000 + yearInt).toString();
        }
      }

      // Mapear el tipo de documento para MercadoPago
      const mappedDocType = this.mapDocTypeForMercadoPago(cardData.docType);
      console.log('🔧 DocType original:', cardData.docType, '→ Mapeado:', mappedDocType);

      // Crear el token usando MercadoPago V2
      const cardToken = await window.mp.fields.createCardToken({
        cardNumber: cardData.cardNumber.replace(/\s/g, ''), // Remover espacios
        securityCode: cardData.securityCode,
        cardExpirationMonth: cardData.cardExpirationMonth,
        cardExpirationYear: normalizedYear,
        cardholderName: cardData.cardholderName,
        identificationType: mappedDocType,
        identificationNumber: cardData.docNumber
      });

      if (cardToken.error) {
        throw new Error(cardToken.error.message || 'Error al tokenizar la tarjeta');
      }

      const response = cardToken;

      console.log('✅ Token creado exitosamente:', response.id);
      return response;

    } catch (error: any) {
      console.error('❌ Error al crear token:', error);
      throw new Error(error.message || 'Error al tokenizar la tarjeta');
    }
  }

  /**
   * Obtiene los métodos de pago disponibles
   */
  async getPaymentMethods(): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        throw new Error('MercadoPago no está inicializado');
      }

      // Usar MercadoPago V2 para obtener métodos de pago
      const response = await window.mp.getPaymentMethods();

      return response.results.filter((method: any) => method.payment_type_id === 'credit_card' || method.payment_type_id === 'debit_card');
    } catch (error) {
      console.error('❌ Error al obtener métodos de pago:', error);
      return [];
    }
  }

  /**
   * Identifica el método de pago basado en el número de tarjeta
   */
  async getPaymentMethod(cardNumber: string): Promise<any> {
    try {
      if (!this.isInitialized) {
        throw new Error('MercadoPago no está inicializado');
      }

      // Usar MercadoPago V2 para obtener método de pago
      const bin = cardNumber.replace(/\s/g, '').substring(0, 6);
      const paymentMethods = await window.mp.getPaymentMethods();
      
      // Buscar el método de pago basado en el BIN
      const response = paymentMethods.results.find((method: any) => 
        method.payment_type_id === 'credit_card' || method.payment_type_id === 'debit_card'
      );

      if (!response) {
        throw new Error('No se pudo identificar el método de pago');
      }

      return response;
    } catch (error) {
      console.error('❌ Error al identificar método de pago:', error);
      return null;
    }
  }

  /**
   * Procesa el pago con tarjeta
   */
  async processCardPayment(paymentData: CardPaymentData): Promise<CardPaymentResponse> {
    try {
      // Mapear los datos al formato que espera el backend (PascalCase)
      const backendPayload = {
        Name: paymentData.name,
        Surname: paymentData.surname,
        Email: paymentData.email,
        AreaCode: paymentData.areaCode,
        PhoneNumber: paymentData.phoneNumber,
        IdentificationType: paymentData.identificationType,
        IdentificationNumber: paymentData.identificationNumber,
        ProductoId: paymentData.productoId,
        VarianteId: paymentData.varianteId,
        Cantidad: paymentData.cantidad,
        CardToken: paymentData.cardToken,
        PaymentMethodId: paymentData.paymentMethodId,
        CardholderIdentificationType: paymentData.cardholderIdentificationType,
        CardholderIdentificationNumber: paymentData.cardholderIdentificationNumber,
        CardholderName: paymentData.cardholderName,
        Installments: paymentData.installments,
        BillingAddress: paymentData.billingAddress,
        BillingCity: paymentData.billingCity,
        BillingState: paymentData.billingState,
        BillingZipCode: paymentData.billingZipCode,
        BillingCountry: paymentData.billingCountry
      };

      console.log('🔧 Datos originales de pago:', paymentData);
      console.log('🔧 Objeto completo que se envía:', JSON.stringify(backendPayload, null, 2));
      
      const response = await axios.post('/procesar-pago-tarjeta', backendPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al procesar pago:', error);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('❌ Errores de validación:', JSON.stringify(error.response?.data?.errors, null, 2));
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      throw new Error(error.message || 'Error al procesar el pago');
    }
  }

  /**
   * Valida los datos de pago antes de enviar
   */
  validatePaymentData(data: CardPaymentData): string[] {
    const errors: string[] = [];

    if (!data.name.trim()) errors.push('El nombre es requerido');
    if (!data.surname.trim()) errors.push('El apellido es requerido');
    if (!data.email.trim()) errors.push('El email es requerido');
    if (!data.phoneNumber.trim()) errors.push('El teléfono es requerido');
    if (!data.identificationNumber.trim()) errors.push('La identificación es requerida');
    if (!data.cardToken) errors.push('Token de tarjeta es requerido');
    if (!data.paymentMethodId) errors.push('Método de pago es requerido');
    if (!data.cardholderName.trim()) errors.push('Nombre del tarjetahabiente es requerido');
    if (!data.cardholderIdentificationNumber.trim()) errors.push('Identificación del tarjetahabiente es requerida');

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Formato de email inválido');
    }

    // Validar cantidad
    if (data.cantidad <= 0) {
      errors.push('La cantidad debe ser mayor a 0');
    }

    return errors;
  }

  /**
   * Obtiene los tipos de identificación disponibles para Argentina
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

  /**
   * Mapea los tipos de identificación a los códigos esperados por MercadoPago Argentina
   */
  private mapDocTypeForMercadoPago(docType: string): string {
    const mapping: { [key: string]: string } = {
      'DNI': 'DNI',         // Documento Nacional de Identidad
      'CI': 'CI',           // Cédula de Identidad
      'LC': 'LC',           // Libreta Cívica
      'LE': 'LE',           // Libreta de Enrolamiento
      'PASSPORT': 'PASSPORT', // Pasaporte
      'CUIL': 'CUIL',       // CUIL
      'CUIT': 'CUIT',       // CUIT
      // Mapeos de compatibilidad con códigos anteriores
      'CC': 'DNI',          // Mapear CC a DNI como fallback
      'CE': 'DNI',          // Mapear CE a DNI como fallback
      'TI': 'DNI',          // Mapear TI a DNI como fallback
      'PP': 'PASSPORT',     // Mapear PP a PASSPORT
      'NIT': 'CUIT'         // Mapear NIT a CUIT como fallback
    };
    return mapping[docType] || 'DNI'; // Default a DNI si no se encuentra
  }

  /**
   * Formatea el número de tarjeta para mostrar
   */
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Obtiene el nombre del método de pago
   */
  getPaymentMethodName(paymentMethodId: string): string {
    const methods: { [key: string]: string } = {
      'visa': 'Visa',
      'master': 'Mastercard',
      'amex': 'American Express',
      'diners': 'Diners Club',
      'naranja': 'Naranja',
      'maestro': 'Maestro',
      'cabal': 'Cabal',
      'argencard': 'Argencard',
      'tarshop': 'Tarjeta Shopping',
      'cencosud': 'Cencosud'
    };

    return methods[paymentMethodId] || paymentMethodId.toUpperCase();
  }

  /**
   * Obtiene el ícono del método de pago
   */
  getPaymentMethodIcon(paymentMethodId: string): string {
    const icons: { [key: string]: string } = {
      'visa': '💳',
      'master': '💳',
      'amex': '💳',
      'diners': '💳',
      'maestro': '💳'
    };

    return icons[paymentMethodId] || '💳';
  }
}

export const cardPaymentService = new CardPaymentService();
export default cardPaymentService;
