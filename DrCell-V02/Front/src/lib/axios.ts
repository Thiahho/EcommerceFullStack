import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';

// Configuración dinámica de la URL base
const getBaseURL = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.REACT_APP_API_URL || 'https://api.drcell.com';
    }
    return 'http://localhost:5015';
};

const baseURL = getBaseURL();

const api = axios.create({
    baseURL: baseURL + '/',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Extender la interfaz de configuración de Axios
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// Función para verificar si el token está expirado
const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Agregar un margen de 5 minutos antes de considerar el token expirado
        return (payload.exp * 1000) < (Date.now() - 5 * 60 * 1000);
    } catch {
        return true;
    }
};

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 