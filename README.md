# PILI Chatbot System

Sistema de asistente inteligente para TESLA Electricidad y Automatización S.A.C.

## Características

- ✅ Máquina de estados conversacional (8 estados)
- ✅ Memoria persistente con Vercel KV (Redis)
- ✅ Reconocimiento de clientes recurrentes
- ✅ Calificación automática de leads
- ✅ Generación de notificaciones WhatsApp
- ✅ Arquitectura serverless (Vercel)
- ✅ Sin dependencia de APIs de IA externas

## Arquitectura

```
Frontend (HTML/CSS/JS)
    ↓
Vercel Serverless API (/api/chat.js)
    ↓
PILI Brain (State Machine)
    ↓
Vercel KV (Redis Memory)
```

## Estados de Conversación

1. **INICIO** - Mensaje de bienvenida
2. **TIPO_PROYECTO** - Captura tipo (Residencial/Comercial/Industrial)
3. **SISTEMAS** - Captura sistemas requeridos
4. **UBICACION** - Captura ciudad del proyecto
5. **DATOS_CLIENTE** - Captura nombre y WhatsApp
6. **AGENDA** - Confirma contacto
7. **LEAD_CALIFICADO** - Lead registrado
8. **ATENCION_HUMANA** - Bloqueado hasta asesor

## Instalación Local

```bash
# Instalar dependencias
npm install

# Configurar Vercel KV
vercel link

# Ejecutar en desarrollo
vercel dev
```

## Deployment

```bash
# Deploy a producción
vercel --prod
```

## Configuración de Vercel KV

1. Ir a proyecto en Vercel Dashboard
2. Storage → Create Database → KV
3. Conectar database al proyecto
4. Variables de entorno se configuran automáticamente

## Estructura de Archivos

```
tesla-landing/
├── api/
│   └── chat.js              # Endpoint principal
├── lib/
│   ├── pili-brain.js        # Lógica de estados
│   ├── pili-memory.js       # Operaciones de BD
│   └── whatsapp-notifier.js # Generador de notificaciones
├── assets/
│   └── pili_avatar.png      # Avatar de PILI
├── index.html               # Landing page
├── main.js                  # Frontend integration
├── styles.css               # Estilos
├── package.json             # Dependencias
└── vercel.json              # Configuración Vercel
```

## Personalidad de PILI

- **Profesional** - Tono corporativo y técnico
- **Clara** - Mensajes directos y ordenados
- **Segura** - Transmite confianza
- **Nunca improvisa** - Sigue estados definidos
- **No da precios** - Solo coordina evaluaciones

## Datos Corporativos

**TESLA Electricidad y Automatización S.A.C.**
- Dirección: Urb. Los Jardines de San Carlos, Calle Los Narcisos MZ H Lote 04, Huancayo – Junín – Perú
- WhatsApp: 906 315 961

## Escalabilidad

El sistema está diseñado para integrar IA (ChatGPT/Gemini) en Fase 2 sin reescribir la arquitectura:

- Estados se mantienen
- Memoria se conserva
- Solo se reemplaza el motor de respuestas

## Licencia

Privado - TESLA Electricidad y Automatización S.A.C.
