import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import paymentService, { PaymentData } from '../../services/paymentService';
import { CartItem } from '../../store/cart-store';
import CardPaymentCart from './CardPaymentCart';
import CheckoutPro from './CheckoutPro';
import { CheckoutProItem } from '../../services/checkoutProService';
import axios from '../../config/axios';

interface CartCheckoutProps {
    cartItems: CartItem[];
    totalPrice: number;
    onPaymentInitiated?: (response: any) => void;
    onError?: (error: string) => void;
    onCancel?: () => void;
}

const CartCheckout: React.FC<CartCheckoutProps> = ({
    cartItems,
    totalPrice,
    onPaymentInitiated,
    onError,
    onCancel
}) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        areaCode: '+54',
        phoneNumber: '',
        identificationType: 'DNI',
        identificationNumber: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'redirect' | 'card' | 'checkout-pro'>('checkout-pro');
    const [publicKey, setPublicKey] = useState('');

    const tiposIdentificacion = paymentService.getTiposIdentificacion();

    // Obtener la clave pública de MercadoPago
    useEffect(() => {
        const fetchPublicKey = async () => {
            try {
                const response = await axios.get('/mercadopago/public-key');
                setPublicKey(response.data.publicKey);
            } catch (error) {
                console.error('Error obteniendo clave pública:', error);
                // Clave pública de sandbox para desarrollo
                setPublicKey('TEST-4f9f1e1e-7b5f-4e3b-8c2a-1a1a1a1a1a1a');
            }
        };
        fetchPublicKey();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Limpiar errores cuando el usuario empiece a escribir
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const validateCartCheckout = (): string[] => {
        const errores: string[] = [];

        if (!formData.name.trim()) errores.push('El nombre es requerido');
        if (!formData.surname.trim()) errores.push('El apellido es requerido');
        if (!formData.email.trim()) errores.push('El email es requerido');
        if (!formData.areaCode.trim()) errores.push('El código de área es requerido');
        if (!formData.phoneNumber.trim()) errores.push('El número de teléfono es requerido');
        if (!formData.identificationNumber.trim()) errores.push('El número de identificación es requerido');

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            errores.push('El formato del email es inválido');
        }

        if (cartItems.length === 0) {
            errores.push('El carrito está vacío');
        }

        return errores;
    };

    const processCartPayment = async (): Promise<any> => {
        try {
            // Para el carrito, necesitamos un endpoint especial que maneje múltiples productos
            const cartPaymentData = {
                Name: formData.name,
                Surname: formData.surname,
                Email: formData.email,
                AreaCode: formData.areaCode,
                PhoneNumber: formData.phoneNumber,
                IdentificationType: formData.identificationType,
                IdentificationNumber: formData.identificationNumber,
                Items: cartItems.map(item => ({
                    ProductoId: item.productoId,
                    VarianteId: item.varianteId, // Usar el ID real de la variante
                    Cantidad: item.cantidad,
                    Precio: item.precio,
                    Descripcion: `${item.marca} ${item.modelo} - ${item.color} (${item.ram}/${item.almacenamiento})`
                })),
                TotalPrice: totalPrice
            };

            const response = await axios.post('/procesar-pago-carrito', cartPaymentData);
            return response.data;
        } catch (error: any) {
            console.log('❌ Error completo:', error);
            console.log('❌ Error response status:', error.response?.status);
            console.log('❌ Error response data:', JSON.stringify(error.response?.data, null, 2));
            console.log('❌ Errores de validación:', JSON.stringify(error.response?.data?.errors, null, 2));

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error(error.message || 'Error al procesar el pago del carrito');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar datos
        const validationErrors = validateCartCheckout();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors([]);

        try {
            const response = await processCartPayment();

            if (onPaymentInitiated) {
                onPaymentInitiated(response);
            }

            // Redirigir a MercadoPago (usando sandbox para desarrollo)
            if (response.sandboxInitPoint) {
                paymentService.redirectToPayment(response.sandboxInitPoint, true);
            }

        } catch (error: any) {
            const errorMessage = error.message || 'Error al procesar el pago';
            setErrors([errorMessage]);

            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCardPaymentSuccess = (response: any) => {
        console.log('Pago con tarjeta exitoso:', response);
        if (onPaymentInitiated) {
            onPaymentInitiated(response);
        }
    };

    const handleCardPaymentError = (error: string) => {
        console.error('Error en pago con tarjeta:', error);
        if (onError) {
            onError(error);
        }
    };

    // Convertir items del carrito para Checkout Pro
    const convertToCheckoutProItems = (items: CartItem[]): CheckoutProItem[] => {
        return items.map(item => ({
            productoId: item.productoId,
            varianteId: item.varianteId,
            marca: item.marca,
            modelo: item.modelo,
            ram: item.ram,
            almacenamiento: item.almacenamiento,
            color: item.color,
            cantidad: 1, // Cada item del carrito es cantidad 1
            precio: item.precio
        }));
    };

    const handleCheckoutProSuccess = () => {
        console.log('✅ Checkout Pro iniciado exitosamente');
        if (onPaymentInitiated) {
            onPaymentInitiated({ method: 'checkout-pro', status: 'initiated' });
        }
    };

    const handleCheckoutProError = (error: string) => {
        console.error('Error en Checkout Pro:', error);
        if (onError) {
            onError(error);
        }
    };

    // Si se selecciona Checkout Pro, mostrar el componente correspondiente
    if (paymentMethod === 'checkout-pro') {
        return (
            <CheckoutPro
                items={convertToCheckoutProItems(cartItems)}
                onSuccess={handleCheckoutProSuccess}
                onError={handleCheckoutProError}
            />
        );
    }

    // Si se selecciona pago con tarjeta, mostrar el componente correspondiente
    if (paymentMethod === 'card' && publicKey) {
        return (
            <CardPaymentCart
                cartItems={cartItems}
                totalPrice={totalPrice}
                publicKey={publicKey}
                onPaymentSuccess={handleCardPaymentSuccess}
                onPaymentError={handleCardPaymentError}
                onCancel={() => setPaymentMethod('checkout-pro')}
            />
        );
    }

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Finalizar Compra</h2>

                {/* Selector de método de pago */}
                <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Método de Pago</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('checkout-pro')}
                            className={`p-3 border rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-colors ${paymentMethod === 'checkout-pro'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <span className="text-2xl mb-1">🛒</span>
                            <span>Checkout Pro</span>
                            <span className="text-xs text-gray-500">Recomendado</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('redirect')}
                            className={`p-3 border rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-colors ${paymentMethod === 'redirect'
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <span className="text-2xl mb-1">🔗</span>
                            <span>MercadoPago</span>
                            <span className="text-xs text-gray-500">Redirección</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`p-3 border rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-colors ${paymentMethod === 'card'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <span className="text-2xl mb-1">💳</span>
                            <span>Tarjeta</span>
                            <span className="text-xs text-gray-500">Pago directo</span>
                        </button>
                    </div>
                </div>

                {/* Resumen del carrito */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Resumen del Pedido</h3>
                    <div className="max-h-32 overflow-y-auto mb-3">
                        {cartItems.map((item, index) => (
                            <div key={item.id} className="text-sm text-gray-600 mb-1">
                                • {item.marca} {item.modelo} ({item.color}) x{item.cantidad}
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg text-green-600">
                            ${totalPrice.toLocaleString('es-CO')}
                        </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Información Personal */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700">Información Personal</h3>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Juan"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="surname">Apellido *</Label>
                            <Input
                                id="surname"
                                type="text"
                                value={formData.surname}
                                onChange={(e) => handleInputChange('surname', e.target.value)}
                                placeholder="Pérez"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="juan.perez@email.com"
                            required
                        />
                    </div>
                </div>

                {/* Información de Contacto */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700">Información de Contacto</h3>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label htmlFor="areaCode">Código</Label>
                            <Input
                                id="areaCode"
                                type="text"
                                value={formData.areaCode}
                                onChange={(e) => handleInputChange('areaCode', e.target.value)}
                                placeholder="+57"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="phoneNumber">Teléfono *</Label>
                            <Input
                                id="phoneNumber"
                                type="text"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                placeholder="3001234567"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Información de Identificación */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700">Identificación</h3>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="identificationType">Tipo *</Label>
                            <select
                                id="identificationType"
                                value={formData.identificationType}
                                onChange={(e) => handleInputChange('identificationType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                {tiposIdentificacion.map(tipo => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="identificationNumber">Número *</Label>
                            <Input
                                id="identificationNumber"
                                type="text"
                                value={formData.identificationNumber}
                                onChange={(e) => handleInputChange('identificationNumber', e.target.value)}
                                placeholder="12345678"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Errores */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <ul className="text-red-600 text-sm space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Botones */}
                <div className="flex gap-3">
                    {onCancel && (
                        <Button
                            type="button"
                            onClick={onCancel}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Procesando...
                            </div>
                        ) : (
                            `🔗 Pagar ${totalPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`
                        )}
                    </Button>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Serás redirigido a MercadoPago para completar el pago de forma segura
                    </p>
                </div>
            </form>
        </div>
    );
};

export default CartCheckout;
