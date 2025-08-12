import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = 'http://localhost:5218'; // Puerto HTTPS del backend

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para enviar cookies si es necesario
});

// Interceptor para agregar el token JWT a todas las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-info');
      
      // Opcional: redirigir al login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Manejar otros errores
    if (error.response?.status === 403) {
      console.error('Acceso denegado:', error.response.data);
    }
    
    if (error.response?.status >= 500) {
      console.error('Error del servidor:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Función helper para manejar errores de red
export const handleApiError = (error) => {
  if (error.code === 'ECONNABORTED') {
    return 'Tiempo de espera agotado. Por favor, intenta de nuevo.';
  }
  
  if (error.response) {
    // El servidor respondió con un código de error
    return error.response.data?.message || error.response.data || 'Error en el servidor';
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    return 'No se pudo conectar con el servidor. Verifica tu conexión.';
  } else {
    // Algo más causó el error
    return error.message || 'Error desconocido';
  }
};

export default api;
