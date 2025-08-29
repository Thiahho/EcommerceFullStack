import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/config/axios';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      
      logout: async () => {
        try {
          console.log('🔧 DEBUG: Iniciando logout desde el store...');
          
          // Llamar al endpoint de logout del servidor para limpiar cookies
          const response = await api.post('/Admin/logout');
          console.log('🔧 DEBUG: Respuesta del servidor:', response.data);
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        } finally {
          console.log('🔧 DEBUG: Limpiando estado local...');
          
          // Limpiar estado local
          set({ user: null });
          
          // Limpiar todos los datos de autenticación
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          
          // Limpiar específicamente el storage de auth de Zustand
          sessionStorage.removeItem('auth-storage');
          localStorage.removeItem('auth-storage'); // Por si acaso se cambió a localStorage
          
          // También limpiar cualquier key que pueda estar en localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.includes('auth') || key.includes('token') || key.includes('user')) {
              localStorage.removeItem(key);
              console.log(`🧹 Limpiado localStorage key: ${key}`);
            }
          });
          
          // Limpiar cookies desde el frontend también (para casos edge)
          document.cookie = 'AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost';
          document.cookie = 'AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
          document.cookie = 'AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=lax';
          
          console.log('🔧 DEBUG: Estado limpiado, redirigiendo...');
          
          // Esperar un poco antes de redirigir para asegurar que el estado se limpia
          setTimeout(() => {
            // Forzar una recarga completa para asegurar que todo se limpia
            window.location.replace('/login');
          }, 100);
        }
      },
      
      checkAuthStatus: async () => {
        try {
          console.log('🔍 Verificando estado de autenticación con el servidor...');
          console.log('🍪 Cookies disponibles:', document.cookie);
          console.log('🗂️ Token en localStorage:', localStorage.getItem('authToken'));
          
          const response = await api.get('/Admin/verify');
          
          console.log('📡 Respuesta del servidor:', response.data);
          
          if (response.data.isAuthenticated) {
            const userData = response.data.usuario;
            const user = {
              id: parseInt(userData.id),
              email: userData.email,
              role: userData.rol.toLowerCase()
            };
            
            console.log('✅ Usuario verificado:', user);
            set({ user });
            return true;
          } else {
            console.log('❌ Usuario no autenticado según el servidor');
            
            // 🔧 Si la verificación falla, intentar con localStorage como respaldo
            const localToken = localStorage.getItem('authToken');
            if (localToken && process.env.NODE_ENV === 'development') {
              console.log('🔄 Intentando re-autenticación con token de localStorage...');
              try {
                // Hacer una segunda verificación con el token en el header
                const retryResponse = await api.get('/Admin/verify', {
                  headers: { Authorization: `Bearer ${localToken}` }
                });
                
                if (retryResponse.data.isAuthenticated) {
                  const userData = retryResponse.data.usuario;
                  const user = {
                    id: parseInt(userData.id),
                    email: userData.email,
                    role: userData.rol.toLowerCase()
                  };
                  
                  console.log('✅ Re-autenticación exitosa con localStorage');
                  set({ user });
                  return true;
                }
              } catch (retryError) {
                console.log('❌ Re-autenticación falló:', retryError);
                // Limpiar token inválido
                localStorage.removeItem('authToken');
              }
            }
            
            set({ user: null });
            return false;
          }
        } catch (error) {
          console.error('❌ Error al verificar estado de autenticación:', error);
          console.log('🔍 Detalles del error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          });
          
          // 🔧 Si hay error 401 o 403, limpiar localStorage
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('authToken');
          }
          
          set({ user: null });
          return false;
        }
      },
      
      isAdmin: () => {
        const state = get();
        return state.user?.role === 'admin';
      },
      
      isAuthenticated: () => {
        const state = get();
        return !!state.user;
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user, // Solo persistir usuario, no tokens
      }),
      onRehydrateStorage: () => (state) => {
        // Al hidratar el estado, verificar si el usuario sigue siendo válido
        if (state?.user) {
          console.log('🔄 Rehidratando estado de auth:', state.user);
        }
      }
    }
  )
);

