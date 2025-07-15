# ⚡ GUÍA DE CONFIGURACIÓN INICIAL - DRCELL V01

## 📋 RESUMEN EJECUTIVO

Esta guía te ayudará a configurar DrCell V01 para producción de manera rápida y efectiva.

## 🚀 OPCIONES DE DESPLIEGUE

### 🎯 Opción 1: Despliegue Directo en VPS
**Recomendado para máximo control**
- Instalación directa en Ubuntu Server
- Configuración manual de servicios
- Mayor flexibilidad y control

**Sigue**: [📋 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### 🐳 Opción 2: Despliegue con Docker
**Recomendado para simplicidad**
- Configuración con contenedores
- Fácil mantenimiento y escalabilidad
- Menos configuración manual

**Sigue**: [🐳 DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

## 🔧 CONFIGURACIÓN RÁPIDA

### 1. Preparar Servidor VPS
```bash
# Conectar al servidor
ssh root@tu-servidor-ip

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Git
apt install -y git
```

### 2. Clonar Repositorio
```bash
# Clonar el proyecto
git clone https://github.com/tu-usuario/drcell-v01.git
cd drcell-v01
```

### 3. Configurar Variables de Entorno
**Opción A: Script Automático (Windows)**
```bash
# Ejecutar script de configuración
./set-production-env.bat
```

**Opción B: Script Automático (Linux)**
```bash
# Ejecutar script de configuración
./set-production-env.ps1
```

**Opción C: Manual**
```bash
# Configurar variables manualmente
export ASPNETCORE_ENVIRONMENT=Production
export DRCELL_DB_CONNECTION="Server=localhost;Database=DrCellDB;User Id=drcell_user;Password=TuPassword;"
export DRCELL_JWT_SECRET="TuSecretoJWTSuperSeguro64Caracteres1234567890"
export DRCELL_JWT_ISSUER="https://tu-dominio.com"
export DRCELL_JWT_AUDIENCE="https://tu-dominio.com"
export DRCELL_CORS_ORIGINS="https://tu-dominio.com"
```

### 4. Configurar Base de Datos
```bash
# Conectar a SQL Server
sqlcmd -S localhost -U sa -P 'TuPasswordSegura'

# Crear base de datos
CREATE DATABASE DrCellDB;
GO

# Crear usuario
CREATE LOGIN drcell_user WITH PASSWORD = 'TuPasswordDeAplicacion';
GO

# Ejecutar script de BD
sqlcmd -S localhost -U drcell_user -P 'TuPasswordDeAplicacion' -d DrCellDB -i BD/DrCell3.sql
```

### 5. Construir y Desplegar
```bash
# Construir frontend
cd Front
npm install
npm run build

# Construir backend
cd ..
dotnet restore
dotnet build -c Release
dotnet publish -c Release -o ./publish

# Ejecutar migraciones
dotnet ef database update --environment Production
```

## 📊 VERIFICACIÓN DEL SISTEMA

### 1. Verificar Servicios
```bash
# Verificar aplicación
curl -I http://localhost:5000

# Verificar base de datos
sqlcmd -S localhost -U drcell_user -P 'TuPassword' -Q "SELECT 1"
```

### 2. Verificar Funcionalidad
- [ ] Página principal carga correctamente
- [ ] Sistema de login funciona
- [ ] API responde correctamente
- [ ] Base de datos está conectada
- [ ] SSL está configurado

## 🔒 CONFIGURACIÓN DE SEGURIDAD

### 1. Configurar Firewall
```bash
# Instalar UFW
sudo apt install -y ufw

# Configurar reglas
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Configurar SSL
```bash
# Instalar certbot
sudo apt install -y certbot

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🌐 CONFIGURACIÓN DE DOMINIO

### 1. Apuntar Dominio al Servidor
```
# Configurar DNS
A record: tu-dominio.com -> IP-del-servidor
CNAME: www.tu-dominio.com -> tu-dominio.com
```

### 2. Configurar Nginx
```bash
# Instalar nginx
sudo apt install -y nginx

# Configurar sitio
sudo nano /etc/nginx/sites-available/drcell

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/drcell /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📋 CHECKLIST DE PRODUCCIÓN

### Antes del Despliegue
- [ ] Servidor VPS configurado
- [ ] Dominio apuntando al servidor
- [ ] Certificados SSL obtenidos
- [ ] Variables de entorno configuradas
- [ ] Base de datos creada

### Durante el Despliegue
- [ ] Código clonado del repositorio
- [ ] Dependencias instaladas
- [ ] Frontend construido
- [ ] Backend compilado
- [ ] Migraciones ejecutadas

### Después del Despliegue
- [ ] Aplicación funcionando
- [ ] SSL configurado
- [ ] Firewall configurado
- [ ] Backups configurados
- [ ] Monitoreo configurado

## 🚨 RESOLUCIÓN DE PROBLEMAS

### Problema: Error 502 Bad Gateway
```bash
# Verificar que la aplicación esté corriendo
sudo systemctl status drcell

# Verificar logs
sudo journalctl -u drcell -f
```

### Problema: Error de conexión a BD
```bash
# Verificar SQL Server
sudo systemctl status mssql-server

# Probar conexión
sqlcmd -S localhost -U drcell_user -P 'TuPassword'
```

### Problema: Variables de entorno no cargadas
```bash
# Verificar variables
env | grep -i drcell

# Recargar variables
source /etc/environment
```

## 📞 SOPORTE

### Documentación Completa
- [📋 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía completa de despliegue
- [🐳 DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Despliegue con Docker
- [⚙️ PRODUCTION_CONFIG.md](./PRODUCTION_CONFIG.md) - Configuración detallada

### Archivos de Configuración
- [🔧 set-production-env.ps1](./set-production-env.ps1) - Script PowerShell
- [🔧 set-production-env.bat](./set-production-env.bat) - Script Batch
- [🐳 docker-compose.yml](./docker-compose.yml) - Configuración Docker
- [🌐 nginx.conf](./nginx.conf) - Configuración Nginx

### Estructura del Proyecto
```
DrCell-V01/
├── README.md                 # Documentación principal
├── DEPLOYMENT_GUIDE.md       # Guía completa de despliegue
├── DOCKER_DEPLOYMENT.md      # Despliegue con Docker
├── PRODUCTION_CONFIG.md      # Configuración de producción
├── SETUP_GUIDE.md           # Esta guía
├── .gitignore               # Archivos ignorados por Git
├── docker-compose.yml       # Configuración Docker
├── nginx.conf               # Configuración Nginx
└── set-production-env.*     # Scripts de configuración
```

---

**¡Sistema DrCell V01 listo para producción!** 🚀

**Stack**: ASP.NET Core 8 + React + SQL Server + Nginx  
**Seguridad**: ✅ Máxima  
**Rendimiento**: ✅ Optimizado  
**Producción**: ✅ Listo 