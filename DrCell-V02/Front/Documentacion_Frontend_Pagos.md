# Frontend - Sistema de Pagos con Tarjeta

## Resumen

Se ha implementado un sistema completo de pagos directo con tarjeta de crédito/débito utilizando el SDK de MercadoPago. Este sistema permite procesar pagos sin redirección, tokenizando la tarjeta en el frontend y procesando el pago directamente en el backend.

---

## 🗂️ Archivos Creados

### 1. **`cardPaymentService.ts`**
**Ubicación:** `src/services/cardPaymentService.ts`

Servicio principal que maneja:
- ✅ Inicialización del SDK de MercadoPago
- ✅ Tokenización de tarjetas
- ✅ Validación de datos
- ✅ Identificación de métodos de pago
- ✅ Procesamiento de pagos
- ✅ Manejo de errores

### 2. **`CardPaymentForm.tsx`**
**Ubicación:** `src/components/mp/CardPaymentForm.tsx`

Componente completo de formulario que incluye:
- ✅ Formulario de datos del cliente
- ✅ Formulario de datos de tarjeta
- ✅ Validación en tiempo real
- ✅ Identificación automática de método de pago
- ✅ Tokenización automática
- ✅ Procesamiento de pago
- ✅ Manejo de estados (loading, errores, éxito)
- ✅ Interfaz responsive

### 3. **`DetalleProducto.tsx` (Actualizado)**
**Ubicación:** `src/components/DetalleProducto.tsx`

Integración del nuevo sistema de pagos:
- ✅ Obtención de clave pública de MercadoPago
- ✅ Integración del componente de pago
- ✅ Manejo de callbacks de éxito/error

---

## 🚀 Funcionalidades Implementadas

### **Inicialización Automática**
```typescript
// El servicio se inicializa automáticamente al cargar el componente
await cardPaymentService.initialize(publicKey);
```

### **Tokenización Segura**
```typescript
// Los datos de tarjeta nunca llegan al backend
const token = await cardPaymentService.createCardToken({
  cardNumber: '4111111111111111',
  securityCode: '123',
  cardExpirationMonth: '12',
  cardExpirationYear: '2025',
  cardholderName: 'JUAN PEREZ',
  docType: 'CC',
  docNumber: '12345678'
});
```

### **Identificación de Método de Pago**
```typescript
// Identificación automática basada en el BIN
const paymentMethod = await cardPaymentService.getPaymentMethod(cardNumber);
```

### **Validación Completa**
```typescript
// Validación de datos de tarjeta
const errors = cardPaymentService.validateCardData(cardData);

// Validación de datos de pago
const paymentErrors = cardPaymentService.validatePaymentData(paymentData);
```

### **Procesamiento de Pago**
```typescript
// Envío del pago al backend
const response = await cardPaymentService.processCardPayment(paymentData);
```

---

## 🎨 Interfaz de Usuario

### **Estados del Componente**
1. **Botón inicial:** `💳 Pagar con Tarjeta`
2. **Formulario expandido:** Todos los campos necesarios
3. **Estado de carga:** Indicador de procesamiento
4. **Notificaciones:** Toast messages para feedback

### **Validaciones Visuales**
- ✅ Formato automático de número de tarjeta
- ✅ Validación de fecha de vencimiento
- ✅ Validación de CVV
- ✅ Identificación visual del método de pago
- ✅ Mensajes de error descriptivos

### **Responsividad**
- ✅ Diseño adaptable para móvil y desktop
- ✅ Formularios optimizados para diferentes pantallas
- ✅ Botones y campos táctiles

---

## 🔧 Configuración

### **1. Clave Pública**
El sistema obtiene automáticamente la clave pública del backend:

```typescript
// Endpoint: GET /mercadopago/public-key
const response = await axios.get('/mercadopago/public-key');
setPublicKey(response.data.publicKey);
```

### **2. Tipos de Identificación**
```typescript
const tiposIdentificacion = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PP', label: 'Pasaporte' },
  { value: 'NIT', label: 'NIT' }
];
```

### **3. Métodos de Pago Soportados**
- ✅ Visa
- ✅ Mastercard  
- ✅ American Express
- ✅ Diners Club
- ✅ Maestro
- ✅ Y más según configuración de MercadoPago

---

## 📱 Flujo de Usuario

### **1. Selección de Producto**
```
Usuario selecciona variante → Se muestra precio → Aparece botón de pago
```

### **2. Iniciación de Pago**
```
Usuario hace clic en "💳 Pagar con Tarjeta" → Se expande formulario
```

