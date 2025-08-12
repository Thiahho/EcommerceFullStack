import api, { handleApiError } from '../lib/axios';

// Servicio de categorías
export const categoriaService = {
  // Obtener todas las categorías
  getAllCategorias: async () => {
    try {
      const response = await api.get('/Categorias');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Obtener categoría por ID
  getCategoriaById: async (id) => {
    try {
      const response = await api.get(`/Categorias/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // MÉTODOS ADMIN (requieren autenticación y rol ADMIN)
  
  // Crear categoría
  createCategoria: async (categoriaData) => {
    try {
      const response = await api.post('/Categorias', categoriaData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Actualizar categoría
  updateCategoria: async (id, categoriaData) => {
    try {
      const response = await api.put(`/Categorias/${id}`, categoriaData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Eliminar categoría
  deleteCategoria: async (id) => {
    try {
      const response = await api.delete(`/Categorias/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  }
};
