import React, { useState, useEffect } from 'react';
import { checkoutProService, CheckoutProItem } from '@/services/checkoutProService';
import { useCartStore } from '@/store/cart-store';

interface CheckoutProProps {
    items: CheckoutProItem[];
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

const CheckoutPro: React.FC<CheckoutProProps> = ({ items, onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);
    const [publicKey, setPublicKey] = useState('');
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const { clearCart } = useCartStore();

    // Obtener la clave pública
    useEffect(() => {
        const fetchPublicKey = async () => {
            try {
                const key = await checkoutProService.getPublicKey();
                setPublicKey(key);
                console.log('✅ Public key obtenida:', key);
            } catch (error: any) {
                console.error('❌ Error al obtener public key:', error);
                onError?.('Error al cargar el sistema de pagos');
            }
        };

        fetchPublicKey();
    }, [onError]);

    // Inicializar SDK cuando se obtiene la clave pública
    useEffect(() => {
        const initSDK = async () => {
            if (!publicKey) return;

            try {
                console.log('🔧 Inicializando Checkout Pro SDK...');
                await checkoutProService.initialize(publicKey);
                setSdkLoaded(true);
                console.log('✅ Checkout Pro SDK inicializado');
            } catch (error: any) {
                console.error('❌ Error al inicializar SDK:', error);
                setSdkLoaded(false);
                onError?.('Error al cargar el sistema de pagos: ' + error.message);
            }
        };

        initSDK();
    }, [publicKey, onError]);

    const handleCheckout = async () => {
        if (!sdkLoaded || items.length === 0) return;

        setLoading(true);

        try {
            console.log('🔧 Iniciando proceso de checkout con items:', items);

            // Procesar checkout
            await checkoutProService.processCheckout(items);

            // Limpiar carrito después de iniciar el checkout
            clearCart();

            // Llamar callback de éxito
            onSuccess?.();

        } catch (error: any) {
            console.error('❌ Error en checkout:', error);
            onError?.(error.message || 'Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    return (
        <div className="space-y-4">
            {/* Resumen de productos */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Resumen de compra</h3>

                {items.map((item, index) => (
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
                        ${totalAmount.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Debug info */}
            <div className="text-xs text-blue-500 p-2 bg-blue-50 rounded">
                SDK Status: {sdkLoaded ? '✅ Cargado' : '❌ No cargado'} |
                Loading: {loading ? '⏳' : '✅'} |
                PublicKey: {publicKey ? '✅' : '❌'} |
                Items: {items.length}
            </div>

            {/* Botón de pago */}
            <button
                onClick={handleCheckout}
                disabled={loading || !sdkLoaded || items.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-lg flex items-center justify-center"
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Procesando...
                    </>
                ) : (
                    <>
                        💳 Pagar con MercadoPago
                    </>
                )}
            </button>

            {/* Información adicional */}
            <div className="text-center text-sm text-gray-500">
                <p>Serás redirigido a MercadoPago para completar el pago de forma segura</p>
            </div>
        </div>
    );
};

export default CheckoutPro;
