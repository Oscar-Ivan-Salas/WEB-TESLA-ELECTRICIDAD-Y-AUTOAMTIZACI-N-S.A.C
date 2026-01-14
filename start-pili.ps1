# PILI Development Server Startup Script
# Run this to start the development server

Write-Host "🚀 Iniciando servidor de desarrollo PILI..." -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dependencias no instaladas. Ejecutando setup..." -ForegroundColor Yellow
    .\setup-pili.ps1
}

Write-Host "`n🌐 Iniciando servidor local..." -ForegroundColor Yellow
Write-Host "📍 URL: http://localhost:3000" -ForegroundColor Green
Write-Host "💬 PILI estará disponible en el botón flotante (esquina inferior derecha)" -ForegroundColor Green
Write-Host "`n⏹️  Presiona Ctrl+C para detener el servidor`n" -ForegroundColor Yellow

# Start Vercel dev server
vercel dev --listen 3000
