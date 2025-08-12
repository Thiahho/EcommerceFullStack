import { create } from 'zustand';
import { productService } from '../services/productService';

// Store de productos con Zustand
const useProductStore = create((set, get) => ({
  // Estado inicial
  products: [],
  variantes: [],
  selectedProduct: null,
  selectedVariante: null,
  isLoading: false,
  error: null,
  hasFetchedProducts: false,
  
  // Filtros y opciones
  ramOptions: [],
  storageOptions: [],
  colorOptions: [],

  // Acciones para productos
  fetchProducts: async (force = false) => {
    const { hasFetchedProducts } = get();
    if (hasFetchedProducts && !force) {
      return { success: true, data: get().products };
    }

    set({ isLoading: true, error: null });
    try {
      const result = await productService.getAllProducts();
      if (result.success) {
        set({ 
          products: result.data, 
          isLoading: false,
          hasFetchedProducts: true
        });
        return { success: true, data: result.data };
      } else {
        set({ 
          error: result.error, 
          isLoading: false 
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({ 
        error: 'Error al cargar productos', 
        isLoading: false 
      });
      return { success: false, error: 'Error al cargar productos' };
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await productService.getProductById(id);
      if (result.success) {
        set({ 
          selectedProduct: result.data, 
          isLoading: false 
        });
        return { success: true, data: result.data };
      } else {
        set({ 
          error: result.error, 
          isLoading: false 
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({ 
        error: 'Error al cargar producto', 
        isLoading: false 
      });
      return { success: false, error: 'Error al cargar producto' };
    }
  },

  // Acciones para variantes
  fetchAllVariantes: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await productService.getAllVariantes();
      if (result.success) {
        set({ 
          variantes: result.data, 
          isLoading: false 
        });
        return { success: true, data: result.data };
      } else {
        set({ 
          error: result.error, 
          isLoading: false 
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({ 
        error: 'Error al cargar variantes', 
        isLoading: false 
      });
      return { success: false, error: 'Error al cargar variantes' };
    }
  },

  fetchVariantesByProductId: async (productoId) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await productService.getVariantesByProductId(productoId);
      if (result.success) {
        set({ 
          variantes: result.data, 
          isLoading: false 
        });
        return { success: true, data: result.data };
      } else {
        set({ 
          error: result.error, 
          isLoading: false 
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({ 
        error: 'Error al cargar variantes', 
        isLoading: false 
      });
      return { success: false, error: 'Error al cargar variantes' };
    }
  },

  // Acciones para opciones dinámicas
  fetchRamOptions: async (productoId) => {
    try {
      const result = await productService.getRamOptions(productoId);
      if (result.success) {
        set({ ramOptions: result.data });
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error al cargar opciones de RAM' };
    }
  },

  fetchStorageOptions: async (productoId, ram) => {
    try {
      const result = await productService.getStorageOptions(productoId, ram);
      if (result.success) {
        set({ storageOptions: result.data });
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error al cargar opciones de almacenamiento' };
    }
  },

  fetchColorOptions: async (productoId, ram, almacenamiento) => {
    try {
      const result = await productService.getColorOptions(productoId, ram, almacenamiento);
      if (result.success) {
        set({ colorOptions: result.data });
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error al cargar opciones de color' };
    }
  },

  // Limpiar estado
  clearError: () => set({ error: null }),
  clearSelectedProduct: () => set({ selectedProduct: null }),
  clearSelectedVariante: () => set({ selectedVariante: null }),
  
  // Resetear opciones
  resetOptions: () => set({ 
    ramOptions: [], 
    storageOptions: [], 
    colorOptions: [] 
  }),

  // Helpers
  getProductsByCategory: (categoryId) => {
    const { products } = get();
    return products.filter(product => product.categoriaId === categoryId);
  },

  searchProducts: (searchTerm) => {
    const { products } = get();
    if (!searchTerm) return products;
    
    return products.filter(product => 
      product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}));

export default useProductStore;
