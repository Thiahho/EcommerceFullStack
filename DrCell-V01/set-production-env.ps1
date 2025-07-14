# 🚀 SCRIPT DE CONFIGURACIÓN PARA PRODUCCIÓN - DRCELL
# Ejecutar en PowerShell como Administrador

Write-Host "🔧 Configurando variables de entorno para PRODUCCIÓN..." -ForegroundColor Green

# CONFIGURACIÓN PRINCIPAL
$env:ASPNETCORE_ENVIRONMENT="Production"
Write-Host "✅ ASPNETCORE_ENVIRONMENT = Production" -ForegroundColor Yellow

# CONFIGURACIÓN DE BASE DE DATOS
# ⚠️ CAMBIAR ESTOS VALORES POR TUS DATOS REALES
$env:DATABASE_CONNECTION_STRING="Host=localhost;Port=5432;Database=DrCell;Username=postgres;Password=TU_PASSWORD_AQUI"
Write-Host "✅ DATABASE_CONNECTION_STRING configurada" -ForegroundColor Yellow

# CONFIGURACIÓN JWT
$env:JWT_SECRET="DrCell_Production_SuperSecretKey_2024_MinLength_32_Characters_!@#$%^&*()"
$env:JWT_ISSUER="https://api.drcell.com"
$env:JWT_AUDIENCE="https://drcell.com"
Write-Host "✅ JWT configurado" -ForegroundColor Yellow

# CONFIGURACIÓN CORS
$env:CORS_ORIGINS="https://drcell.com,https://www.drcell.com"
Write-Host "✅ CORS configurado" -ForegroundColor Yellow

Write-Host ""
Write-Host "🎯 VERIFICACIÓN DE VARIABLES:" -ForegroundColor Cyan
Write-Host "Entorno: $env:ASPNETCORE_ENVIRONMENT" -ForegroundColor White
Write-Host "Base de Datos: $(if($env:DATABASE_CONNECTION_STRING) { '✅ Configurada' } else { '❌ No configurada' })" -ForegroundColor White
Write-Host "JWT Secret: $(if($env:JWT_SECRET) { '✅ Configurado' } else { '❌ No configurado' })" -ForegroundColor White
Write-Host "CORS Origins: $env:CORS_ORIGINS" -ForegroundColor White

Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Red
Write-Host "1. Cambiar la contraseña de la base de datos en DATABASE_CONNECTION_STRING" -ForegroundColor Yellow
Write-Host "2. Configurar tu servidor de base de datos real" -ForegroundColor Yellow
Write-Host "3. Cambiar las URLs de dominio por las tuyas reales" -ForegroundColor Yellow

Write-Host ""
Write-Host "🚀 Para ejecutar la aplicación:" -ForegroundColor Green
Write-Host "dotnet run --configuration Release" -ForegroundColor White

Write-Host ""
Write-Host "✅ Configuración completada! El sistema está listo para producción." -ForegroundColor Green 