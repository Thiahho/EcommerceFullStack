import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: number;
  productoId: number;
  marca: string;
  modelo: string;
  ram: string;
  almacenamiento: string;
  color: string;
  precio: number;
  stock: number;
  img: string;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'cantidad'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, cantidad: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartItems: () => CartItem[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (newItem) => {
        const state = get();
        const existingItem = state.items.find(
          item => 
            item.productoId === newItem.productoId &&
            item.ram === newItem.ram &&
            item.almacenamiento === newItem.almacenamiento &&
            item.color === newItem.color
        );

        if (existingItem) {
          // Si ya existe, incrementar cantidad
          set({
            items: state.items.map(item =>
              item.id === existingItem.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            )
          });
        } else {
          // Si no existe, agregar nuevo item
          const newCartItem: CartItem = {
            ...newItem,
            id: Date.now(), // ID único temporal
            cantidad: 1
          };
          set({ items: [...state.items, newCartItem] });
        }
      },

      removeFromCart: (id) => {
        const state = get();
        set({ items: state.items.filter(item => item.id !== id) });
      },

      updateQuantity: (id, cantidad) => {
        const state = get();
        if (cantidad <= 0) {
          set({ items: state.items.filter(item => item.id !== id) });
        } else {
          set({
            items: state.items.map(item =>
              item.id === id ? { ...item, cantidad } : item
            )
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.cantidad, 0);
      },

      getTotalPrice: () => {
        const state = get();
        return state.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
      },

      getCartItems: () => {
        const state = get();
        return state.items;
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
); 