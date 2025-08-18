
import axios from 'axios';

// 🚨 HARDCODED PARA DEBUG - FORZAR HTTP
const FORCE_HTTP_URL = 'http://localhost:5000';

// Configuración dinámica de la URL base
const getBaseURL = () => {
  console.log('🔧 DEBUG - axios.ts getBaseURL()');
  console.log('🔧 DEBUG - process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('🔧 DEBUG - process.env.NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 DEBUG - window.location.protocol:', typeof window !== 'undefined' ? window.location.protocol : 'N/A');
  
  // FORZAMOS HTTP para debug
  console.log('🔧 DEBUG - FORZANDO URL:', FORCE_HTTP_URL);
  return FORCE_HTTP_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // 🔑 Crítico: Permite envío de cookies httpOnly
});

// 🔑 Interceptor para manejar autenticación con cookies + localStorage fallback
api.interceptors.request.use(
  (config) => {
    console.log(`🔗 API Call: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('🍪 Cookies en la request:', document.cookie);
    console.log('🔧 withCredentials:', config.withCredentials);
    
    // 🔧 TEMP: En desarrollo, usar localStorage como fallback si no hay cookies
    if (process.env.NODE_ENV === 'development') {
      const token = localStorage.getItem('authToken');
      const hasCookie = document.cookie.includes('AuthToken');
      
      console.log('🔧 localStorage token existe:', !!token);
      console.log('🔧 Cookie AuthToken existe:', hasCookie);
      
      if (token && !hasCookie) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔧 TEMP: Usando token de localStorage');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    
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