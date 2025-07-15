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
          const response = await api.get('/Admin/verify');
          if (response.data.isAuthenticated) {
            const userData = response.data.usuario;
            set({ 
              user: {
                id: parseInt(userData.id),
                email: userData.email,
                role: userData.rol.toLowerCase()
              }
            });
            return true;
          } else {
            set({ user: null });
            return false;
          }
        } catch (error) {
          console.error('Error al verificar estado de autenticación:', error);
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

