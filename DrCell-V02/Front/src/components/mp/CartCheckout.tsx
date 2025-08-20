import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import CheckoutPro from './CheckoutPro';
import { convertCartItemsToCheckoutItems, validateCartItemsForCheckout } from '@/utils/cartHelpers';
import { CheckoutProItem } from '@/services/checkoutProService';

interface CartCheckoutProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  showCartSummary?: boolean;
}

/**
 * Componente que integra el carrito de compras con MercadoPago Checkout Pro
 * Toma automáticamente los productos del carrito y los procesa para el pago
 */
const CartCheckout: React.FC<CartCheckoutProps> = ({
  onSuccess,
  onError,
  onCancel,
  showCartSummary = true
}) => {
  const { items: cartItems, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const [checkoutItems, setCheckoutItems] = useState<CheckoutProItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidCart, setIsValidCart] = useState(false);

  // Validar y convertir items del carrito
  useEffect(() => {
    console.log('🛒 Items del carrito:', cartItems);
    
    const validation = validateCartItemsForCheckout(cartItems);
    setValidationErrors(validation.errors);
    setIsValidCart(validation.valid);

    if (validation.valid) {
      const convertedItems = convertCartItemsToCheckoutItems(cartItems);
      setCheckoutItems(convertedItems);
      console.log('✅ Items convertidos para checkout:', convertedItems);
    } else {
      setCheckoutItems([]);
      console.log('❌ Errores de validación:', validation.errors);
    }
  }, [cartItems]);

  const handlePaymentSuccess = () => {
    console.log('🎉 Pago exitoso desde CartCheckout');
    clearCart(); // Limpiar carrito después del pago exitoso
    onSuccess?.();
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Error en pago desde CartCheckout:', error);
    onError?.(error);
  };

  // Si el carrito está vacío
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Carrito vacío
          </h3>
          <p className="text-gray-500 mb-4">
            Agrega productos al carrito para proceder con el pago
          </p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continuar comprando
            </button>
          )}
        </div>
      </div>
    );
  }

  // Si hay errores de validación
  if (!isValidCart) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800">
              Error en el carrito
            </h3>
          </div>
          
          <div className="space-y-2 mb-4">
            {validationErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                {error}
              </p>
            ))}
          </div>

          <div className="flex space-x-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Volver al carrito
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Resumen del carrito (opcional) */}
      {showCartSummary && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Resumen del pedido
            </h2>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                ← Modificar carrito
              </button>
            )}
          </div>

          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  {item.img && (
                    <img 
                      src={item.img} 
                      alt={`${item.marca} ${item.modelo}`}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.marca} {item.modelo}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.ram} • {item.almacenamiento} • {item.color}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cantidad: {item.cantidad} × ${item.precio.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    ${(item.precio * item.cantidad).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {getTotalItems()} producto{getTotalItems() !== 1 ? 's' : ''}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                Total: ${getTotalPrice().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-xs text-blue-700">
          <p><strong>Debug Info:</strong></p>
          <p>Items en carrito: {cartItems.length}</p>
          <p>Items válidos para checkout: {checkoutItems.length}</p>
          <p>Validación: {isValidCart ? '✅ OK' : '❌ Error'}</p>
          <p>Total: ${getTotalPrice().toLocaleString()}</p>
        </div>
      </div>

      {/* Componente de checkout */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          💳 Proceder al pago
        </h3>
        
        <CheckoutPro
          items={checkoutItems}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  );
};

export default CartCheckout;