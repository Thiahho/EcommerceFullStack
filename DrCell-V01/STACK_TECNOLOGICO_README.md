# 🚀 DrCell V01 - Stack Tecnológico

## 📝 Descripción

**DrCell V01** es un sistema de gestión integral para talleres de reparación de celulares, que permite consultar precios de reparaciones, gestionar inventario y administrar productos a través de una interfaz web moderna y una API REST robusta.

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR WEB                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │            FRONTEND (React)                     │   │
│  │  • React 18 + TypeScript                       │   │
│  │  • Tailwind CSS + Radix UI                     │   │
│  │  • Zustand (Estado Global)                     │   │
│  │  • Axios (HTTP Client)                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                     HTTPS/HTTP REST
                            │
┌─────────────────────────────────────────────────────────┐
│               BACKEND API (.NET Core)                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │          ASP.NET Core 8                         │   │
│  │  • JWT Authentication                          │   │
│  │  • Entity Framework Core                       │   │
│  │  • AutoMapper                                  │   │
│  │  • BCrypt (Password Hashing)                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                     PostgreSQL Driver
                            │
┌─────────────────────────────────────────────────────────┐
│                 BASE DE DATOS                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │            PostgreSQL 16                        │   │
│  │  • 7 Tablas Principales                        │   │
│  │  • 4 Vistas Optimizadas                        │   │
│  │  • Índices y Relaciones FK                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 TECNOLOGÍAS BACKEND

### **Framework Principal**
- **ASP.NET Core 8.0** - Framework web para APIs REST
- **C# 12** - Lenguaje de programación principal
- **.NET 8 Runtime** - Entorno de ejecución

### **Base de Datos**
- **PostgreSQL 16** - Sistema de gestión de base de datos
- **Entity Framework Core 8.0.0** - ORM (Object-Relational Mapping)
- **Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0** - Driver EF para PostgreSQL

### **Seguridad**
- **BCrypt.Net-Next 4.0.3** - Hashing de contraseñas
- **Microsoft.AspNetCore.Authentication.JwtBearer 8.0.0** - Autenticación JWT
- **System.IdentityModel.Tokens.Jwt 7.3.1** - Manejo de tokens JWT

### **Herramientas y Utilidades**
- **AutoMapper.Extensions.Microsoft.DependencyInjection 12.0.0** - Mapeo automático de objetos
- **Swashbuckle.AspNetCore 6.5.0** - Documentación Swagger/OpenAPI

### **Arquitectura Backend**
```
Controllers/          # Endpoints de la API REST
├── AdminController.cs
├── BaseController.cs
├── CelularesController.cs
├── ProductoController.cs
└── ReparacionesController.cs

Services/             # Lógica de negocio
├── Interface/        # Contratos de servicios
├── UsuarioService.cs
├── ProductosService.cs
└── EquiposService.cs

Data/                 # Acceso a datos
├── Modelos/          # Entidades de DB
├── Vistas/           # Views de DB
├── Dtos/             # Data Transfer Objects
└── ApplicationDbContext.cs

Migrations/           # Migraciones de EF Core
```

---

## 🎨 TECNOLOGÍAS FRONTEND

### **Framework Principal**
- **React 18** - Biblioteca para interfaces de usuario
- **TypeScript 4.9.5** - Superset de JavaScript con tipado estático

### **Herramientas de Build**
- **Vite 6.3.5** - Bundler y servidor de desarrollo rápido
- **@craco/craco 7.1.0** - Configuración personalizada para React Scripts
- **React Scripts 5.0.1** - Herramientas de construcción de React

### **UI y Estilos**
- **Tailwind CSS 3.4.1** - Framework CSS de utilidades
- **Radix UI** - Componentes primitivos accesibles
  - `@radix-ui/react-alert-dialog`
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-label`
  - `@radix-ui/react-select`
  - `@radix-ui/react-slot`
- **Material UI 5.15.10** - Biblioteca de componentes React
- **Lucide React 0.331.0** - Iconos SVG
- **Tailwind Merge 2.6.0** - Utilidad para combinar clases de Tailwind
- **Class Variance Authority 0.7.0** - Sistema de variantes para componentes

### **Gestión de Estado**
- **Zustand 4.5.1** - Gestión de estado global ligera
- **React Hook Form** - Manejo de formularios (nota: presente en tecnologías documentadas)
- **Zod** - Validación de esquemas (nota: presente en tecnologías documentadas)

### **HTTP y Networking**
- **Axios 1.6.7** - Cliente HTTP para peticiones a la API
- **Interceptores configurados** para manejo automático de autenticación

### **Routing**
- **React Router DOM 6.22.1** - Enrutamiento del lado del cliente

### **Notificaciones**
- **Sonner 2.0.5** - Sistema de notificaciones toast

### **Arquitectura Frontend**
```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes base (Button, Input, etc.)
│   ├── admin/           # Componentes del panel de administración
│   ├── layout/          # Componentes de layout
│   └── [feature-components]
├── pages/               # Páginas principales
│   ├── admin/           # Páginas de administración
│   ├── Home.tsx
│   ├── Login.tsx
│   └── RepairQuote.tsx
├── store/               # Gestión de estado global
│   ├── auth-store.ts
│   └── cart-store.ts
├── config/              # Configuraciones
│   ├── axios.ts
│   └── whatsapp.ts
└── lib/                 # Utilidades y configuraciones
    ├── axios.ts
    └── utils.ts
