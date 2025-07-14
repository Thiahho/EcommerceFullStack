# 🚀 GUÍA DE DESPLIEGUE DRCELL V01 EN PRODUCCIÓN

## 📋 ÍNDICE
1. [Requisitos del Servidor](#requisitos-del-servidor)
2. [Preparación del Entorno](#preparación-del-entorno)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Instalación del Sistema](#instalación-del-sistema)
5. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
6. [Construcción y Despliegue](#construcción-y-despliegue)
7. [Configuración del Servidor Web](#configuración-del-servidor-web)
8. [Configuración de SSL](#configuración-de-ssl)
9. [Verificación del Sistema](#verificación-del-sistema)
10. [Mantenimiento y Monitoreo](#mantenimiento-y-monitoreo)

---

## 🖥️ REQUISITOS DEL SERVIDOR

### Especificaciones Mínimas VPS
- **Sistema Operativo**: Ubuntu 20.04 LTS o superior
- **RAM**: 4GB mínimo (8GB recomendado)
- **Almacenamiento**: 40GB SSD mínimo
- **CPU**: 2 vCPUs mínimo
- **Ancho de Banda**: 10GB/mes mínimo

### Software Requerido
- **.NET 8.0 Runtime**
- **Node.js 18+ y npm**
- **SQL Server 2019 o superior**
- **Nginx** (servidor web)
- **Git**
- **UFW** (firewall)

---

## 🛠️ PREPARACIÓN DEL ENTORNO

### 1. Conectar al Servidor VPS
```bash
ssh root@tu-servidor-ip
```

### 2. Actualizar Sistema
```bash
apt update && apt upgrade -y
```

### 3. Instalar Dependencias Básicas
```bash
apt install -y curl wget git software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 4. Crear Usuario del Sistema
```bash
# Crear usuario para la aplicación
useradd -m -s /bin/bash drcell
# Agregar al grupo sudo
usermod -aG sudo drcell
# Cambiar a usuario drcell
su - drcell
```

### 5. Instalar .NET 8.0
```bash
# Agregar repositorio de Microsoft
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb

# Instalar .NET 8.0 Runtime
sudo apt update
sudo apt install -y dotnet-runtime-8.0 aspnetcore-runtime-8.0
```

### 6. Instalar Node.js y npm
```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 7. Instalar SQL Server
```bash
# Agregar repositorio de Microsoft SQL Server
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo add-apt-repository "$(wget -qO- https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2019.list)"

# Instalar SQL Server
sudo apt update
sudo apt install -y mssql-server

# Configurar SQL Server
sudo /opt/mssql/bin/mssql-conf setup
```

### 8. Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 9. Configurar Firewall
```bash
# Instalar UFW
sudo apt install -y ufw

# Configurar reglas básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 1433/tcp  # SQL Server
sudo ufw enable
```

---

## 🗄️ CONFIGURACIÓN DE BASE DE DATOS

### 1. Crear Base de Datos
```sql
-- Conectar a SQL Server
sqlcmd -S localhost -U sa -P 'TuPasswordSegura'

-- Crear base de datos
CREATE DATABASE DrCellDB;
GO

-- Crear usuario para la aplicación
CREATE LOGIN drcell_user WITH PASSWORD = 'TuPasswordDeAplicacion';
GO

USE DrCellDB;
GO

CREATE USER drcell_user FOR LOGIN drcell_user;
GO

-- Asignar permisos
ALTER ROLE db_owner ADD MEMBER drcell_user;
GO
```

### 2. Ejecutar Script de Base de Datos
```bash
# Desde el directorio del proyecto
sqlcmd -S localhost -U drcell_user -P 'TuPasswordDeAplicacion' -d DrCellDB -i BD/DrCell3.sql
```

---

## 📦 INSTALACIÓN DEL SISTEMA

### 1. Clonar Repositorio
```bash
# Cambiar al directorio del usuario
cd /home/drcell

# Clonar el repositorio
git clone https://github.com/tu-usuario/drcell-v01.git
cd drcell-v01
```

### 2. Configurar Permisos
```bash
# Cambiar propietario
sudo chown -R drcell:drcell /home/drcell/drcell-v01

# Establecer permisos
chmod +x set-production-env.ps1
chmod +x set-production-env.bat
```

---

## 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO

### 1. Configurar Variables del Sistema
```bash
# Crear archivo de variables de entorno
sudo nano /etc/environment

# Agregar las siguientes variables:
ASPNETCORE_ENVIRONMENT=Production
DRCELL_DB_CONNECTION="Server=localhost;Database=DrCellDB;User Id=drcell_user;Password=TuPasswordDeAplicacion;TrustServerCertificate=true;"
DRCELL_JWT_SECRET="TuSecretoJWTSuperSeguroDeAlMenos64Caracteres123456789012345678901234567890"
DRCELL_JWT_ISSUER="https://tu-dominio.com"
DRCELL_JWT_AUDIENCE="https://tu-dominio.com"
DRCELL_CORS_ORIGINS="https://tu-dominio.com"
```

### 2. Recargar Variables
```bash
source /etc/environment
```

### 3. Crear Archivo de Configuración de Producción
```bash
# Crear appsettings.Production.json
cat > appsettings.Production.json << 'EOF'
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DrCellDB;User Id=drcell_user;Password=TuPasswordDeAplicacion;TrustServerCertificate=true;"
  },
  "JwtSettings": {
    "SecretKey": "TuSecretoJWTSuperSeguroDeAlMenos64Caracteres123456789012345678901234567890",
    "Issuer": "https://tu-dominio.com",
    "Audience": "https://tu-dominio.com",
    "ExpiryMinutes": 720
  },
  "CorsSettings": {
    "AllowedOrigins": ["https://tu-dominio.com"]
  }
}
EOF
```

---

## 🔨 CONSTRUCCIÓN Y DESPLIEGUE

### 1. Construir Frontend
```bash
# Cambiar al directorio del frontend
cd Front

# Instalar dependencias
npm install

# Construir para producción
npm run build

# Volver al directorio raíz
cd ..
```

### 2. Construir Backend
```bash
# Restaurar paquetes NuGet
dotnet restore

# Construir en modo Release
dotnet build -c Release

# Ejecutar migraciones
dotnet ef database update --environment Production
```

### 3. Publicar Aplicación
```bash
# Publicar aplicación
dotnet publish -c Release -o /home/drcell/app

# Copiar archivos del frontend
cp -r Front/dist/* /home/drcell/app/wwwroot/
```

---

## 🌐 CONFIGURACIÓN DEL SERVIDOR WEB

### 1. Configurar Nginx
```bash
# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/drcell

# Agregar la siguiente configuración:
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Configuración para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @backend;
    }

    location @backend {
        proxy_pass http://localhost:5000;
    }
}
```

### 2. Habilitar Sitio
```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/drcell /etc/nginx/sites-enabled/

# Eliminar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl reload nginx
```

---

## 🔒 CONFIGURACIÓN DE SSL

### 1. Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtener Certificado SSL
```bash
# Obtener certificado para el dominio
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar línea:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 CONFIGURACIÓN DEL SERVICIO SYSTEMD

### 1. Crear Servicio
```bash
sudo nano /etc/systemd/system/drcell.service

# Agregar configuración:
[Unit]
Description=DrCell V01 ASP.NET Core Application
After=network.target

[Service]
Type=notify
User=drcell
Group=drcell
WorkingDirectory=/home/drcell/app
ExecStart=/usr/bin/dotnet /home/drcell/app/DrCell-V01.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=drcell-v01
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

### 2. Habilitar y Iniciar Servicio
```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar servicio
sudo systemctl enable drcell

# Iniciar servicio
sudo systemctl start drcell

# Verificar estado
sudo systemctl status drcell
```

---

## ✅ VERIFICACIÓN DEL SISTEMA

### 1. Verificar Servicios
```bash
# Verificar .NET Application
sudo systemctl status drcell

# Verificar Nginx
sudo systemctl status nginx

# Verificar SQL Server
sudo systemctl status mssql-server
```

### 2. Verificar Conectividad
```bash
# Probar conexión local
curl -I http://localhost:5000

# Probar conexión HTTPS
curl -I https://tu-dominio.com
```

### 3. Verificar Logs
```bash
# Logs de la aplicación
sudo journalctl -u drcell -f

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 4. Verificar Base de Datos
```bash
# Conectar a SQL Server
sqlcmd -S localhost -U drcell_user -P 'TuPasswordDeAplicacion' -d DrCellDB

# Verificar tablas
SELECT name FROM sys.tables;
GO
```

---

## 📊 MANTENIMIENTO Y MONITOREO

### 1. Scripts de Mantenimiento
```bash
# Crear script de backup
sudo nano /home/drcell/backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
sqlcmd -S localhost -U drcell_user -P 'TuPasswordDeAplicacion' -Q "BACKUP DATABASE DrCellDB TO DISK = '/home/drcell/backups/DrCellDB_$DATE.bak'"
```

### 2. Monitoreo de Recursos
```bash
# Instalar htop para monitoreo
sudo apt install -y htop

# Monitorear uso de CPU y memoria
htop

# Monitorear espacio en disco
df -h

# Monitorear logs en tiempo real
sudo journalctl -u drcell -f
```

### 3. Actualización del Sistema
```bash
# Crear script de actualización
sudo nano /home/drcell/update.sh

#!/bin/bash
cd /home/drcell/drcell-v01
git pull origin main
cd Front
npm install
npm run build
cd ..
dotnet build -c Release
dotnet publish -c Release -o /home/drcell/app
cp -r Front/dist/* /home/drcell/app/wwwroot/
sudo systemctl restart drcell
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Problemas Comunes

1. **Aplicación no inicia**
   ```bash
   # Verificar logs
   sudo journalctl -u drcell -n 50
   
   # Verificar variables de entorno
   sudo -u drcell env | grep -i drcell
   ```

2. **Error de conexión a base de datos**
   ```bash
   # Verificar SQL Server
   sudo systemctl status mssql-server
   
   # Probar conexión
   sqlcmd -S localhost -U drcell_user -P 'TuPasswordDeAplicacion'
   ```

3. **Error 502 Bad Gateway**
   ```bash
   # Verificar aplicación
   curl -I http://localhost:5000
   
   # Verificar configuración de Nginx
   sudo nginx -t
   ```

4. **Problema de permisos**
   ```bash
   # Corregir permisos
   sudo chown -R drcell:drcell /home/drcell/app
   chmod +x /home/drcell/app/DrCell-V01.dll
   ```

---

## 📞 CONTACTO Y SOPORTE

- **Sistema**: DrCell V01
- **Versión**: 1.0.0
- **Entorno**: Producción
- **Documentación**: Este archivo

**Importante**: Mantén siempre backups regulares y monitorea los logs del sistema regularmente.

---

## 🔄 ACTUALIZACIONES FUTURAS

Para futuras actualizaciones del sistema:

1. Crear backup completo
2. Ejecutar script de actualización
3. Verificar funcionamiento
4. Rollback si es necesario

**¡Sistema DrCell V01 listo para producción!** 🚀 