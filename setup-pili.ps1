# PILI Development Environment Setup Script
# Run this once to set up everything

Write-Host "🚀 Configurando entorno de desarrollo PILI..." -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "`n📦 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Install npm dependencies
Write-Host "`n📦 Instalando dependencias de Node.js..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed globally
Write-Host "`n📦 Verificando Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI instalado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI instalado" -ForegroundColor Green
}

Write-Host "`n✅ ¡Entorno configurado correctamente!" -ForegroundColor Green
Write-Host "`n📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Ejecuta: .\start-pili.ps1" -ForegroundColor White
Write-Host "2. Abre el navegador en http://localhost:3000" -ForegroundColor White
Write-Host "3. Prueba PILI haciendo click en el botón flotante" -ForegroundColor White
