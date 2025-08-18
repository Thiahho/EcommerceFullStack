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
          // Llamar al endpoint de logout del servidor para limpiar cookies
          await api.post('/Admin/logout');
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        } finally {
          // Limpiar estado local
          set({ user: null });
          
          // Limpiar cualquier dato legacy en localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirigir al login
          window.location.href = '/login';
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
    }
  )
);