```

---

## 🗄️ ESQUEMA DE BASE DE DATOS

### **Tablas Principales**
```sql
-- Gestión de dispositivos
celulares (id, marca, modelo)
modulos (id, marca, modelo, costo, arreglo, color, marco, tipo, version)
baterias (id, marca, modelo, costo, arreglo, tipo)
pines (id, marca, modelo, costo, arreglo, tipo)

-- Gestión de usuarios y productos
usuarios (Id, Nombre, Email, ClaveHash, Rol)
productos (Id, Nombre, Descripcion, PrecioBase, Categoria, Estado)
productos_variantes (Id, ProductoId, Nombre, Precio, Stock, Activo)
```

### **Vistas Optimizadas**
```sql
-- Vista principal para consultas de reparación
vcelularesmbp - Información completa de módulos, baterías y pines
vcelularm     - Vista específica de módulos  
vcelularb     - Vista específica de baterías
vcelularp     - Vista específica de pines
```

---

## 🔒 SEGURIDAD IMPLEMENTADA

### **Backend**
- **JWT Authentication** - Tokens seguros para autenticación
- **BCrypt Hashing** - Encriptación de contraseñas
- **CORS Policy** - Control de acceso entre dominios
- **HTTPS Redirection** - Forzar conexiones seguras en producción
- **Secure Cookies** - Configuración segura de cookies

### **Frontend**
- **Token Interceptors** - Manejo automático de tokens JWT
- **Route Protection** - Protección de rutas basada en roles
- **Secure Storage** - Gestión segura de tokens
- **Error Handling** - Manejo de errores de autenticación

---

## 🐳 CONTAINERIZACIÓN

### **Docker Configuration**
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - db_data:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "5015:80"
    depends_on:
      - db

  frontend:
    build: ./Front
    ports:
      - "3000:80"
    depends_on:
      - backend
```

### **Dockerfiles**
- **Backend Dockerfile** - Multi-stage build para optimización
- **Frontend Dockerfile** - Build optimizado para producción

---

## 🚀 DESPLIEGUE Y CONFIGURACIÓN

### **Variables de Entorno Requeridas**

#### Backend (.env)
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=DrCell
DB_USER=postgres
DB_PASSWORD=secure-password

# JWT Configuration
JWT_SECRET=your-super-secure-secret-key
JWT_ISSUER=https://api.yourdomain.com
JWT_AUDIENCE=https://yourdomain.com

# CORS
CORS__ALLOWEDORIGINS=https://yourdomain.com
```

#### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
```

### **Scripts de Instalación**

#### Backend
```bash
# Restaurar dependencias
dotnet restore

# Ejecutar migraciones
dotnet ef database update

# Ejecutar aplicación
dotnet run
```

#### Frontend
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run start

# Construcción para producción
npm run build
```

---

## 📊 MÉTRICAS Y MONITOREO

### **Logging**
- **ILogger** integrado en todos los servicios
- **Structured Logging** con niveles configurables
- **Error Tracking** en controladores y servicios

### **Performance**
- **In-Memory Caching** implementado
- **Database Views** para consultas optimizadas
- **Async/Await** en todas las operaciones I/O

---

## 🔄 INTEGRACIÓN CONTINUA

### **Pre-commit Hooks** (Frontend)
- **ESLint** - Análisis estático de código
- **Prettier** - Formateo automático
- **TypeScript Check** - Verificación de tipos

### **Build Process**
- **Multi-stage Docker builds** para optimización
- **Environment-specific configurations**
- **Automatic dependency management**

---

## 📚 DOCUMENTACIÓN

### **API Documentation**
- **Swagger/OpenAPI** - Documentación interactiva de la API
- **XML Comments** - Documentación en código
- **Postman Collections** - Colecciones de prueba de API

### **Frontend Documentation**
- **Component Documentation** - Documentación de componentes
- **Type Definitions** - Interfaces TypeScript bien definidas
- **README files** - Documentación específica por feature

---

## 🎯 ROADMAP TECNOLÓGICO

### **Próximas Mejoras**
1. **Health Checks** - Monitoreo de estado de servicios
2. **Rate Limiting** - Protección contra abuso de API
3. **Distributed Caching** - Redis para cache distribuido
4. **Unit Testing** - Suite completa de tests automatizados
5. **CI/CD Pipeline** - Integración y despliegue continuo

### **Consideraciones de Escalabilidad**
- **Horizontal Scaling** - Arquitectura stateless lista para escalar
- **Database Optimization** - Índices y consultas optimizadas
- **CDN Ready** - Frontend preparado para CDN
- **Microservices Migration** - Arquitectura preparada para modularización

---

## 📞 SOPORTE TÉCNICO

**Repositorio**: DrCell-V01  
**Branch Principal**: TG-Master  
**Versión Actual**: 1.0.0  
**Última Actualización**: Enero 2025

---

*Este documento refleja el estado actual del stack tecnológico y debe actualizarse con cada cambio significativo en la arquitectura o tecnologías utilizadas.* 