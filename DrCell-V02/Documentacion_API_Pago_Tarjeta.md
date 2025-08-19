# API de Pago Directo con Tarjeta - MercadoPago

## Endpoint: `/procesar-pago-tarjeta`

**Método:** `POST`  
**Descripción:** Procesa pagos directos con tarjeta de crédito/débito utilizando el SDK de MercadoPago. El endpoint tokeniza la tarjeta y efectúa el pago de forma inmediata sin redirección.

---

## Request Body

### Estructura del JSON

```json
{
  "name": "Juan",
  "surname": "Pérez",
  "email": "juan.perez@email.com",
  "areaCode": "+57",
  "phoneNumber": "3001234567",
  "identificationType": "CC",
  "identificationNumber": "12345678",
  "productoId": 1,
  "varianteId": 5,
  "cantidad": 1,
  "cardToken": "c123e4567-8901-23d4-e567-890123456789",
  "paymentMethodId": "visa",
  "cardholderIdentificationType": "CC",
  "cardholderIdentificationNumber": "12345678",
  "cardholderName": "JUAN PEREZ",
  "installments": 1,
  "billingAddress": "Calle 123 #45-67",
  "billingCity": "Bogotá",
  "billingState": "Cundinamarca",
  "billingZipCode": "110111",
  "billingCountry": "CO"
}
```

### Campos Requeridos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `name` | string | Nombre del comprador | "Juan" |
| `surname` | string | Apellido del comprador | "Pérez" |
| `email` | string | Email del comprador | "juan.perez@email.com" |
| `areaCode` | string | Código de área del teléfono | "+57" |
| `phoneNumber` | string | Número de teléfono | "3001234567" |
| `identificationType` | string | Tipo de identificación del comprador | "CC", "CE", "TI", "PP", "NIT" |
| `identificationNumber` | string | Número de identificación | "12345678" |
| `productoId` | int | ID del producto a comprar | 1 |
| `varianteId` | int | ID de la variante del producto | 5 |
| `cantidad` | int | Cantidad de productos (mínimo 1) | 1 |
| `cardToken` | string | Token de la tarjeta generado por MercadoPago | "c123e4567-8901-23d4-e567-890123456789" |
| `paymentMethodId` | string | ID del método de pago | "visa", "master", "amex", etc. |
| `cardholderIdentificationType` | string | Tipo de identificación del tarjetahabiente | "CC", "CE", "TI", "PP", "NIT" |
| `cardholderIdentificationNumber` | string | Número de identificación del tarjetahabiente | "12345678" |
| `cardholderName` | string | Nombre completo del tarjetahabiente | "JUAN PEREZ" |

### Campos Opcionales

| Campo | Tipo | Descripción | Valor por Defecto |
|-------|------|-------------|-------------------|
| `installments` | int | Número de cuotas | 1 |
| `billingAddress` | string | Dirección de facturación | null |
| `billingCity` | string | Ciudad de facturación | null |
| `billingState` | string | Estado/Departamento de facturación | null |
| `billingZipCode` | string | Código postal de facturación | null |
| `billingCountry` | string | País de facturación | "CO" |

---

## Response

### Respuesta Exitosa (Status 200)

```json
{
  "success": true,
  "message": "Pago aprobado exitosamente",
  "paymentId": 123456789,
  "status": "approved",
  "statusDetail": "accredited",
  "amount": 850000,
  "currency": "COP",
  "dateCreated": "2024-01-15T10:30:00Z",
  "dateApproved": "2024-01-15T10:30:05Z",
  "transactionId": "PROD_1_VAR_5_20240115103000",
  "authorizationCode": "AUTH123456",
  "paymentMethod": {
    "id": "visa",
    "type": "credit_card",
    "name": "visa",
    "lastFourDigits": "4321",
    "installments": 1
  },
  "product": {
    "id": 1,
    "name": "Samsung Galaxy S24",
    "variant": "Negro - 8GB/256GB",
    "quantity": 1,
    "unitPrice": 850000,
    "totalPrice": 850000
  },
  "customer": {
    "name": "Juan",
    "surname": "Pérez",
    "email": "juan.perez@email.com",
    "phone": "+573001234567",
    "identification": "CC-12345678"
  }
}
```

### Respuesta de Error (Status 400/500)

```json
{
  "success": false,
  "message": "Fondos insuficientes",
  "paymentId": null,
  "status": "rejected",
  "statusDetail": "cc_rejected_insufficient_amount",
  "amount": 850000,
  "currency": "COP",
  "dateCreated": "2024-01-15T10:30:00Z",
  "dateApproved": null,
  "transactionId": "PROD_1_VAR_5_20240115103000",
  "authorizationCode": null,
  "paymentMethod": {
    "id": "visa",
    "type": "credit_card",
    "name": "visa",
    "lastFourDigits": "4321",
    "installments": 1
  },
  "product": {
    "id": 1,
    "name": "Samsung Galaxy S24",
    "variant": "Negro - 8GB/256GB",
    "quantity": 1,
    "unitPrice": 850000,
    "totalPrice": 850000
  },
  "customer": {
    "name": "Juan",
    "surname": "Pérez",
    "email": "juan.perez@email.com",
    "phone": "+573001234567",
    "identification": "CC-12345678"
  }
}
```

