import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import cardPaymentService, { CardPaymentData, CardData } from '../../services/cardPaymentService';
import { CartItem } from '../../store/cart-store';
import Toast from '../ui/toast';

interface CardPaymentCartProps {
    cartItems: CartItem[];
    totalPrice: number;
    publicKey: string;
    onPaymentSuccess?: (response: any) => void;
    onPaymentError?: (error: string) => void;
    onCancel?: () => void;
}

const CardPaymentCart: React.FC<CardPaymentCartProps> = ({
    cartItems,
    totalPrice,
    publicKey,
    onPaymentSuccess,
    onPaymentError,
    onCancel
}) => {
    // Estados del formulario
    const [customerData, setCustomerData] = useState({
        name: '',
        surname: '',
        email: '',
        areaCode: '+54',
        phoneNumber: '',
        identificationType: 'DNI',
        identificationNumber: ''
    });

    const [cardData, setCardData] = useState<CardData>({
        cardNumber: '',
        securityCode: '',
        cardExpirationMonth: '',
        cardExpirationYear: '',
        cardholderName: '',
        docType: 'DNI',
        docNumber: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<any>(null);
    const [installments, setInstallments] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

    const tiposIdentificacion = cardPaymentService.getTiposIdentificacion();

    // Inicializar MercadoPago SDK
    useEffect(() => {
        const initSDK = async () => {
            try {
                console.log('🔧 Iniciando SDK con publicKey:', publicKey);
                console.log('🔧 SDK antes de inicializar:', {
                    mercadopagoExists: typeof window.MercadoPago !== 'undefined',
                    windowMercadopago: !!window.MercadoPago
                });

                await cardPaymentService.initialize(publicKey);
                setSdkLoaded(true);

                console.log('✅ SDK cargado correctamente');
                console.log('🔧 Estado después de inicializar:', {
                    mercadopagoExists: typeof window.MercadoPago !== 'undefined',
                    mpExists: !!window.mp,
                    sdkLoaded: true
                });
            } catch (error: any) {
                console.error('❌ Error al inicializar SDK:', error);
                console.error('❌ Error completo:', error);
                setErrors(['Error al cargar el sistema de pagos: ' + error.message]);
                setSdkLoaded(false);
            }
        };

        if (publicKey) {
            console.log('🔧 PublicKey disponible:', publicKey);
            console.log('🔧 Estado inicial sdkLoaded:', sdkLoaded);
            initSDK();
        } else {
            console.log('❌ No hay publicKey disponible');
            setSdkLoaded(false);
        }
    }, [publicKey]);

    // Identificar método de pago cuando cambia el número de tarjeta
    useEffect(() => {
        const identifyPaymentMethod = async () => {
            if (cardData.cardNumber.length >= 6 && sdkLoaded) {
                try {
                    const method = await cardPaymentService.getPaymentMethod(cardData.cardNumber);
                    setPaymentMethod(method);
                } catch (error) {
                    setPaymentMethod(null);
                }
            }
        };

        const timeoutId = setTimeout(identifyPaymentMethod, 500);
        return () => clearTimeout(timeoutId);
    }, [cardData.cardNumber, sdkLoaded]);

    const handleCustomerInputChange = (field: string, value: string) => {
        setCustomerData(prev => ({
            ...prev,
            [field]: value
        }));
        clearErrors();
    };

    const handleCardInputChange = (field: keyof CardData, value: string) => {
        setCardData(prev => ({
            ...prev,
            [field]: value
        }));
        clearErrors();
    };

    const clearErrors = () => {
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const showNotificationMessage = (message: string, type: 'success' | 'error') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);
    };

    const validateForm = (): string[] => {
        const validationErrors: string[] = [];

        // Validar datos del cliente
        if (!customerData.name.trim()) validationErrors.push('El nombre es requerido');
        if (!customerData.surname.trim()) validationErrors.push('El apellido es requerido');
        if (!customerData.email.trim()) validationErrors.push('El email es requerido');
        if (!customerData.phoneNumber.trim()) validationErrors.push('El teléfono es requerido');
        if (!customerData.identificationNumber.trim()) validationErrors.push('La identificación es requerida');

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (customerData.email && !emailRegex.test(customerData.email)) {
            validationErrors.push('Formato de email inválido');
        }

        // Validar datos de tarjeta
        const cardErrors = cardPaymentService.validateCardData(cardData);
        validationErrors.push(...cardErrors);

        // Validar método de pago
        if (!paymentMethod) {
            validationErrors.push('No se pudo identificar el método de pago');
        }

        // Validar carrito
        if (cartItems.length === 0) {
            validationErrors.push('El carrito está vacío');
        }

        return validationErrors;
    };

    const processMultiplePayments = async () => {
        const results = [];

        for (const item of cartItems) {
            try {
                // Crear token de tarjeta para cada producto
                const tokenResponse = await cardPaymentService.createCardToken(cardData);

                // Preparar datos de pago para cada producto
                const paymentData: CardPaymentData = {
                    name: customerData.name,
                    surname: customerData.surname,
                    email: customerData.email,
                    areaCode: customerData.areaCode,
                    phoneNumber: customerData.phoneNumber,
                    identificationType: customerData.identificationType,
                    identificationNumber: customerData.identificationNumber,
                    productoId: item.productoId,
                    varianteId: item.varianteId, // ID real de la variante
                    cantidad: item.cantidad,
                    cardToken: tokenResponse.id,
                    paymentMethodId: paymentMethod.id,
                    cardholderIdentificationType: cardData.docType,
                    cardholderIdentificationNumber: cardData.docNumber,
                    cardholderName: cardData.cardholderName,
                    installments: installments,
                    billingCountry: 'AR'
                };

                // Procesar pago para este producto
                const paymentResponse = await cardPaymentService.processCardPayment(paymentData);
                results.push({ item, response: paymentResponse });

                if (!paymentResponse.success) {
                    throw new Error(`Error en el pago de ${item.marca} ${item.modelo}: ${paymentResponse.message}`);
                }

            } catch (error: any) {
                throw new Error(`Error procesando ${item.marca} ${item.modelo}: ${error.message}`);
            }
        }

        return results;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sdkLoaded) {
            setErrors(['El sistema de pagos no está disponible']);
            return;
        }

        // Validar formulario
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors([]);

        try {
            showNotificationMessage('Procesando pagos del carrito...', 'success');

            // Procesar pagos múltiples
            const results = await processMultiplePayments();

            const allSuccessful = results.every(result => result.response.success);

            if (allSuccessful) {
                showNotificationMessage('¡Todos los pagos procesados exitosamente!', 'success');

                if (onPaymentSuccess) {
                    onPaymentSuccess({
                        success: true,
                        message: 'Todos los pagos fueron procesados correctamente',
                        results: results
                    });
                }
            } else {
                const failedItems = results.filter(result => !result.response.success);
                const errorMessage = `Algunos pagos fallaron: ${failedItems.map(f => f.item.marca + ' ' + f.item.modelo).join(', ')}`;
                throw new Error(errorMessage);
            }

        } catch (error: any) {
            const errorMessage = error.message || 'Error al procesar los pagos del carrito';
            setErrors([errorMessage]);
            showNotificationMessage(errorMessage, 'error');

            if (onPaymentError) {
                onPaymentError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCardNumber = (value: string) => {
        return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 16) {
            handleCardInputChange('cardNumber', value);
        }
    };

    const handleExpirationChange = (field: 'cardExpirationMonth' | 'cardExpirationYear', value: string) => {
        const numericValue = value.replace(/\D/g, '');
        if (field === 'cardExpirationMonth' && numericValue.length <= 2) {
            handleCardInputChange(field, numericValue);
        } else if (field === 'cardExpirationYear' && numericValue.length <= 4) {
            handleCardInputChange(field, numericValue);
        }
    };

    const handleSecurityCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 4) {
            handleCardInputChange('securityCode', value);
        }
    };

    return (
        <div className="w-full bg-white p-6 rounded-lg shadow-lg border">
            <Toast
                message={notificationMessage}
                type={notificationType}
                isVisible={showNotification}
                onClose={() => setShowNotification(false)}
                duration={3000}
            />

            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💳 Pago del Carrito con Tarjeta</h3>

                {/* Resumen del carrito */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Resumen del Carrito</h4>
                    <div className="max-h-32 overflow-y-auto mb-3">
                        {cartItems.map((item) => (
                            <div key={item.id} className="text-sm text-gray-600 mb-1">
                                • {item.marca} {item.modelo} ({item.color}) x{item.cantidad} - ${item.precio.toLocaleString()}
                            </div>
                        ))}
                    </div>
                    {paymentMethod && (
                        <div className="text-sm text-gray-600 mb-3 flex items-center">
                            <span className="mr-2">{cardPaymentService.getPaymentMethodIcon(paymentMethod.id)}</span>
                            <span>{cardPaymentService.getPaymentMethodName(paymentMethod.id)}</span>
                        </div>
                    )}
                    <div className="border-t pt-2 flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg text-green-600">
                            ${totalPrice.toLocaleString('es-CO')}
                        </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Información del Cliente */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">Información Personal</h4>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="cart-name">Nombre *</Label>
                            <Input
                                id="cart-name"
                                type="text"
                                value={customerData.name}
                                onChange={(e) => handleCustomerInputChange('name', e.target.value)}
                                placeholder="Juan"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="cart-surname">Apellido *</Label>
                            <Input
                                id="cart-surname"
                                type="text"
                                value={customerData.surname}
                                onChange={(e) => handleCustomerInputChange('surname', e.target.value)}
                                placeholder="Pérez"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="cart-email">Email *</Label>
                        <Input
                            id="cart-email"
                            type="email"
                            value={customerData.email}
                            onChange={(e) => handleCustomerInputChange('email', e.target.value)}
                            placeholder="juan.perez@email.com"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label htmlFor="cart-areaCode">Código</Label>
                            <Input
                                id="cart-areaCode"
                                type="text"
                                value={customerData.areaCode}
                                onChange={(e) => handleCustomerInputChange('areaCode', e.target.value)}
                                placeholder="+57"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="cart-phoneNumber">Teléfono *</Label>
                            <Input
                                id="cart-phoneNumber"
                                type="text"
                                value={customerData.phoneNumber}
                                onChange={(e) => handleCustomerInputChange('phoneNumber', e.target.value)}
                                placeholder="3001234567"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="cart-identificationType">Tipo ID *</Label>
                            <select
                                id="cart-identificationType"
                                value={customerData.identificationType}
                                onChange={(e) => handleCustomerInputChange('identificationType', e.target.value)}
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
                            <Label htmlFor="cart-identificationNumber">Número ID *</Label>
                            <Input
                                id="cart-identificationNumber"
                                type="text"
                                value={customerData.identificationNumber}
                                onChange={(e) => handleCustomerInputChange('identificationNumber', e.target.value)}
                                placeholder="12345678"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Información de la Tarjeta */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">Información de la Tarjeta</h4>

                    <div>
                        <Label htmlFor="cart-cardNumber">Número de Tarjeta *</Label>
                        <Input
                            id="cart-cardNumber"
                            type="text"
                            value={formatCardNumber(cardData.cardNumber)}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label htmlFor="cart-cardExpirationMonth">Mes *</Label>
                            <Input
                                id="cart-cardExpirationMonth"
                                type="text"
                                value={cardData.cardExpirationMonth}
                                onChange={(e) => handleExpirationChange('cardExpirationMonth', e.target.value)}
                                placeholder="MM"
                                maxLength={2}
                                required
                            />
                            <div className="text-xs text-gray-500 mt-1">01-12</div>
                        </div>
                        <div>
                            <Label htmlFor="cart-cardExpirationYear">Año *</Label>
                            <Input
                                id="cart-cardExpirationYear"
                                type="text"
                                value={cardData.cardExpirationYear}
                                onChange={(e) => handleExpirationChange('cardExpirationYear', e.target.value)}
                                placeholder="YY o YYYY"
                                maxLength={4}
                                required
                            />
                            <div className="text-xs text-gray-500 mt-1">30 = 2030</div>
                        </div>
                        <div>
                            <Label htmlFor="cart-securityCode">CVV *</Label>
                            <Input
                                id="cart-securityCode"
                                type="text"
                                value={cardData.securityCode}
                                onChange={handleSecurityCodeChange}
                                placeholder="123"
                                maxLength={4}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="cart-cardholderName">Nombre en la Tarjeta *</Label>
                        <Input
                            id="cart-cardholderName"
                            type="text"
                            value={cardData.cardholderName}
                            onChange={(e) => handleCardInputChange('cardholderName', e.target.value.toUpperCase())}
                            placeholder="JUAN PEREZ"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="cart-cardDocType">Tipo ID Tarjetahabiente *</Label>
                            <select
                                id="cart-cardDocType"
                                value={cardData.docType}
                                onChange={(e) => handleCardInputChange('docType', e.target.value)}
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
                            <Label htmlFor="cart-cardDocNumber">Número ID Tarjetahabiente *</Label>
                            <Input
                                id="cart-cardDocNumber"
                                type="text"
                                value={cardData.docNumber}
                                onChange={(e) => handleCardInputChange('docNumber', e.target.value)}
                                placeholder="12345678"
                                required
                            />
                        </div>
                    </div>

                    {paymentMethod && paymentMethod.additional_info_needed?.includes('cardholder_identification_number') && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            ℹ️ Esta tarjeta requiere identificación del tarjetahabiente
                        </div>
                    )}
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
                        disabled={loading || !sdkLoaded}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                        onClick={() => {
                            console.log('🔧 Estado del botón al hacer click:', {
                                loading,
                                sdkLoaded,
                                disabled: loading || !sdkLoaded,
                                publicKey,
                                mercadopagoExists: typeof window.MercadoPago !== 'undefined',
                                mpExists: !!window.mp
                            });
                        }}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Procesando...
                            </div>
                        ) : (
                            `💳 Pagar ${totalPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`
                        )}
                    </Button>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        🔒 Pago 100% seguro con tecnología MercadoPago
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Se procesará un pago individual por cada producto en el carrito
                    </p>
                    {/* Debug info */}
                    <div className="text-xs text-blue-500 mt-2 p-2 bg-blue-50 rounded">
                        SDK Status: {sdkLoaded ? '✅ Cargado' : '❌ No cargado'} |
                        Loading: {loading ? '⏳' : '✅'} |
                        PublicKey: {publicKey ? '✅' : '❌'}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CardPaymentCart;
