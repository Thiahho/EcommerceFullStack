import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
/**
 * Hook para inicializar y verificar el estado de autenticación
 * Verifica si el usuario está autenticado usando cookies httpOnly
 * Optimizado para manejar recargas de página correctamente
 */
export const useAuthInit = () => {
  const { checkAuthStatus, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Inicializando autenticación...');
        
        // DEBUG: Verificar qué cookies están disponibles
        console.log('🍪 Cookies disponibles:', document.cookie);
        console.log('🗂️ localStorage authToken:', localStorage.getItem('authToken'));
        console.log('🗂️ sessionStorage auth-storage:', sessionStorage.getItem('auth-storage'));
        
        // Verificar estado de autenticación con el servidor
        const isAuthenticated = await checkAuthStatus();
        
        if (isAuthenticated) {
          console.log('✅ Usuario autenticado correctamente');
        } else {
          console.log('❌ Usuario no autenticado');
          console.log('🔍 Posibles causas:');
          console.log('  - Cookie AuthToken no existe o expiró');
          console.log('  - Problema con CORS/SameSite');
          console.log('  - Token inválido');
        }
        
      } catch (error: any) {
        console.error('❌ Error al inicializar autenticación:', error);
        console.log('🔍 Detalles del error:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status
        });
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log('🏁 Inicialización de autenticación completada');
      }
    };

    // Solo inicializar una vez
    if (!isInitialized) {
      initializeAuth();
    }
  }, [checkAuthStatus, isInitialized]);

  // Log adicional para debugging
  useEffect(() => {
    if (isInitialized) {
      console.log('👤 Estado del usuario:', user ? `${user.email} (${user.role})` : 'No autenticado');
    }
  }, [user, isInitialized]);

  return { isLoading, isInitialized };
}; 