---

## Estados de Pago

### Estados Principales

| Estado | Descripción |
|--------|-------------|
| `approved` | Pago aprobado y procesado exitosamente |
| `pending` | Pago pendiente de procesamiento |
| `rejected` | Pago rechazado |
| `cancelled` | Pago cancelado |
| `refunded` | Pago reembolsado |
| `charged_back` | Pago con contracargo |

### Detalles de Estado - Pendiente

| Detalle | Descripción |
|---------|-------------|
| `pending_contingency` | Pago pendiente por contingencia |
| `pending_review_manual` | Pago pendiente de revisión manual |
| `pending_waiting_payment` | Esperando el pago |
| `pending_waiting_transfer` | Esperando transferencia |

### Detalles de Estado - Rechazado

| Detalle | Descripción |
|---------|-------------|
| `cc_rejected_insufficient_amount` | Fondos insuficientes |
| `cc_rejected_bad_filled_card_number` | Número de tarjeta incorrecto |
| `cc_rejected_bad_filled_date` | Fecha de vencimiento incorrecta |
| `cc_rejected_bad_filled_security_code` | Código de seguridad incorrecto |
| `cc_rejected_bad_filled_other` | Datos de tarjeta incorrectos |
| `cc_rejected_blacklist` | Tarjeta en lista negra |
| `cc_rejected_call_for_authorize` | Debe autorizar el pago con su banco |
| `cc_rejected_card_disabled` | Tarjeta deshabilitada |
| `cc_rejected_duplicated_payment` | Pago duplicado |
| `cc_rejected_high_risk` | Pago rechazado por alto riesgo |
| `cc_rejected_max_attempts` | Máximo de intentos alcanzado |

---

## Códigos de Respuesta HTTP

| Código | Descripción |
|--------|-------------|
| `200` | Pago procesado (exitoso o fallido) |
| `400` | Datos inválidos o errores de validación |
| `404` | Producto o variante no encontrada |
| `500` | Error interno del servidor |

---

## Ejemplo de Uso con cURL

```bash
curl -X POST https://tu-dominio.com/procesar-pago-tarjeta \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan",
    "surname": "Pérez", 
    "email": "juan.perez@email.com",
    "areaCode": "+57",
    "phoneNumber": "3001234567",
    "identificationType": "CC",
    "identificationNumber": "12345678",
    "productoId": 1,
    "varianteId": 5,
    "cantidad": 1,
    "cardToken": "c123e4567-8901-23d4-e567-890123456789",
    "paymentMethodId": "visa",
    "cardholderIdentificationType": "CC",
    "cardholderIdentificationNumber": "12345678",
    "cardholderName": "JUAN PEREZ",
    "installments": 1
  }'
```

---

## Notas Importantes

1. **Token de Tarjeta**: El `cardToken` debe ser generado previamente usando el SDK de MercadoPago en el frontend.
2. **Seguridad**: Nunca envíes datos de tarjeta (número, CVV, fecha) directamente al backend.
3. **Stock**: El stock del producto se reduce automáticamente solo si el pago es aprobado.
4. **Identificación**: El tipo de identificación debe coincidir con los valores aceptados por MercadoPago.
5. **Moneda**: Todos los montos están en pesos colombianos (COP).
6. **Cuotas**: Las cuotas dependen del método de pago y la configuración de MercadoPago.

---

## Integración Frontend

Para integrar este endpoint en el frontend, necesitarás:

1. **Tokenizar la tarjeta** usando MercadoPago SDK
2. **Validar los datos** del formulario
3. **Enviar la petición** al endpoint
4. **Manejar la respuesta** (éxito/error)

### Ejemplo de Tokenización (JavaScript)

```javascript
// Configurar MercadoPago
window.Mercadopago.setPublishableKey('TU_PUBLIC_KEY');

// Tokenizar tarjeta
window.Mercadopago.createToken({
  cardNumber: '4111111111111111',
  securityCode: '123',
  cardExpirationMonth: '12',
  cardExpirationYear: '2025',
  docType: 'CC',
  docNumber: '12345678'
}).then(function(response) {
  // Usar response.id como cardToken en el API
  const cardToken = response.id;
  // Proceder con el pago...
}).catch(function(error) {
  console.error('Error al tokenizar:', error);
});
```
