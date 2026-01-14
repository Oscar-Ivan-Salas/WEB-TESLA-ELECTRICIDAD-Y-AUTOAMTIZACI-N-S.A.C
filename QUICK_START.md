# 🚀 Inicio Rápido - PILI

## Opción 1: Usando PowerShell (Recomendado)

### Primera vez - Configurar entorno:
```powershell
cd e:\TESLA_LANDIG_PAGE\tesla-landing
.\setup-pili.ps1
```

### Iniciar servidor de desarrollo:
```powershell
.\start-pili.ps1
```

## Opción 2: Usando archivo .bat

Doble click en:
```
start-pili.bat
```

## Opción 3: Comando manual

```powershell
npm install
vercel dev
```

---

## 🌐 Acceder a PILI

Una vez iniciado el servidor:

1. Abre el navegador en: `http://localhost:3000`
2. Click en el botón flotante dorado (esquina inferior derecha)
3. ¡Conversa con PILI!

---

## ⚠️ Nota Importante

**PILI necesita Vercel KV para funcionar completamente.**

Sin Vercel KV, PILI funcionará pero NO guardará memoria entre sesiones.

### Para habilitar memoria completa:

1. Ejecuta: `vercel link`
2. Crea Vercel KV database en el dashboard
3. Reinicia el servidor

---

## 🔧 Troubleshooting

### Error: "vercel: command not found"

Instala Vercel CLI:
```powershell
npm install -g vercel
```

### Error: "Cannot find module '@vercel/kv'"

Instala dependencias:
```powershell
npm install
```

### Puerto 3000 ocupado

Usa otro puerto:
```powershell
vercel dev --listen 3001
```

---

## 📝 Scripts Disponibles

- `setup-pili.ps1` - Configuración inicial (solo una vez)
- `start-pili.ps1` - Iniciar servidor de desarrollo
- `start-pili.bat` - Iniciar servidor (alternativa)

¡Listo para probar PILI! 🎉
