import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

// Store de autenticación con Zustand
const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Acción para login
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/Login', credentials);
          const { token, user } = response.data;
          
          // Guardar token en localStorage
          localStorage.setItem('auth-token', token);
          localStorage.setItem('user-info', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Error en el login';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage
          });
          
          return { success: false, error: errorMessage };
        }
      },

      // Acción para logout
      logout: () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-info');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      },

      // Acción para verificar token al cargar la app
      checkAuth: () => {
        const token = localStorage.getItem('auth-token');
        const userInfo = localStorage.getItem('user-info');
        
        if (token && userInfo) {
          try {
            const user = JSON.parse(userInfo);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (error) {
            // Si hay error parseando el usuario, limpiar todo
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user-info');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        }
      },

      // Limpiar errores
      clearError: () => set({ error: null }),

      // Verificar si el usuario es admin
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN' || user?.rol === 'ADMIN';
      },

      // Actualizar información del usuario
      updateUser: (userInfo) => {
        localStorage.setItem('user-info', JSON.stringify(userInfo));
        set({ user: userInfo });
      }
    }),
    {
      name: 'auth-storage', // nombre de la clave en localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
