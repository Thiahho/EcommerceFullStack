# 🚀 CONFIGURACIÓN PARA PRODUCCIÓN - DRCELL

## Variables de Entorno Requeridas

### 1. **Entorno Principal**
```bash
ASPNETCORE_ENVIRONMENT=Production
```

### 2. **Base de Datos**
```bash
DATABASE_CONNECTION_STRING="Host=tu-servidor-produccion;Port=5432;Database=DrCell;Username=tu-usuario;Password=tu-password-seguro"
```

### 3. **JWT Configuration**
```bash
JWT_SECRET="DrCell_Production_SuperSecretKey_2024_MinLength_32_Characters_!@#$%^&*()"
JWT_ISSUER="https://api.drcell.com"
JWT_AUDIENCE="https://drcell.com"
```

### 4. **CORS Configuration**
```bash
CORS_ORIGINS="https://drcell.com,https://www.drcell.com"
```

## 📋 Métodos de Configuración

### **A. Variables del Sistema (Linux/Mac)**
```bash
export ASPNETCORE_ENVIRONMENT=Production
export DATABASE_CONNECTION_STRING="Host=tu-servidor;Port=5432;Database=DrCell;Username=tu-usuario;Password=tu-password"
export JWT_SECRET="DrCell_Production_SuperSecretKey_2024_MinLength_32_Characters"
export JWT_ISSUER="https://api.drcell.com"
export JWT_AUDIENCE="https://drcell.com"
export CORS_ORIGINS="https://drcell.com,https://www.drcell.com"
```

### **B. Variables del Sistema (Windows PowerShell)**
```powershell
$env:ASPNETCORE_ENVIRONMENT="Production"
$env:DATABASE_CONNECTION_STRING="Host=tu-servidor;Port=5432;Database=DrCell;Username=tu-usuario;Password=tu-password"
$env:JWT_SECRET="DrCell_Production_SuperSecretKey_2024_MinLength_32_Characters"
$env:JWT_ISSUER="https://api.drcell.com"
$env:JWT_AUDIENCE="https://drcell.com"
$env:CORS_ORIGINS="https://drcell.com,https://www.drcell.com"
```

### **C. Archivo .env (Para Docker)**
```bash
# .env.production
ASPNETCORE_ENVIRONMENT=Production
DATABASE_CONNECTION_STRING=Host=tu-servidor-produccion;Port=5432;Database=DrCell;Username=tu-usuario;Password=tu-password-seguro
JWT_SECRET=DrCell_Production_SuperSecretKey_2024_MinLength_32_Characters_!@#$%^&*()
JWT_ISSUER=https://api.drcell.com
JWT_AUDIENCE=https://drcell.com
CORS_ORIGINS=https://drcell.com,https://www.drcell.com
```

### **D. Docker Compose**
```yaml
version: '3.8'
services:
  drcell-api:
    image: drcell:latest
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - DATABASE_CONNECTION_STRING=Host=postgres;Port=5432;Database=DrCell;Username=drcell;Password=secure_password
      - JWT_SECRET=DrCell_Production_SuperSecretKey_2024_MinLength_32_Characters
      - JWT_ISSUER=https://api.drcell.com
      - JWT_AUDIENCE=https://drcell.com
      - CORS_ORIGINS=https://drcell.com,https://www.drcell.com
    ports:
      - "80:8080"
      - "443:8443"
```

## 🔒 Validaciones Automáticas

Tu sistema ya incluye validaciones automáticas que verifican:

✅ **DATABASE_CONNECTION_STRING** - Requerida en producción
✅ **JWT_SECRET** - Mínimo 32 caracteres
✅ **JWT_ISSUER** - URL del emisor
✅ **JWT_AUDIENCE** - URL de la audiencia
✅ **CORS_ORIGINS** - Orígenes permitidos

## 🚨 Checklist de Producción

- [ ] Configurar `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Establecer todas las variables de entorno
- [ ] Configurar base de datos de producción
- [ ] Configurar dominio real en CORS
- [ ] Configurar certificados SSL
- [ ] Configurar logs de producción
- [ ] Realizar pruebas de carga
- [ ] Configurar monitoreo

## 🎯 Comandos de Verificación

```bash
# Verificar variables de entorno
echo $ASPNETCORE_ENVIRONMENT
echo $DATABASE_CONNECTION_STRING
echo $JWT_SECRET
echo $CORS_ORIGINS

# Ejecutar aplicación
dotnet run --configuration Release
```

## 🔧 Troubleshooting

Si obtienes errores al iniciar:

1. **Error de conexión BD**: Verifica `DATABASE_CONNECTION_STRING`
2. **Error JWT**: Verifica `JWT_SECRET` (mínimo 32 caracteres)
3. **Error CORS**: Verifica `CORS_ORIGINS` con URLs válidas
4. **Error SSL**: Configura certificados para HTTPS

## 📱 URLs de Producción

- **API**: `https://api.drcell.com`
- **Frontend**: `https://drcell.com`
- **Swagger**: `https://api.drcell.com/swagger` (solo si está habilitado) 