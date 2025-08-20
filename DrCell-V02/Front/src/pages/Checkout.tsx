import React, { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useNavigate } from 'react-router-dom';
import CartCheckout from '@/components/mp/CartCheckout';
import Toast from '@/components/ui/toast';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

    const totalPrice = getTotalPrice();

    const handlePaymentSuccess = () => {
        console.log('🎉 Pago exitoso!');
        setNotificationMessage('¡Pago procesado exitosamente! Tu pedido ha sido confirmado.');
        setNotificationType('success');
        setShowNotification(true);

        // El carrito se limpia automáticamente en CartCheckout
        // Redirigir a la página principal después de mostrar el mensaje
        setTimeout(() => {
            navigate('/');
        }, 3000);
    };

    const handlePaymentError = (error: string) => {
        console.error('❌ Error en el pago:', error);
        setNotificationMessage(`Error en el pago: ${error}`);
        setNotificationType('error');
        setShowNotification(true);
    };

    const handleCancel = () => {
        navigate(-1); // Volver a la página anterior
    };

    // Si no hay productos en el carrito, mostrar mensaje
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="mb-6">
                            <div className="text-6xl mb-4">🛒</div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                Tu carrito está vacío
                            </h1>
                            <p className="text-gray-600">
                                Agrega algunos productos antes de proceder al checkout.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/tienda')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            Ir a la Tienda
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Toast
                message={notificationMessage}
                type={notificationType}
                isVisible={showNotification}
                onClose={() => setShowNotification(false)}
                duration={5000}
            />

            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                        Finalizar Compra
                    </h1>
                    <p className="text-gray-600 text-center">
                        Revisa tu pedido y procede con el pago
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Resumen del Pedido */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Resumen del Pedido
                            </h2>

                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                                        <img
                                            src={`data:image/webp;base64,${item.img}`}
                                            alt={`${item.marca} ${item.modelo}`}
                                            className="w-16 h-16 object-contain rounded"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">
                                                {item.marca} {item.modelo}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {item.color} - {item.ram}/{item.almacenamiento}
                                            </p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-sm text-gray-600">
                                                    Cantidad: {item.cantidad}
                                                </span>
                                                <span className="font-semibold text-green-600">
                                                    ${(item.precio * item.cantidad).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-green-600">
                                        ${totalPrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de Pago */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Información de Pago
                            </h2>

                            <CartCheckout
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                                onCancel={handleCancel}
                                showCartSummary={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
