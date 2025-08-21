import api from "@/config/axios";

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
  sessionId?: string;
  externalReference?: string;
}

class CheckoutProService {
  /**
   * Crea una preferencia de pago en el backend
   */
  async createPreference(
    items: CheckoutProItem[]
  ): Promise<CreatePreferenceResponse> {
    try {
      // Validar items antes de enviar
      if (!items || items.length === 0) {
        throw new Error("No hay items para procesar");
      }

      // Validar cada item
      for (const item of items) {
        if (
          !item.varianteId ||
          !item.cantidad ||
          item.cantidad <= 0 ||
          !item.precio ||
          item.precio <= 0
        ) {
          throw new Error(`Item inválido: ${item.marca} ${item.modelo}`);
        }
      }

      const requestData = {
        items: items.map((item) => ({
          ProductoId: item.productoId,
          VarianteId: item.varianteId,
          Marca: item.marca,
          Modelo: item.modelo,
          Ram: item.ram,
          Almacenamiento: item.almacenamiento,
          Color: item.color,
          Cantidad: item.cantidad,
          Precio: item.precio,
        })),
      };

      console.log("🔧 Creando preferencia:", requestData);

      const response = await api.post<CreatePreferenceResponse>(
        "/Pagos/crear-preferencia",
        requestData
      );

      console.log("✅ Preferencia creada:", response.data);

      if (!response.data.success || !response.data.preferenceId) {
        throw new Error(
          "La respuesta del servidor no contiene un preferenceId válido"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Error al crear preferencia:", error);
      console.error("❌ Detalles del error:", error.response?.data);

      // Mejorar el manejo de errores específicos
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message || "Error en la solicitud";
        throw new Error(errorMessage);
      } else if (error.response?.status === 500) {
        throw new Error(
          "Error interno del servidor. Por favor, inténtelo nuevamente."
        );
      } else if (!error.response) {
        throw new Error("Error de conexión. Verifique su conexión a internet.");
      }

      throw new Error(
        error.response?.data?.message || "Error al crear la preferencia de pago"
      );
    }
  }

  /**
   * Obtiene la clave pública desde el backend
   */
  async getPublicKey(): Promise<string> {
    try {
      const response = await api.get<{ publicKey: string }>(
        "/Pagos/mercadopago/public-key"
      );
      return response.data.publicKey;
    } catch (error) {
      console.error("❌ Error al obtener public key:", error);
      // Fallback a la clave hardcodeada
      return "APP_USR-577a322a-6a01-4928-92bd-dbed5e7ed551";
    }
  }

  /**
   * Libera las reservas de stock para una sesión específica
   */
  async liberarReservasSesion(sessionId?: string): Promise<boolean> {
    try {
      if (!sessionId) return false;

      await api.post(`/Pagos/liberar-reservas-sesion`, { sessionId });
      console.log("✅ Reservas liberadas para sesión:", sessionId);
      return true;
    } catch (error) {
      console.error("❌ Error al liberar reservas:", error);
      return false;
    }
  }

  /**
   * Verifica el stock disponible antes de crear la preferencia
   */
  async verificarStock(
    items: CheckoutProItem[]
  ): Promise<{ disponible: boolean; mensaje?: string }> {
    try {
      const verificaciones = items.map((item) => ({
        varianteId: item.varianteId,
        cantidad: item.cantidad,
      }));

      const response = await api.post<{
        disponible: boolean;
        mensaje?: string;
      }>("/Pagos/verificar-stock", { items: verificaciones });
      return response.data;
    } catch (error) {
      console.error("❌ Error al verificar stock:", error);
      return {
        disponible: false,
        mensaje: "Error al verificar disponibilidad",
      };
    }
  }
}

// Instancia singleton
export const checkoutProService = new CheckoutProService();
