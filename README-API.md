# 🚀 Ecommerce API - Guía de Uso con Postman

## 📋 Descripción
API REST completa para gestión de productos y variantes de ecommerce, construida con ASP.NET Core 8, Entity Framework Core, JWT y PostgreSQL.

## 🛠️ Tecnologías Utilizadas
- **Backend**: ASP.NET Core 8
- **Base de Datos**: PostgreSQL con Entity Framework Core
- **Autenticación**: JWT Bearer Token
- **Mapeo**: AutoMapper
- **Documentación**: Swagger/OpenAPI
- **Rate Limiting**: Protección contra ataques DDoS
- **Validación**: Data Annotations y FluentValidation

## 🚀 Configuración Inicial

### 1. Base de Datos
```sql
-- Crear base de datos
CREATE DATABASE ecommerce_dev;

-- Ejecutar migraciones (cuando estén disponibles)
dotnet ef database update
```

### 2. Configuración de Conexión
Editar `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=ecommerce_dev;Username=postgres;Password=123456;Port=5432"
  }
}
```

### 3. Ejecutar la API
```bash
dotnet run
```

La API estará disponible en: `https://localhost:7000` (HTTPS) o `http://localhost:5000` (HTTP)

## 📚 Documentación Swagger
- **URL**: `https://localhost:7000` o `http://localhost:5000`
- **Descripción**: Interfaz interactiva para probar todos los endpoints

## 🔐 Autenticación JWT

### 1. Obtener Token de Autenticación
```http
POST /api/Login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### 2. Usar Token en Headers
```
Authorization: Bearer {tu_token_jwt}
```

## 📱 Endpoints de Productos

### 🔍 **GET** - Obtener Todos los Productos
```http
GET /api/Productos
```
**Descripción**: Obtiene todos los productos con sus variantes
**Autenticación**: No requerida
**Rate Limit**: 100 requests por minuto

### 🔍 **GET** - Obtener Producto por ID
```http
GET /api/Productos/{id}
```
**Descripción**: Obtiene un producto específico con todas sus variantes
**Autenticación**: No requerida
**Rate Limit**: 100 requests por minuto

### 🔍 **GET** - Obtener Todas las Variantes
```http
GET /api/Productos/variantes
```
**Descripción**: Obtiene todas las variantes de productos
**Autenticación**: No requerida
**Rate Limit**: 100 requests por minuto

### 🔍 **GET** - Obtener Variantes por Producto
```http
GET /api/Productos/{productoId}/variantes
```
**Descripción**: Obtiene todas las variantes de un producto específico
**Autenticación**: No requerida
**Rate Limit**: 100 requests por minuto

### 🔍 **GET** - Opciones de RAM Disponibles
```http
GET /api/Productos/{productoId}/Ram-Opciones
```
**Descripción**: Obtiene las opciones de RAM disponibles para un producto
**Autenticación**: No requerida
**Rate Limit**: 100 requests por minuto

### 🔍 **GET** - Opciones de Almacenamiento
```http
GET /api/Productos/{productoId}/Almacenamiento-Opciones?ram={ram}
```
**Descripción**: Obtiene las opciones de almacenamiento disponibles para una RAM específica
**Autenticación**: No requerida
**Rate Limit**: 100 requests por minuto

### 🔍 **GET** - Opciones de Color
```http
GET /api/Productos/{productoId}/Color-Opciones?ram={ram}&almacenamiento={storage}
```
**Descripción**: Obtiene las opciones de color disponibles para RAM y almacenamiento específicos
**Autenticación**: No requerida
**Rate Limit**: 100 requests por minuto

### 🔍 **GET** - Buscar Variante Específica
```http
GET /api/Productos/{productId}/variante?ram={ram}&storage={storage}&color={color}&precio={precio}&stock={stock}&descuento={descuento}&almacenamiento={almacenamiento}
```
**Descripción**: Busca una variante específica por sus características
**Autenticación**: No requerida
**Rate Limit**: 100 requests por minuto

### 🔍 **GET** - Obtener Variante por ID
```http
GET /api/Productos/variante/{id}
```
**Descripción**: Obtiene una variante específica por su ID
**Autenticación**: No requerida
**Rate Limit**: 100 requests por minuto

### ➕ **POST** - Crear Producto
```http
POST /api/Productos
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "iPhone 15 Pro",
  "marca": "Apple",
  "descripcion": "El iPhone más avanzado de Apple",
  "categoriaId": 1,
  "images": "base64_encoded_image_string"
}
```
**Descripción**: Crea un nuevo producto
**Autenticación**: ADMIN requerida
**Rate Limit**: 10 requests por minuto (CriticalPolicy)

### ✏️ **PUT** - Actualizar Producto
```http
PUT /api/Productos/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": 1,
  "nombre": "iPhone 15 Pro Max",
  "marca": "Apple",
  "descripcion": "El iPhone más avanzado de Apple - Versión Max",
  "categoriaId": 1,
  "images": "base64_encoded_image_string"
}
```
**Descripción**: Actualiza un producto existente
**Autenticación**: ADMIN requerida
**Rate Limit**: 100 requests por minuto

### 🗑️ **DELETE** - Eliminar Producto
```http
DELETE /api/Productos/{id}
Authorization: Bearer {token}
```
**Descripción**: Elimina un producto y todas sus variantes
**Autenticación**: ADMIN requerida
**Rate Limit**: 10 requests por minuto (CriticalPolicy)

## 📦 Endpoints de Variantes

### ➕ **POST** - Crear Variante
```http
POST /api/Productos/variante
Authorization: Bearer {token}
Content-Type: application/json

