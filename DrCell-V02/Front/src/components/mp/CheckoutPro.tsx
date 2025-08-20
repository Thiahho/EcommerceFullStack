import React, { useState, useEffect } from 'react';
import { checkoutProService, CheckoutProItem } from '@/services/checkoutProService';
import { useCartStore } from '@/store/cart-store';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';


interface CheckoutProProps {
    items: CheckoutProItem[];
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

const CheckoutPro: React.FC<CheckoutProProps> = ({ items, onSuccess, onError }) => {
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [publicKey, setPublicKey] = useState('');
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const { clearCart } = useCartStore();
    
    // Inicializar MercadoPago SDK
    useEffect(() => {
        initMercadoPago('APP_USR-2fd73940-1ce1-4521-956e-b5fcf2c7db9c');
        setSdkLoaded(true);
    }, []);

    // Crear preferencia cuando se cargan los items
    useEffect(() => {
        const createPreference = async () => {
            if (items.length === 0) {
                console.log('⚠️ No hay items para crear preferencia');
                setPreferenceId(null);
                return;
            }
            
            try {
                setLoading(true);
                setPreferenceId(null); // Reset preference ID
                console.log('🔧 Creando preferencia con items:', items);
                
                const preference = await checkoutProService.createPreference(items);
                setPreferenceId(preference.preferenceId);
                
                console.log('✅ Preferencia creada:', preference.preferenceId);
            } catch (error: any) {
                console.error('❌ Error al crear preferencia:', error);
                setPreferenceId(null);
                onError?.(error.message || 'Error al crear la preferencia de pago');
            } finally {
                setLoading(false);
            }
        };

        // Solo crear preferencia si hay items
        if (items && items.length > 0) {
            createPreference();
        } else {
            setPreferenceId(null);
            setLoading(false);
        }
    }, [items, onError]);

    // Manejar éxito del pago
    const handlePaymentSuccess = () => {
        clearCart();
        onSuccess?.();
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    // Si no hay items
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No hay productos seleccionados para el pago</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Resumen de productos */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Resumen de compra</h3>

                {items.map((item, index) => (
                    <div key={`${item.productoId}-${item.varianteId}-${index}`} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
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
                Preference ID: {preferenceId ? '✅ Creada' : '❌ Pendiente'} |
                Items: {items.length}
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">Preparando formulario de pago...</span>
                </div>
            )}

            {/* MercadoPago Wallet */}
            {preferenceId && !loading && (
                <div className="w-full max-w-md mx-auto">
                    <Wallet 
                        initialization={{ 
                            preferenceId: preferenceId 
                        }}
                        onReady={() => console.log('🎉 Wallet listo')}
                        onError={(error) => {
                            console.error('❌ Error en Wallet:', error);
                            onError?.('Error al cargar el formulario de pago');
                        }}
                    />
                </div>
            )}

            {/* Información adicional */}
            <div className="text-center text-sm text-gray-500">
                <p>Serás redirigido a MercadoPago para completar el pago de forma segura</p>
            </div>
        </div>
    );
};

export default CheckoutPro;
