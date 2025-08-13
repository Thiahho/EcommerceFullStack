// Script para probar la conexión con el backend
import { productosService, categoriasService } from './api';

export const testBackendConnection = async () => {
  console.log('🧪 Probando conexión con el backend...');
  
  try {
    // Probar endpoint de productos
    console.log('📦 Probando endpoint de productos...');
    const productos = await productosService.getAll();
    console.log('✅ Productos obtenidos:', productos.length);
    
    // Probar endpoint de categorías
    console.log('🏷️ Probando endpoint de categorías...');
    const categorias = await categoriasService.getAll();
    console.log('✅ Categorías obtenidas:', categorias.length);
    
    console.log('🎉 ¡Conexión exitosa con el backend!');
    return { success: true, productos, categorias };
    
  } catch (error) {
    console.error('❌ Error en la conexión:', error);
    console.error('🔍 Detalles del error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data 
    };
  }
};

// Función para verificar la salud de la API
export const checkApiHealth = async () => {
  try {
    const response = await fetch('http://localhost:5218/health');
    if (response.ok) {
      console.log('✅ API está funcionando correctamente');
      return true;
    } else {
      console.log('⚠️ API responde pero con estado:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ No se puede conectar con la API:', error.message);
    return false;
  }
};
