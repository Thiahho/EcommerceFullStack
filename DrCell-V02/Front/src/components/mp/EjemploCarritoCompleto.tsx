import React, { useState } from 'react';
import { useCartStore, CartItem } from '@/store/cart-store';
import CartCheckout from './CartCheckout';

/**
 * Ejemplo completo de integración del carrito con MercadoPago Checkout Pro
 * Muestra cómo agregar productos al carrito y proceder al pago
 */
const EjemploCarritoCompleto: React.FC = () => {
  const { 
    items: cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice 
  } = useCartStore();

  const [showCheckout, setShowCheckout] = useState(false);

  // Productos de ejemplo
  const productosEjemplo = [
    {
      productoId: 1,
      varianteId: 1,
      marca: "Samsung",
      modelo: "Galaxy S23",
      ram: "8GB",
      almacenamiento: "256GB",
      color: "Negro",
      precio: 899999,
      stock: 5,
      img: "/img/samsung-s23.jpg"
    },
    {
      productoId: 2,
      varianteId: 3,
      marca: "iPhone",
      modelo: "15 Pro",
      ram: "8GB",
      almacenamiento: "128GB",
      color: "Azul",
      precio: 1299999,
      stock: 3,
      img: "/img/iphone-15-pro.jpg"
    },
    {
      productoId: 3,
      varianteId: 5,
      marca: "Xiaomi",
      modelo: "13 Pro",
      ram: "12GB",
      almacenamiento: "512GB",
      color: "Blanco",
      precio: 699999,
      stock: 8,
      img: "/img/xiaomi-13-pro.jpg"
    }
  ];

  const handleAddToCart = (producto: any) => {
    addToCart({
      productoId: producto.productoId,
      varianteId: producto.varianteId,
      marca: producto.marca,
      modelo: producto.modelo,
      ram: producto.ram,
      almacenamiento: producto.almacenamiento,
      color: producto.color,
      precio: producto.precio,
      stock: producto.stock,
      img: producto.img
    });
  };

  const handleCheckoutSuccess = () => {
    console.log('🎉 Pago exitoso!');
    setShowCheckout(false);
    alert('¡Pago realizado con éxito! El carrito ha sido vaciado.');
  };

  const handleCheckoutError = (error: string) => {
    console.error('❌ Error en el pago:', error);
    alert('Error en el pago: ' + error);
  };

  const handleBackToCart = () => {
    setShowCheckout(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🛒 Ejemplo: Carrito + MercadoPago Checkout Pro
        </h1>

        {!showCheckout ? (
          <>
            {/* Productos disponibles */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Productos disponibles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {productosEjemplo.map((producto) => (
                  <div key={`${producto.productoId}-${producto.varianteId}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <div className="bg-gray-100 rounded-lg flex items-center justify-center h-32">
                        <span className="text-gray-400 text-sm">📱 {producto.marca}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">
                      {producto.marca} {producto.modelo}
                    </h3>
                    
                    <div className="text-sm text-gray-600 mb-3 space-y-1">
                      <p>RAM: {producto.ram}</p>
                      <p>Almacenamiento: {producto.almacenamiento}</p>
                      <p>Color: {producto.color}</p>
                      <p className="text-green-600">Stock: {producto.stock} unidades</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600">
                        ${producto.precio.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleAddToCart(producto)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carrito actual */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Carrito de compras ({getTotalItems()} items)
                </h2>
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 text-sm underline"
                  >
                    Vaciar carrito
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  El carrito está vacío. Agrega productos para continuar.
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item: CartItem) => (
                      <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">📱</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.marca} {item.modelo}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.ram} • {item.almacenamiento} • {item.color}
                            </p>
                            <p className="text-sm text-green-600">
                              ${item.precio.toLocaleString()} c/u
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                              disabled={item.cantidad >= item.stock}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[100px]">
                            <p className="font-semibold">
                              ${(item.precio * item.cantidad).toLocaleString()}
                            </p>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${getTotalPrice().toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-bold text-lg"
                    >
                      💳 Proceder al pago con MercadoPago
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* Checkout */
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Checkout - MercadoPago
              </h2>
              <p className="text-gray-600">
                Procesa tu pago de forma segura con MercadoPago Checkout Pro
              </p>
            </div>

            <CartCheckout
              onSuccess={handleCheckoutSuccess}
              onError={handleCheckoutError}
              onCancel={handleBackToCart}
              showCartSummary={true}
            />
          </div>
        )}
      </div>

      {/* Información técnica */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-3">📋 Información técnica:</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>Estado del carrito:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Items en carrito: {cartItems.length}</li>
            <li>Total de productos: {getTotalItems()}</li>
            <li>Precio total: ${getTotalPrice().toLocaleString()}</li>
            <li>Checkout activo: {showCheckout ? 'Sí' : 'No'}</li>
          </ul>
          
          <p className="mt-3"><strong>Flujo de datos:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>1. Productos se agregan al carrito (Zustand store)</li>
            <li>2. CartCheckout toma automáticamente los items del carrito</li>
            <li>3. Los valida y convierte al formato de MercadoPago</li>
            <li>4. CheckoutPro crea la preferencia en el backend</li>
            <li>5. MercadoPago Wallet muestra el botón de pago</li>
            <li>6. Usuario es redirigido al formulario de MercadoPago</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EjemploCarritoCompleto;
