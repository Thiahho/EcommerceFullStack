import api, { handleApiError } from '../lib/axios';

// Servicio de productos
export const productService = {
  // Obtener todos los productos
  getAllProducts: async () => {
    try {
      const response = await api.get('/Productos');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/Productos/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Obtener todas las variantes
  getAllVariantes: async () => {
    try {
      const response = await api.get('/Productos/variantes');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Obtener variantes por producto ID
  getVariantesByProductId: async (productoId) => {
    try {
      const response = await api.get(`/Productos/${productoId}/variantes`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Obtener opciones de RAM para un producto
  getRamOptions: async (productoId) => {
    try {
      const response = await api.get(`/Productos/${productoId}/Ram-Opciones`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Obtener opciones de almacenamiento
  getStorageOptions: async (productoId, ram) => {
    try {
      const response = await api.get(`/Productos/${productoId}/Almacenamiento-Opciones`, {
        params: { ram }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Obtener opciones de color
  getColorOptions: async (productoId, ram, almacenamiento) => {
    try {
      const response = await api.get(`/Productos/${productoId}/Color-Opciones`, {
        params: { ram, almacenamiento }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Obtener variante específica
  getVarianteSpec: async (productId, params) => {
    try {
      const response = await api.get(`/Productos/${productId}/variante`, {
        params
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Obtener variante por ID
  getVarianteById: async (varianteId) => {
    try {
      const response = await api.get(`/Productos/variante/${varianteId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // MÉTODOS ADMIN (requieren autenticación y rol ADMIN)
  
  // Crear producto
  createProduct: async (productData) => {
    try {
      const response = await api.post('/Productos', productData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Actualizar producto
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/Productos/${id}`, productData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Eliminar producto
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/Productos/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Crear variante
  createVariante: async (varianteData) => {
    try {
      const response = await api.post('/Productos/variante', varianteData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Actualizar variante
  updateVariante: async (varianteId, varianteData) => {
    try {
      const response = await api.put(`/Productos/variante/${varianteId}`, varianteData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Eliminar variante
  deleteVariante: async (varianteId) => {
    try {
      const response = await api.delete(`/Productos/variante/${varianteId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  }
};
