import axios from 'axios';
import { config } from './config';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: config.DEFAULT_HEADERS,
});

// Adaptador: mapea el producto del backend al shape de UI usado por el frontend
const mapProductoToUI = (producto) => {
  if (!producto) return producto;

  // Precio: tomamos el mínimo de las variantes, si existen
  const variantes = Array.isArray(producto.variantes) ? producto.variantes : [];
  const variantPrices = variantes
    .map(v => (v && (v.Precio ?? v.precio)))
    .filter(p => typeof p === 'number' || typeof p === 'string')
    .map(Number);
  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : null;

  // Imagen: si viene base64 desde backend (byte[] serializado), formamos data URL
  const imageArray = [];
  if (producto.images) {
    const base64 = typeof producto.images === 'string' ? producto.images : null;
    if (base64 && base64.length > 0) {
      imageArray.push(`data:image/jpeg;base64,${base64}`);
    }
  }

  return {
    // IDs
    id: producto.id,
    _id: String(producto.id),

    // Campos UI esperados por componentes
    name: producto.nombre,
    description: producto.descripcion,
    image: imageArray,
    offerPrice: minPrice,
    precio: minPrice,

    // Conservamos campos originales por compatibilidad
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    marca: producto.marca,
    images: producto.images,
    categoriaId: producto.categoriaId,
    categoria: producto.categoria,
    variantes: variantes,
  };
};

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Servicio de Productos
export const productosService = {
  // Obtener todos los productos
  getAll: async () => {
    try {
      const response = await api.get('/Productos');
      const data = Array.isArray(response.data) ? response.data : [];
      return data.map(mapProductoToUI);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  // Obtener producto por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/Productos/${id}`);
      return mapProductoToUI(response.data);
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw error;
    }
  },

  // Obtener todas las variantes
  getAllVariantes: async () => {
    try {
      const response = await api.get('/Productos/variantes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener variantes:', error);
      throw error;
    }
  },

  // Obtener variantes por producto
  getVariantesByProduct: async (productoId) => {
    try {
      const response = await api.get(`/Productos/${productoId}/variantes`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener variantes del producto ${productoId}:`, error);
      throw error;
    }
  },

  // Obtener opciones de RAM por producto
  getRamOpciones: async (productoId) => {
    try {
      const response = await api.get(`/Productos/${productoId}/Ram-Opciones`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener opciones de RAM del producto ${productoId}:`, error);
      throw error;
    }
  }
};

// Servicio de Categorías
export const categoriasService = {
  // Obtener todas las categorías
  getAll: async () => {
    try {
      const response = await api.get('/Categorias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  // Obtener categoría por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/Categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener categoría ${id}:`, error);
      throw error;
    }
  }
};

// Servicio de Autenticación
export const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/Login/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  // Registro
  register: async (userData) => {
    try {
      const response = await api.post('/Login/registro', userData);
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }
};

export default api;
