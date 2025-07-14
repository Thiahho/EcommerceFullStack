@echo off
REM 🚀 SCRIPT DE CONFIGURACIÓN PARA PRODUCCIÓN - DRCELL
REM Ejecutar como Administrador

echo 🔧 Configurando variables de entorno para PRODUCCIÓN...

REM CONFIGURACIÓN PRINCIPAL
set ASPNETCORE_ENVIRONMENT=Production
echo ✅ ASPNETCORE_ENVIRONMENT = Production

REM CONFIGURACIÓN DE BASE DE DATOS
REM ⚠️ CAMBIAR ESTOS VALORES POR TUS DATOS REALES
set DATABASE_CONNECTION_STRING=Host=localhost;Port=5432;Database=DrCell;Username=postgres;Password=TU_PASSWORD_AQUI
echo ✅ DATABASE_CONNECTION_STRING configurada

REM CONFIGURACIÓN JWT
set JWT_SECRET=DrCell_Production_SuperSecretKey_2024_MinLength_32_Characters_!@#$%^&*()
set JWT_ISSUER=https://api.drcell.com
set JWT_AUDIENCE=https://drcell.com
echo ✅ JWT configurado

REM CONFIGURACIÓN CORS
set CORS_ORIGINS=https://drcell.com,https://www.drcell.com
echo ✅ CORS configurado

echo.
echo 🎯 VERIFICACIÓN DE VARIABLES:
echo Entorno: %ASPNETCORE_ENVIRONMENT%
echo Base de Datos: Configurada
echo JWT Secret: Configurado
echo CORS Origins: %CORS_ORIGINS%

echo.
echo ⚠️  IMPORTANTE:
echo 1. Cambiar la contraseña de la base de datos en DATABASE_CONNECTION_STRING
echo 2. Configurar tu servidor de base de datos real
echo 3. Cambiar las URLs de dominio por las tuyas reales

echo.
echo 🚀 Para ejecutar la aplicación:
echo dotnet run --configuration Release

echo.
echo ✅ Configuración completada! El sistema está listo para producción.
pause 