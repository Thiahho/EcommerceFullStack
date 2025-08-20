import { CartItem } from '@/store/cart-store';
import { CheckoutProItem } from '@/services/checkoutProService';

/**
 * Convierte los items del carrito al formato requerido por MercadoPago Checkout Pro
 */
export const convertCartItemsToCheckoutItems = (cartItems: CartItem[]): CheckoutProItem[] => {
  return cartItems.map(item => ({
    productoId: item.productoId,
    varianteId: item.varianteId,
    marca: item.marca,
    modelo: item.modelo,
    ram: item.ram,
    almacenamiento: item.almacenamiento,
    color: item.color,
    cantidad: item.cantidad,
    precio: item.precio
  }));
};

/**
 * Valida que todos los items del carrito tengan los datos necesarios
 */
export const validateCartItemsForCheckout = (cartItems: CartItem[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!cartItems || cartItems.length === 0) {
    errors.push('El carrito está vacío');
    return { valid: false, errors };
  }

  cartItems.forEach((item, index) => {
    if (!item.productoId) {
      errors.push(`Item ${index + 1}: ID del producto es requerido`);
    }
    
    if (!item.varianteId) {
      errors.push(`Item ${index + 1}: ID de la variante es requerido`);
    }

    if (!item.marca || item.marca.trim() === '') {
      errors.push(`Item ${index + 1}: Marca es requerida`);
    }

    if (!item.modelo || item.modelo.trim() === '') {
      errors.push(`Item ${index + 1}: Modelo es requerido`);
    }

    if (!item.ram || item.ram.trim() === '') {
      errors.push(`Item ${index + 1}: RAM es requerida`);
    }

    if (!item.almacenamiento || item.almacenamiento.trim() === '') {
      errors.push(`Item ${index + 1}: Almacenamiento es requerido`);
    }

    if (!item.color || item.color.trim() === '') {
      errors.push(`Item ${index + 1}: Color es requerido`);
    }

    if (!item.cantidad || item.cantidad <= 0) {
      errors.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
    }

    if (!item.precio || item.precio <= 0) {
      errors.push(`Item ${index + 1}: Precio debe ser mayor a 0`);
    }

    if (item.cantidad > item.stock) {
      errors.push(`Item ${index + 1}: Cantidad solicitada (${item.cantidad}) excede el stock disponible (${item.stock})`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Calcula el total del carrito
 */
export const calculateCartTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
};

/**
 * Calcula la cantidad total de items en el carrito
 */
export const calculateTotalItems = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + item.cantidad, 0);
};
