# 🐳 DESPLIEGUE CON DOCKER - DRCELL V01

## 📋 RESUMEN

Esta guía te ayudará a desplegar DrCell V01 usando Docker Compose en un servidor VPS de producción.

## 🔧 CONFIGURACIÓN PREVIA

### 1. Instalar Docker y Docker Compose
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

### 2. Configurar Variables de Entorno
```bash
# Crear archivo .env en el directorio del proyecto
cat > .env << 'EOF'
# ===== CONFIGURACIÓN DEL ENTORNO =====
ASPNETCORE_ENVIRONMENT=Production

# ===== CONFIGURACIÓN DE BASE DE DATOS =====
DB_SA_PASSWORD=YourStrong!Passw0rd123
DB_PASSWORD=YourStrong!Passw0rd123

# ===== CONFIGURACIÓN JWT =====
JWT_SECRET=YourSuperSecureJWTSecretKeyMustBeAtLeast64Characters1234567890
JWT_ISSUER=https://tu-dominio.com
JWT_AUDIENCE=https://tu-dominio.com

# ===== CONFIGURACIÓN CORS =====
CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
EOF
```

### 3. Configurar SSL (Opcional)
```bash
# Crear directorio para certificados SSL
mkdir -p nginx/ssl

# Copiar certificados SSL
cp tu-certificado.pem nginx/ssl/cert.pem
cp tu-clave-privada.pem nginx/ssl/key.pem

# O generar certificados auto-firmados para pruebas
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=localhost"
```

## 🚀 DESPLIEGUE

### 1. Construir y Ejecutar
```bash
# Construir imágenes
docker-compose build

# Ejecutar en segundo plano
docker-compose up -d

# Verificar estado
docker-compose ps
```

### 2. Inicializar Base de Datos
```bash
# Esperar a que SQL Server esté listo
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong!Passw0rd123' -Q "SELECT 1"

# Crear base de datos y usuario
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong!Passw0rd123' -Q "CREATE DATABASE DrCellDB"
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong!Passw0rd123' -Q "CREATE LOGIN drcell_user WITH PASSWORD = 'YourStrong!Passw0rd123'"
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong!Passw0rd123' -d DrCellDB -Q "CREATE USER drcell_user FOR LOGIN drcell_user"
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong!Passw0rd123' -d DrCellDB -Q "ALTER ROLE db_owner ADD MEMBER drcell_user"

# Ejecutar script de base de datos
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U drcell_user -P 'YourStrong!Passw0rd123' -d DrCellDB -i /docker-entrypoint-initdb.d/DrCell3.sql
```

### 3. Ejecutar Migraciones
```bash
# Ejecutar migraciones de Entity Framework
docker-compose exec drcell-app dotnet ef database update --environment Production
```

## 📊 MONITOREO

### 1. Verificar Estado de Servicios
```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver logs de la aplicación
docker-compose logs -f drcell-app

# Ver logs de la base de datos
docker-compose logs -f db

# Ver logs de nginx
docker-compose logs -f nginx
```

### 2. Health Checks
```bash
# Verificar health check de la aplicación
curl -I http://localhost/health

# Verificar conexión a la base de datos
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U drcell_user -P 'YourStrong!Passw0rd123' -Q "SELECT 1"
```

## 🔧 CONFIGURACIÓN ADICIONAL

### 1. Configurar Firewall
```bash
# Configurar UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 2. Configurar Dominio
```bash
# Actualizar archivo nginx.conf con tu dominio
sed -i 's/server_name _;/server_name tu-dominio.com www.tu-dominio.com;/g' nginx.conf

# Reiniciar nginx
docker-compose restart nginx
```

### 3. Configurar Certificados SSL con Let's Encrypt
```bash
# Instalar certbot
sudo apt install certbot

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com -d www.tu-dominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem nginx/ssl/key.pem

# Reiniciar nginx
docker-compose restart nginx
```

## 🛠️ MANTENIMIENTO

### 1. Backup de Base de Datos
```bash
# Crear backup
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U drcell_user -P 'YourStrong!Passw0rd123' -Q "BACKUP DATABASE DrCellDB TO DISK = '/var/opt/mssql/backup/DrCellDB_$(date +%Y%m%d_%H%M%S).bak'"

# Listar backups
docker-compose exec db ls -la /var/opt/mssql/backup/
```

### 2. Actualización del Sistema
```bash
# Obtener últimos cambios
git pull origin main

# Reconstruir y reiniciar servicios
docker-compose build
docker-compose up -d

# Verificar estado
docker-compose ps
```

### 3. Limpiar Recursos
```bash
# Limpiar imágenes no utilizadas
docker system prune -a

# Limpiar volúmenes no utilizados
docker volume prune
```

## 📋 VARIABLES DE ENTORNO

### Variables Requeridas
```env
# Entorno
ASPNETCORE_ENVIRONMENT=Production

# Base de datos
DB_SA_PASSWORD=YourStrong!Passw0rd123
DB_PASSWORD=YourStrong!Passw0rd123

# JWT
JWT_SECRET=YourSuperSecureJWTSecretKeyMustBeAtLeast64Characters1234567890
JWT_ISSUER=https://tu-dominio.com
JWT_AUDIENCE=https://tu-dominio.com

# CORS
CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

### Variables Opcionales
```env
# SSL
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# Dominio
DOMAIN_NAME=tu-dominio.com
DOMAIN_WWW=www.tu-dominio.com

# Logs
LOG_LEVEL=Information
LOG_FILE_PATH=/app/logs/drcell.log
```

## 🚨 SOLUCIÓN DE PROBLEMAS

### 1. Aplicación no inicia
```bash
# Verificar logs
docker-compose logs drcell-app

# Verificar configuración
docker-compose exec drcell-app env | grep -i drcell

# Reiniciar servicio
docker-compose restart drcell-app
```

### 2. Error de conexión a base de datos
```bash
# Verificar estado de SQL Server
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong!Passw0rd123' -Q "SELECT 1"

# Verificar logs de base de datos
docker-compose logs db

# Reiniciar base de datos
docker-compose restart db
```

### 3. Error 502 Bad Gateway
```bash
# Verificar estado de nginx
docker-compose exec nginx nginx -t

# Verificar logs de nginx
docker-compose logs nginx

# Reiniciar nginx
docker-compose restart nginx
```

## 📈 OPTIMIZACIONES

### 1. Configurar Límites de Recursos
```yaml
# Agregar al docker-compose.yml
services:
  drcell-app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 2. Configurar Logs Rotativos
```yaml
# Configurar logging en docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 3. Configurar Health Checks
```yaml
# Agregar health checks
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🎯 CHECKLIST DE DESPLIEGUE

- [ ] Docker y Docker Compose instalados
- [ ] Variables de entorno configuradas
- [ ] Certificados SSL configurados
- [ ] Dominio apuntando al servidor
- [ ] Firewall configurado
- [ ] Servicios iniciados correctamente
- [ ] Base de datos inicializada
- [ ] Migraciones ejecutadas
- [ ] Health checks funcionando
- [ ] Backups configurados
- [ ] Monitoreo configurado

---

**¡Sistema DrCell V01 desplegado con Docker!** 🐳🚀

Para soporte adicional, consulta [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 