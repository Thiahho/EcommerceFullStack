# 🏥 DrCell V01 - Sistema de Gestión de Reparaciones

## 📋 DESCRIPCIÓN

DrCell V01 es un sistema completo de gestión de reparaciones de dispositivos móviles que incluye:

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: ASP.NET Core 8 Web API
- **Base de Datos**: SQL Server
- **Autenticación**: JWT con httpOnly cookies
- **Seguridad**: BCrypt, CORS, Rate Limiting
- **Arquitectura**: Clean Architecture con DI

## 🚀 CARACTERÍSTICAS PRINCIPALES

### 🔐 Autenticación y Seguridad
- Sistema de login con JWT tokens
- Cookies httpOnly para máxima seguridad
- Cifrado de contraseñas con BCrypt
- Rate limiting para prevenir ataques
- Configuración CORS segura

### 📱 Gestión de Dispositivos
- Catálogo completo de dispositivos móviles
- Gestión de repuestos y componentes
- Sistema de búsqueda avanzada
- Filtros por marca, modelo y precio

### 🛠️ Gestión de Reparaciones
- Creación de órdenes de reparación
- Seguimiento de estado de reparaciones
- Cálculo automático de presupuestos
- Sistema de consultas por WhatsApp

### 🛒 Sistema de Tienda
- Catálogo de productos y repuestos
- Carrito de compras funcional
- Gestión de inventario
- Integración con WhatsApp

### 👨‍💼 Panel de Administración
- Gestión de productos y variantes
- Control de inventario
- Configuración de reparaciones
- Dashboard administrativo

## 🏗️ ARQUITECTURA TÉCNICA

### Backend (ASP.NET Core 8)
```
├── Controllers/     # Controladores REST API
├── Services/        # Lógica de negocio
├── Data/           # Modelos y contexto de BD
├── Migrations/     # Migraciones de EF Core
└── Program.cs      # Configuración principal
```

### Frontend (React)
```
├── src/
│   ├── components/  # Componentes React
│   ├── pages/       # Páginas principales
│   ├── store/       # Estado global (Zustand)
│   ├── lib/         # Utilidades y configuración
│   └── config/      # Configuración de servicios
```

## 🔧 REQUISITOS DEL SISTEMA

### Para Desarrollo Local
- .NET 8.0 SDK
- Node.js 18+
- SQL Server 2019+
- Visual Studio 2022 (recomendado)

### Para Producción VPS
- Ubuntu 20.04 LTS+
- 4GB RAM mínimo
- 40GB SSD mínimo
- 2 vCPUs mínimo

## 🚀 INSTALACIÓN Y DESPLIEGUE

### 📖 Documentación Completa
Para el despliegue completo en producción, consulta:

