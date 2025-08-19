import React, { useState } from 'react';
import { useCartStore, CartItem } from '@/store/cart-store';
import { WHATSAPP_CONFIG } from '@/config/whatsapp';
import CartCheckout from './mp/CartCheckout';

const Cart: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  } = useCartStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;

    const message = generateWhatsAppMessage();
    const whatsappNumber = WHATSAPP_CONFIG.PHONE_NUMBER;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  const generateWhatsAppMessage = (): string => {
    const itemsList = items.map(item =>
      `• ${item.marca} ${item.modelo} (${item.ram}/${item.almacenamiento}/${item.color}) - Cantidad: ${item.cantidad} - $${item.precio.toLocaleString()}`
    ).join('\n');

    return `${WHATSAPP_CONFIG.DEFAULT_MESSAGE}

🛒 *PEDIDO - ${WHATSAPP_CONFIG.COMPANY_NAME}*

${itemsList}

*Total: $${getTotalPrice().toLocaleString()}*

Gracias por tu compra! 📱✨`;
  };

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity > item.stock) {
      alert(`Solo hay ${item.stock} unidades disponibles`);
      return;
    }
    updateQuantity(item.id, newQuantity);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    setIsOpen(false);
  };

  const handlePaymentInitiated = (response: any) => {
    console.log('Pago iniciado:', response);
    // Opcionalmente limpiar el carrito tras iniciar el pago
    // clearCart();
  };

  const handlePaymentError = (error: string) => {
    console.error('Error en el pago:', error);
    alert(`Error: ${error}`);
  };

  const handleCancelCheckout = () => {
    setShowCheckout(false);
  };

  if (items.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Abrir carrito"
        >

          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl border p-4 max-h-[80vh] overflow-hidden">
            <div className="text-center text-gray-500 py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium">Tu carrito está vacío</p>
              <p className="text-sm text-gray-400">Agrega productos para comenzar</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Botón del carrito con contador */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative"
        aria-label="Abrir carrito"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
            {getTotalItems()}
          </span>
        )}
      </button>

      {/* Panel del carrito */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 lg:w-[420px] bg-white rounded-lg shadow-xl border max-h-[80vh] overflow-hidden">
          {/* Header del carrito */}
          <div className="p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Carrito</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                  disabled={items.length === 0}
                >
                  Vaciar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Cerrar carrito"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Lista de productos (solo si hay items) */}
          {items.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3">
                    {/* Imagen del producto */}
                    <img
                      src={`data:image/webp;base64,${item.img}`}
                      alt={item.modelo}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded flex-shrink-0"
                    />
                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {item.marca} {item.modelo}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        {item.ram} / {item.almacenamiento} / {item.color}
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-green-600">
                        ${item.precio.toLocaleString()}
                      </p>
                    </div>
                    {/* Controles de cantidad y eliminar */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm p-1 rounded transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuantityChange(item, item.cantidad - 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-200 rounded-full flex items-center justify-center text-sm hover:bg-gray-300 transition-colors"
                          disabled={item.cantidad <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                        <button
                          onClick={() => handleQuantityChange(item, item.cantidad + 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-200 rounded-full flex items-center justify-center text-sm hover:bg-gray-300 transition-colors"
                          disabled={item.cantidad >= item.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer con total y botón de WhatsApp */}
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg">Total:</span>
              <span className="font-bold text-xl text-green-600">
                ${items.length > 0 ? getTotalPrice().toLocaleString() : '0'}
              </span>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2">
              {/* Botón de Comprar con MercadoPago Pro */}
              <button
                onClick={handleCheckout}
                className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${items.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                disabled={items.length === 0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="hidden sm:inline">Pagar con MercadoPago Pro</span>
                <span className="sm:hidden">Pagar</span>
              </button>

              {/* Info de MercadoPago Pro */}
              <div className="text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Pago seguro • Hasta 24 cuotas • Múltiples métodos</span>
                </div>
              </div>

              {/* Botón de WhatsApp */}
              <button
                onClick={handleWhatsAppOrder}
                className={`w-full bg-green-500 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${items.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                disabled={items.length === 0}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                <span className="hidden sm:inline">Enviar pedido por WhatsApp</span>
                <span className="sm:hidden">Enviar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CartCheckout
              cartItems={items}
              totalPrice={getTotalPrice()}
              onPaymentInitiated={handlePaymentInitiated}
              onError={handlePaymentError}
              onCancel={handleCancelCheckout}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 