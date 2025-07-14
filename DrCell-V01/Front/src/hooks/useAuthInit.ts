import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Hook para inicializar y verificar el estado de autenticación
 * Verifica si el usuario está autenticado usando cookies httpOnly
 */
export const useAuthInit = () => {
  const { checkAuthStatus } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        await checkAuthStatus();
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [checkAuthStatus, isInitialized]);

  return { isLoading, isInitialized };
}; 