**[📋 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Guía completa de despliegue

**[⚙️ PRODUCTION_CONFIG.md](./PRODUCTION_CONFIG.md)** - Configuración de producción

### 🔧 Configuración Rápida

#### 1. Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/drcell-v01.git
cd drcell-v01
```

#### 2. Configurar Variables de Entorno
```bash
# Para Linux/Mac
export ASPNETCORE_ENVIRONMENT=Production
export DRCELL_DB_CONNECTION="Server=localhost;Database=DrCellDB;..."

# Para Windows
./set-production-env.bat
```

#### 3. Configurar Base de Datos
```bash
# Ejecutar script de BD
sqlcmd -S localhost -U usuario -P password -d DrCellDB -i BD/DrCell3.sql
```

#### 4. Construir y Ejecutar
```bash
# Frontend
cd Front && npm install && npm run build

# Backend
cd .. && dotnet restore && dotnet build -c Release

# Ejecutar migraciones
dotnet ef database update --environment Production

# Publicar aplicación
dotnet publish -c Release -o ./publish
```

## 🐳 DESPLIEGUE CON DOCKER

### Construcción de Imágenes
```bash
# Construir imagen completa
docker-compose build

# Ejecutar en producción
docker-compose up -d
```

### Variables de Entorno para Docker
```env
ASPNETCORE_ENVIRONMENT=Production
DRCELL_DB_CONNECTION=Server=db;Database=DrCellDB;...
DRCELL_JWT_SECRET=tu-secreto-super-seguro
DRCELL_JWT_ISSUER=https://tu-dominio.com
DRCELL_CORS_ORIGINS=https://tu-dominio.com
```

## 📊 CARACTERÍSTICAS DE PRODUCCIÓN

### 🔒 Seguridad
- ✅ HTTPS obligatorio
- ✅ Cookies httpOnly
- ✅ Rate limiting configurado
- ✅ Validación de entrada
- ✅ Cifrado de contraseñas

### ⚡ Rendimiento
- ✅ Optimización de bundle frontend
- ✅ Caché de archivos estáticos
- ✅ Compresión gzip
- ✅ Lazy loading
- ✅ Tree shaking

### 📈 Monitoreo
- ✅ Logs estructurados
- ✅ Health checks
- ✅ Métricas de sistema
- ✅ Alertas de error

## 🔧 CONFIGURACIÓN DE PRODUCCIÓN

### Variables de Entorno Requeridas
```bash
ASPNETCORE_ENVIRONMENT=Production
DRCELL_DB_CONNECTION="..."
DRCELL_JWT_SECRET="..."
DRCELL_JWT_ISSUER="https://tu-dominio.com"
DRCELL_JWT_AUDIENCE="https://tu-dominio.com"
DRCELL_CORS_ORIGINS="https://tu-dominio.com"
```

### Configuración de Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📂 ESTRUCTURA DE ARCHIVOS

```
DrCell-V01/
├── Controllers/        # API Controllers
├── Data/              # Modelos y contexto
├── Services/          # Servicios de negocio
├── Migrations/        # Migraciones EF Core
├── BD/               # Scripts de base de datos
├── Front/            # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/
│   └── public/
├── Pages/            # Páginas Razor (opcional)
├── docker-compose.yml
├── dockerfile
├── Program.cs
└── appsettings.json
```

## 🚨 SOLUCIÓN DE PROBLEMAS

### Problemas Comunes

1. **Error de conexión a BD**
   - Verificar cadena de conexión
   - Comprobar permisos de usuario
   - Validar que SQL Server esté corriendo

2. **Error 502 Bad Gateway**
   - Verificar que la aplicación esté corriendo en puerto 5000
   - Revisar configuración de Nginx
   - Comprobar logs de la aplicación

3. **Problemas de CORS**
   - Verificar configuración de dominios permitidos
   - Comprobar variable DRCELL_CORS_ORIGINS

## 📞 SOPORTE Y MANTENIMIENTO

### Monitoreo del Sistema
```bash
# Verificar estado de servicios
sudo systemctl status drcell
sudo systemctl status nginx

# Ver logs en tiempo real
sudo journalctl -u drcell -f
```

### Backup Regular
```bash
# Crear backup de base de datos
sqlcmd -S localhost -U user -P pass -Q "BACKUP DATABASE DrCellDB TO DISK = '/backups/DrCellDB_$(date +%Y%m%d).bak'"
```

### Actualización del Sistema
```bash
# Actualizar desde Git
git pull origin main
cd Front && npm install && npm run build
cd .. && dotnet build -c Release
dotnet publish -c Release -o ./publish
sudo systemctl restart drcell
```

## 📋 CHECKLIST DE PRODUCCIÓN

- [ ] Variables de entorno configuradas
- [ ] Base de datos creada y migrada
- [ ] Certificados SSL instalados
- [ ] Nginx configurado
- [ ] Firewall configurado
- [ ] Backups automáticos configurados
- [ ] Monitoreo configurado
- [ ] Dominio apuntando al servidor
- [ ] Pruebas de funcionalidad completadas

## 🔄 ACTUALIZACIONES

Para futuras actualizaciones:
1. Crear backup completo
2. Ejecutar script de actualización
3. Verificar funcionamiento
4. Rollback si es necesario

## 📚 DOCUMENTACIÓN ADICIONAL

- [📋 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía completa de despliegue
- [⚙️ PRODUCTION_CONFIG.md](./PRODUCTION_CONFIG.md) - Configuración de producción
- [🔧 set-production-env.ps1](./set-production-env.ps1) - Script de configuración

---

**Sistema DrCell V01 - Listo para producción** 🚀

**Stack**: ASP.NET Core 8 + React + SQL Server + Nginx  
**Versión**: 1.0.0  
**Entorno**: Producción  
**Seguridad**: ✅ Máxima  
**Rendimiento**: ✅ Optimizado 