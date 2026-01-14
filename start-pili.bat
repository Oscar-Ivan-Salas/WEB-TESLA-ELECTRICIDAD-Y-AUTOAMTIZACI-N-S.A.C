@echo off
echo ========================================
echo   PILI - Servidor de Desarrollo
echo ========================================
echo.
echo Iniciando servidor local...
echo URL: http://localhost:3001
echo.
echo Presiona Ctrl+C para detener
echo.

vercel dev --listen 3001
