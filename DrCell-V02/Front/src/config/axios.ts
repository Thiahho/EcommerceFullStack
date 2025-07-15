import axios from 'axios';

// Configuración dinámica de la URL base
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://api.drcell.com';
  }
  return 'http://localhost:5015';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // 🔑 Crítico: Permite envío de cookies httpOnly
});

// 🔑 Interceptor para manejar autenticación con cookies
// Ya no necesitamos agregar tokens manualmente - las cookies se envían automáticamente
api.interceptors.request.use(
  (config) => {
    // Las cookies httpOnly se envían automáticamente
    // No necesitamos hacer nada aquí
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Limpiar cualquier token que pueda estar en localStorage (migración)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Intentar cerrar sesión para limpiar cookies
      try {
        await api.post('/Admin/logout');
      } catch (logoutError) {
        // Ignorar errores de logout
      }
      
      // Redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 