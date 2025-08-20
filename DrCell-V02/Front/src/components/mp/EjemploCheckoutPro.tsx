import React, { useState } from 'react';
import CheckoutPro from './CheckoutPro';
import { CheckoutProItem } from '@/services/checkoutProService';

/**
 * Ejemplo de cómo usar el componente CheckoutPro
 * Este componente muestra cómo implementar MercadoPago Checkout Pro
 */
const EjemploCheckoutPro: React.FC = () => {
    const [showCheckout, setShowCheckout] = useState(false);

    // Datos de ejemplo para el checkout
    const itemsEjemplo: CheckoutProItem[] = [
        {
            productoId: 1,
            varianteId: 1,
            marca: "Samsung",
            modelo: "Galaxy S23",
            ram: "8GB",
            almacenamiento: "256GB",
            color: "Negro",
            cantidad: 1,
            precio: 899999
        },
        {
            productoId: 2,
            varianteId: 3,
            marca: "iPhone",
            modelo: "15 Pro",
            ram: "8GB",
            almacenamiento: "128GB",
            color: "Azul",
            cantidad: 2,
            precio: 1299999
        }
    ];

    const handleSuccess = () => {
        console.log('🎉 Pago exitoso!');
        setShowCheckout(false);
        // Aquí puedes redirigir a una página de confirmación
        // o mostrar un mensaje de éxito
    };

    const handleError = (error: string) => {
        console.error('❌ Error en el pago:', error);
        alert('Error en el pago: ' + error);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Ejemplo: MercadoPago Checkout Pro
                </h1>
                
                <p className="text-gray-600 mb-6">
                    Este ejemplo muestra cómo implementar MercadoPago Checkout Pro en tu aplicación.
                    Cuando hagas clic en "Iniciar Checkout", se creará una preferencia en el backend
                    y se mostrará el botón de pago de MercadoPago.
                </p>

                {!showCheckout ? (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-3">Productos de ejemplo:</h3>
                            {itemsEjemplo.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                    <div>
                                        <p className="font-medium">{item.marca} {item.modelo}</p>
                                        <p className="text-sm text-gray-600">
                                            {item.ram} • {item.almacenamiento} • {item.color}
                                        </p>
                                        <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${item.precio.toLocaleString()}</p>
                                        {item.cantidad > 1 && (
                                            <p className="text-sm text-gray-500">
                                                ${(item.precio * item.cantidad).toLocaleString()} total
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-300">
                                <span className="text-lg font-bold">Total:</span>
                                <span className="text-lg font-bold text-green-600">
                                    ${itemsEjemplo.reduce((sum, item) => sum + (item.precio * item.cantidad), 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowCheckout(true)}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg"
                        >
                            🚀 Iniciar Checkout Pro
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold">Checkout MercadoPago</h3>
                            <button
                                onClick={() => setShowCheckout(false)}
                                className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded border"
                            >
                                ← Volver
                            </button>
                        </div>
                        
                        <CheckoutPro
                            items={itemsEjemplo}
                            onSuccess={handleSuccess}
                            onError={handleError}
                        />
                    </div>
                )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Información importante:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• El componente CheckoutPro se conecta automáticamente al backend</li>
                    <li>• Crea una preferencia de pago usando el endpoint `/Pagos/crear-preferencia`</li>
                    <li>• Muestra el botón de pago de MercadoPago cuando la preferencia está lista</li>
                    <li>• Redirige automáticamente al formulario de pago de MercadoPago</li>
                    <li>• Maneja automáticamente las URLs de retorno (éxito, error, pendiente)</li>
                </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">⚙️ Configuración necesaria:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Configurar ACCESS_TOKEN en appsettings.json</li>
                    <li>• Configurar PUBLIC_KEY en appsettings.json</li>
                    <li>• Verificar que el endpoint del backend esté funcionando</li>
                    <li>• Asegurar que las URLs de callback estén configuradas correctamente</li>
                </ul>
            </div>
        </div>
    );
};

export default EjemploCheckoutPro;
