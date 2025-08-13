// Configuración del backend
export const config = {
  // URL base de la API (desde variables de entorno o valor por defecto)
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5218',
  
  // Timeout para las peticiones HTTP
  API_TIMEOUT: 10000,
  
  // Configuración de reintentos
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Endpoints de la API
  ENDPOINTS: {
    PRODUCTOS: '/Productos',
    CATEGORIAS: '/Categorias',
    LOGIN: '/Login',
    ADMIN: '/Admin'
  }
};

// Función para obtener la URL completa de un endpoint
export const getApiUrl = (endpoint) => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// Función para validar si la API está disponible
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${config.API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.error('Error al verificar la salud de la API:', error);
    return false;
  }
};
