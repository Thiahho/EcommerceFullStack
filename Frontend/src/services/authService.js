import api, { handleApiError } from '../lib/axios';

// Servicio de autenticación
export const authService = {
  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await api.post('/Login', credentials);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Registro de usuario (si existe en el backend)
  register: async (userData) => {
    try {
      const response = await api.post('/Register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  // Refresh token (si está implementado)
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  }
};