### **3. Llenado de Formulario**
```
Datos personales → Datos de tarjeta → Validación automática
```

### **4. Identificación de Tarjeta**
```
Usuario ingresa número → Sistema identifica método de pago automáticamente
```

### **5. Procesamiento**
```
Submit → Tokenización → Envío al backend → Respuesta → Notificación
```

---

## 🔐 Seguridad

### **Tokenización**
- ✅ Datos de tarjeta nunca llegan al backend
- ✅ Solo se envía token seguro
- ✅ Validación en frontend y backend

### **Validaciones**
- ✅ Formato de tarjeta
- ✅ Fecha de vencimiento
- ✅ CVV
- ✅ Datos del tarjetahabiente
- ✅ Stock del producto

### **Manejo de Errores**
- ✅ Errores de tokenización
- ✅ Errores de pago
- ✅ Errores de red
- ✅ Errores de validación

---

## 📊 Estados de Pago

### **Estados Principales**
| Estado | Descripción | Acción |
|--------|-------------|---------|
| `approved` | Pago aprobado | ✅ Mostrar éxito |
| `pending` | Pago pendiente | ⏳ Mostrar pendiente |
| `rejected` | Pago rechazado | ❌ Mostrar error |

### **Mensajes de Error Comunes**
| Error | Mensaje | Solución |
|-------|---------|----------|
| `cc_rejected_insufficient_amount` | Fondos insuficientes | Usar otra tarjeta |
| `cc_rejected_bad_filled_card_number` | Número incorrecto | Verificar número |
| `cc_rejected_bad_filled_security_code` | CVV incorrecto | Verificar CVV |

---

## 🎯 Props del Componente

### **CardPaymentForm Props**
```typescript
interface CardPaymentFormProps {
  producto: {
    id: number;
    marca: string;
    modelo: string;
    categoria: string;
  };
  variante: {
    id: number;
    ram: string;
    almacenamiento: string;
    color: string;
    precio: number;
    stock: number;
  };
  cantidad?: number;           // Por defecto: 1
  publicKey: string;          // Clave pública de MercadoPago
  onPaymentSuccess?: (response: any) => void;
  onPaymentError?: (error: string) => void;
  onCancel?: () => void;
}
```

---

## 🔧 Instalación de Dependencias

### **Dependencias Requeridas**
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.0.0",
    "react-router-dom": "^6.0.0"
  }
}
```

### **Script de MercadoPago**
El SDK se carga automáticamente cuando es necesario:
```javascript
// Se carga dinámicamente desde:
// https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js
```

---

## 🚀 Uso del Componente

### **Ejemplo de Implementación**
```tsx
import CardPaymentForm from '@/components/mp/CardPaymentForm';

function ProductDetail() {
  const [publicKey, setPublicKey] = useState('');

  useEffect(() => {
    // Obtener clave pública
    axios.get('/mercadopago/public-key')
      .then(res => setPublicKey(res.data.publicKey));
  }, []);

  const handlePaymentSuccess = (response) => {
    console.log('Pago exitoso:', response);
    // Redirigir a página de éxito
  };

  const handlePaymentError = (error) => {
    console.error('Error en pago:', error);
    // Mostrar mensaje de error
  };

  return (
    <CardPaymentForm
      producto={producto}
      variante={variante}
      cantidad={1}
      publicKey={publicKey}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
    />
  );
}
```

---

## 📝 Notas de Desarrollo

### **Testing**
- ✅ Usar tarjetas de prueba de MercadoPago
- ✅ Verificar en ambiente sandbox
- ✅ Probar diferentes escenarios de error

### **Mantenimiento**
- ✅ Monitorear versiones del SDK
- ✅ Actualizar métodos de pago soportados
- ✅ Revisar mensajes de error

### **Performance**
- ✅ SDK se carga solo cuando es necesario
- ✅ Validaciones optimizadas
- ✅ Componente responsivo y rápido

---

## 🎉 Resultado Final

El frontend ahora cuenta con un sistema completo de pagos que:

1. **Carga automáticamente** el SDK de MercadoPago
2. **Tokeniza de forma segura** las tarjetas
3. **Identifica automáticamente** el método de pago
4. **Valida en tiempo real** todos los datos
5. **Procesa pagos** sin redirección
6. **Maneja todos los errores** posibles
7. **Proporciona feedback** visual al usuario
8. **Es totalmente responsive** y accesible

¡El sistema está listo para procesar pagos de forma segura y eficiente! 🚀
