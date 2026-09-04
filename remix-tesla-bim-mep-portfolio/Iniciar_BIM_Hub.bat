@echo off
title TESLA BIM Hub - Conversor + Visor 3D
echo ============================================
echo  TESLA BIM Hub - Conversor MEP + Visor 3D
echo ============================================
echo.

echo [1/3] Comprobando Python (conversor DWG/IFC/PDF)...
where python >nul 2>nul
if %errorlevel% neq 0 (
  echo   No se encontro Python en el PATH. Solo funcionaran DXF/GLB.
  echo   Instala Python desde https://www.python.org/downloads/ y marca "Add to PATH".
) else (
  echo   Python OK. Abriendo conversor local en una ventana nueva...
  start "TESLA Conversor" cmd /k "cd /d %~dp0python && python server.py"
)

echo.
echo [2/3] Instalando dependencias si faltan...
if not exist node_modules (
  call npm install
)

echo.
echo [3/3] Arrancando el visor web en http://localhost:3000 ...
start "" http://localhost:3000
call npm run dev

pause