{
  "productoId": 1,
  "stock": 50,
  "precio": 999.99,
  "color": "Negro",
  "descuento": 0,
  "ram": "8GB",
  "almacenamiento": "256GB"
}
```
**Descripción**: Crea una nueva variante de producto
**Autenticación**: ADMIN requerida
**Rate Limit**: 100 requests por minuto

### ✏️ **PUT** - Actualizar Variante
```http
PUT /api/Productos/variante/{varianteId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": 1,
  "productoId": 1,
  "stock": 45,
  "precio": 899.99,
  "color": "Negro",
  "descuento": 10,
  "ram": "8GB",
  "almacenamiento": "256GB"
}
```
**Descripción**: Actualiza una variante existente
**Autenticación**: ADMIN requerida
**Rate Limit**: 100 requests por minuto

### 🗑️ **DELETE** - Eliminar Variante
```http
DELETE /api/Productos/variante/{id}
Authorization: Bearer {token}
```
**Descripción**: Elimina una variante específica
**Autenticación**: ADMIN requerida
**Rate Limit**: 10 requests por minuto (CriticalPolicy)

## 🧪 Colección de Postman

### 1. Crear Nueva Colección
- Nombre: `Ecommerce API`
- Descripción: `API para gestión de productos y variantes`

### 2. Configurar Variables de Entorno
```json
{
  "base_url": "https://localhost:7000",
  "auth_token": ""
}
```

### 3. Configurar Headers Globales
```
Content-Type: application/json
```

### 4. Script de Autenticación Automática
En el endpoint de login, agregar este script en "Tests":
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("auth_token", response.token);
}
```

### 5. Script para Headers de Autenticación
En cada endpoint que requiera autenticación, agregar este script en "Pre-request Script":
```javascript
const token = pm.environment.get("auth_token");
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: `Bearer ${token}`
    });
}
```

## 🔒 Seguridad y Validaciones

### Rate Limiting
- **AuthPolicy**: 100 requests por minuto para endpoints públicos
- **CriticalPolicy**: 10 requests por minuto para operaciones críticas (CRUD)

### Validaciones
- **Productos**: Nombre, marca y descripción son obligatorios
- **Variantes**: Stock, precio y color son obligatorios
- **Imágenes**: Máximo 1MB en formato base64
- **Precios**: Deben ser mayores a 0
- **Descuentos**: Entre 0 y 100%

### Protección SQL Injection
- Entity Framework Core con parámetros tipados
- Validación de entrada con Data Annotations
- Sanitización automática de datos

## 📊 Ejemplos de Respuestas

### Producto Creado Exitosamente
```json
{
  "id": 1,
  "nombre": "iPhone 15 Pro",
  "marca": "Apple",
  "descripcion": "El iPhone más avanzado de Apple",
  "categoriaId": 1,
  "images": "base64_string",
  "variantes": []
}
```

### Error de Validación
```json
{
  "errors": {
    "nombre": ["El campo Nombre es obligatorio"],
    "precio": ["El precio debe ser mayor a 0"]
  }
}
```

### Error de Autenticación
```json
{
  "message": "Unauthorized"
}
```

## 🚨 Códigos de Estado HTTP

- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado exitosamente
- **400**: Bad Request - Error de validación
- **401**: Unauthorized - Token inválido o faltante
- **403**: Forbidden - Sin permisos suficientes
- **404**: Not Found - Recurso no encontrado
- **429**: Too Many Requests - Rate limit excedido
- **500**: Internal Server Error - Error del servidor

## 🔧 Troubleshooting

### Error de Conexión a Base de Datos
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar credenciales en `appsettings.Development.json`
3. Verificar que la base de datos exista

### Error de JWT
1. Verificar que el token no haya expirado
2. Verificar formato: `Bearer {token}`
3. Verificar que el usuario tenga rol ADMIN para operaciones críticas

### Error de Rate Limiting
1. Esperar 1 minuto para resetear el contador
2. Reducir la frecuencia de requests
3. Usar endpoints públicos cuando sea posible

## 📞 Soporte

Para problemas técnicos o consultas:
- Revisar logs de la aplicación
- Verificar configuración en `appsettings.json`
- Consultar documentación de Swagger en `/swagger`

---

**¡Disfruta probando tu API de Ecommerce! 🎉**
