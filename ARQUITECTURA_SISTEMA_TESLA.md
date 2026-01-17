# Arquitectura del Sistema - TESLA Landing Page

> **Documento Técnico Maestro**  
> Versión: 1.0  
> Fecha: Enero 2026  
> Autor: Equipo Técnico TESLA

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Componentes Principales](#componentes-principales)
5. [Flujo de Datos](#flujo-de-datos)
6. [Infraestructura y Deployment](#infraestructura-y-deployment)
7. [Integraciones Externas](#integraciones-externas)
8. [Decisiones Arquitectónicas](#decisiones-arquitectónicas)

---

## 🎯 Visión General

### Propósito del Sistema

TESLA Landing Page es una aplicación web profesional diseñada para:

- **Captar leads calificados** para servicios de electricidad y automatización
- **Automatizar la calificación inicial** de clientes potenciales mediante IA conversacional
- **Facilitar el contacto directo** con el equipo de ventas vía WhatsApp
- **Presentar la propuesta de valor** de TESLA de manera visual y atractiva

### Características Principales

✅ **Landing page premium** con diseño moderno y animaciones  
✅ **Chatbot conversacional inteligente** (PILi) con máquina de estados  
✅ **Sistema de calificación de leads** automatizado  
✅ **Integración directa con WhatsApp** para conversión  
✅ **Arquitectura serverless** escalable y de bajo costo  
✅ **Persistencia de sesiones** con Vercel KV (Redis)  
✅ **Responsive design** optimizado para móviles y desktop

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **HTML5** | - | Estructura semántica de la página |
| **CSS3** | - | Estilos personalizados y animaciones |
| **JavaScript (ES6+)** | - | Lógica de interacción y comunicación con backend |
| **Tailwind CSS** | 3.x (CDN) | Framework CSS para componentes del chatbot |
| **Font Awesome** | 6.4.0 | Iconografía |
| **Google Fonts (Inter)** | - | Tipografía profesional |
| **html2canvas** | 1.4.1 | Generación de imágenes de tarjetas de solución |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | >=18.0.0 | Runtime de JavaScript |
| **Vercel Serverless Functions** | - | API endpoints sin servidor |
| **Vercel KV** | 3.0.0 | Base de datos Redis para sesiones |
| **Express.js** | 4.18.2 | Servidor local de desarrollo |

### Herramientas de Desarrollo

- **Vercel CLI** - Deployment y desarrollo local
- **Git** - Control de versiones
- **npm** - Gestión de dependencias

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIO FINAL                          │
│                    (Navegador Web)                          │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTPS
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL CDN / EDGE                        │
│                  (Distribución Global)                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────────┬──────────────────────────────┐
             │                  │                              │
             ▼                  ▼                              ▼
    ┌────────────────┐  ┌──────────────┐          ┌──────────────────┐
    │   FRONTEND     │  │   BACKEND    │          │   PERSISTENCIA   │
    │                │  │              │          │                  │
    │  index.html    │  │  /api/chat   │◄────────►│   Vercel KV      │
    │  styles.css    │  │              │          │   (Redis)        │
    │  main.js       │  │  pili-brain  │          │                  │
    │  assets/       │  │  pili-memory │          │  - Sesiones      │
    └────────┬───────┘  └──────┬───────┘          │  - Historial     │
             │                 │                  │  - Leads         │
             │                 │                  └──────────────────┘
             │                 │
             │                 ▼
             │        ┌──────────────────┐
             │        │  WHATSAPP API    │
             └───────►│  (wa.me/...)     │
                      │                  │
                      │  - Notificaciones│
                      │  - Conversión    │
                      └──────────────────┘
```

### Arquitectura de Capas

#### 1. **Capa de Presentación** (Frontend)
- Renderizado de UI
- Manejo de eventos de usuario
- Comunicación con API
- Gestión de estado local (sessionId)

#### 2. **Capa de Lógica de Negocio** (Backend)
- Máquina de estados conversacional (PILi Brain)
- Validación de entradas
- Calificación de leads
- Generación de notificaciones

#### 3. **Capa de Datos** (Vercel KV)
- Persistencia de sesiones
- Almacenamiento de leads
- Historial de conversaciones

#### 4. **Capa de Integración** (WhatsApp)
- Enlaces de contacto directo
- Notificaciones a equipo de ventas

---

## 🧩 Componentes Principales

### 1. Frontend Components

#### **index.html** - Landing Page Principal
```
Secciones:
├── Header (Navegación fija)
├── Hero (Propuesta de valor principal)
├── El Modelo TESLA (4 pilares)
│   ├── Ingeniería
│   ├── Suministro
│   ├── Ejecución
│   └── Integración
├── Servicios (6 servicios principales)
│   ├── Electricidad
│   ├── Automatización
│   ├── Contra Incendios
│   ├── Seguridad
│   ├── Acabados Técnicos
│   └── Solución Integral
├── Experiencia (Proyectos y testimonios)
├── Footer (Información corporativa)
└── Chat Sidebar (PILi Chatbot)
```

#### **styles.css** - Sistema de Diseño
```css
Variables CSS:
├── Colores de marca (TESLA Red, Gold)
├── Fondos dinámicos (gradientes animados)
├── Tipografía (Inter font family)
├── Espaciado y grid system
└── Animaciones personalizadas
```

#### **main.js** - Lógica Frontend
```javascript
Funciones principales:
├── getSessionId() - Gestión de sesión
├── sendMessageToPILI() - Comunicación con API
├── displayMessage() - Renderizado de mensajes
├── displayOptions() - Botones de opciones
├── displaySolutionCard() - Tarjetas visuales
├── displayDateTimePicker() - Selector de fecha
└── toggleChat() - Control de sidebar
```

### 2. Backend Components

#### **/api/chat.js** - Endpoint Principal
```javascript
Responsabilidades:
├── Recibir mensajes del frontend
├── Gestionar sesiones en memoria
├── Procesar mensajes según estado
├── Validar opciones de usuario
├── Generar enlaces de WhatsApp
└── Retornar respuestas estructuradas
```

**Estructura de Request:**
```json
{
  "message": "Hola",
  "sessionId": "session_1234567890_abc123"
}
```

**Estructura de Response:**
```json
{
  "message": "¡Hola! Soy PILi...",
  "nextState": "ASK_PROJECT_TYPE",
  "options": ["🏗️ Obra en ejecución", "🏢 Proyecto nuevo"],
  "whatsappLink": "https://wa.me/51906315961?text=..."
}
```

#### **lib/pili-brain.js** - Máquina de Estados
```javascript
Estados del Chatbot:
├── START - Bienvenida inicial
├── ASK_PROJECT_TYPE - Tipo de proyecto
├── ASK_STAGE - Etapa del proyecto
├── ASK_NEED - Necesidad principal
├── ASK_NAME - Nombre del cliente
├── ASK_PHONE - WhatsApp de contacto
├── ASK_LOCATION - Ubicación del proyecto
├── ASK_APPOINTMENT - Preferencia de contacto
├── CONFIRM - Confirmación final
└── END - Fin de conversación
```

#### **lib/whatsapp-notifier.js** - Generador de Enlaces
```javascript
Funciones:
├── generateWhatsAppLink() - Enlace con datos del lead
└── Formateo de mensaje con emojis compatibles
```

### 3. Persistencia de Datos

#### **Vercel KV (Redis)**
```
Estructura de datos:
├── sessions:{sessionId} - Datos de sesión
│   ├── estado: string
│   ├── tipo_proyecto: string
│   ├── etapa: string
│   ├── necesidad: string
│   ├── nombre: string
│   ├── telefono: string
│   ├── ubicacion: string
│   └── cita: string
└── TTL: 24 horas
```

---

## 🔄 Flujo de Datos

### Flujo de Conversación Completo

```
1. Usuario abre chat
   │
   ├─► Frontend: toggleChat()
   │
   ├─► Frontend: initializePILI()
   │
   ├─► POST /api/chat { message: "Hola", sessionId: "..." }
   │
   ├─► Backend: processMessage(session, "Hola")
   │
   ├─► Backend: Estado = START → ASK_PROJECT_TYPE
   │
   ├─► Response: { message: "...", options: [...] }
   │
   └─► Frontend: displayMessage() + displayOptions()

2. Usuario selecciona opción
   │
   ├─► Frontend: handleOptionClick("🏗️ Obra en ejecución")
   │
   ├─► POST /api/chat { message: "🏗️ Obra en ejecución", sessionId: "..." }
   │
   ├─► Backend: Valida opción
   │
   ├─► Backend: session.tipo_proyecto = "🏗️ Obra en ejecución"
   │
   ├─► Backend: Estado = ASK_PROJECT_TYPE → ASK_STAGE
   │
   └─► Response: { message: "...", options: [...] }

3. ... (continúa hasta END)

4. Estado = END
   │
   ├─► Backend: generateWhatsAppLink(session)
   │
   ├─► Response: { message: "...", whatsappLink: "https://wa.me/..." }
   │
   └─► Frontend: displayWhatsAppButton(link)
```

### Flujo de Datos - Generación de Lead

```
Usuario completa conversación
        │
        ▼
Backend recopila:
  - tipo_proyecto
  - etapa
  - necesidad
  - nombre
  - telefono
  - ubicacion
  - cita
        │
        ▼
generateWhatsAppLink()
        │
        ▼
Mensaje formateado:
"🔔 *SOLICITUD PILi V4* 🔔
👤 *Cliente:* Juan Pérez
📱 *WhatsApp:* 906315961
..."
        │
        ▼
URL: https://wa.me/51906315961?text=...
        │
        ▼
Usuario hace clic → WhatsApp se abre
        │
        ▼
Equipo de ventas recibe notificación
```

---

## 🚀 Infraestructura y Deployment

### Vercel Platform

#### **Configuración** (`vercel.json`)
```json
{
  "buildCommand": "echo 'No build needed'",
  "outputDirectory": ".",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/styles.css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

#### **Características de Vercel**

✅ **Edge Network Global** - Baja latencia en todo el mundo  
✅ **Serverless Functions** - Escalado automático  
✅ **Zero Configuration** - Deploy con `git push`  
✅ **HTTPS Automático** - Certificados SSL incluidos  
✅ **Preview Deployments** - URL única por cada commit  
✅ **Analytics** - Métricas de rendimiento

### Ambientes

| Ambiente | URL | Propósito |
|----------|-----|-----------|
| **Producción** | https://tesla-landing-self.vercel.app | Sitio público |
| **Preview** | https://tesla-landing-*.vercel.app | Testing de branches |
| **Local** | http://localhost:3000 | Desarrollo local |

### Proceso de Deployment

```bash
# 1. Desarrollo local
npm start  # Servidor Express local

# 2. Testing con Vercel Dev
vercel dev  # Simula ambiente de producción

# 3. Deploy a producción
git push origin main  # Auto-deploy en Vercel

# O manual:
vercel --prod
```

---

## 🔗 Integraciones Externas

### 1. WhatsApp Business API (Informal)

**Método:** Enlaces `wa.me`  
**Propósito:** Conversión directa de leads

```javascript
// Formato de enlace
https://wa.me/51906315961?text=<mensaje_codificado>

// Ventajas:
✅ No requiere API key
✅ Funciona en cualquier dispositivo
✅ Abre WhatsApp nativo
✅ Mensaje pre-rellenado
```

### 2. Vercel KV (Redis)

**Propósito:** Persistencia de sesiones y leads

```javascript
import { kv } from '@vercel/kv';

// Guardar sesión
await kv.set(`session:${sessionId}`, sessionData, { ex: 86400 });

// Recuperar sesión
const session = await kv.get(`session:${sessionId}`);
```

**Configuración:**
- Creado desde Vercel Dashboard
- Variables de entorno automáticas
- TTL: 24 horas por defecto

### 3. CDN de Recursos

- **Tailwind CSS:** `https://cdn.tailwindcss.com`
- **Font Awesome:** `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0`
- **Google Fonts:** `fonts.googleapis.com`
- **html2canvas:** `cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1`

---

## 🎯 Decisiones Arquitectónicas

### 1. ¿Por qué Serverless?

**Decisión:** Usar Vercel Serverless Functions en lugar de servidor tradicional

**Razones:**
- ✅ **Costo:** Pay-per-use, sin servidor siempre activo
- ✅ **Escalabilidad:** Auto-scaling sin configuración
- ✅ **Mantenimiento:** Cero mantenimiento de infraestructura
- ✅ **Performance:** Edge network global
- ✅ **Simplicidad:** Deploy con `git push`

**Trade-offs:**
- ⚠️ Cold starts (mitigado con Vercel Edge)
- ⚠️ Límite de ejecución (10s en plan gratuito)

### 2. ¿Por qué Máquina de Estados en lugar de IA?

**Decisión:** Implementar chatbot con máquina de estados determinista

**Razones:**
- ✅ **Predecibilidad:** Respuestas consistentes
- ✅ **Costo:** Sin llamadas a APIs de IA ($0)
- ✅ **Velocidad:** Respuesta instantánea
- ✅ **Control:** Flujo de conversación exacto
- ✅ **Escalabilidad futura:** Fácil integración de IA en Fase 2

**Trade-offs:**
- ⚠️ Menos flexibilidad en conversación
- ⚠️ Requiere definir todos los flujos manualmente

### 3. ¿Por qué Vercel KV (Redis)?

**Decisión:** Usar Redis en lugar de base de datos relacional

**Razones:**
- ✅ **Velocidad:** Acceso en memoria ultra-rápido
- ✅ **Simplicidad:** Key-value store simple
- ✅ **TTL automático:** Limpieza de sesiones antiguas
- ✅ **Integración:** Nativa con Vercel
- ✅ **Costo:** Tier gratuito generoso

**Trade-offs:**
- ⚠️ No es ideal para queries complejas
- ⚠️ Datos volátiles (TTL)

### 4. ¿Por qué Tailwind CSS (CDN)?

**Decisión:** Usar Tailwind vía CDN en lugar de build process

**Razones:**
- ✅ **Simplicidad:** No requiere build step
- ✅ **Velocidad de desarrollo:** Clases utility inmediatas
- ✅ **Tamaño:** Solo para componentes del chatbot
- ✅ **Compatibilidad:** Funciona con CSS personalizado existente

**Trade-offs:**
- ⚠️ Tamaño de archivo mayor (CDN completo)
- ⚠️ No se puede purgar CSS no usado

### 5. ¿Por qué WhatsApp en lugar de Email?

**Decisión:** Usar WhatsApp como canal principal de conversión

**Razones:**
- ✅ **Tasa de apertura:** 98% vs 20% de email
- ✅ **Inmediatez:** Respuesta en tiempo real
- ✅ **Preferencia del mercado:** Perú es país WhatsApp-first
- ✅ **Conversión:** Mayor probabilidad de cierre
- ✅ **Simplicidad:** No requiere formularios complejos

**Trade-offs:**
- ⚠️ Requiere número de teléfono
- ⚠️ Menos formal que email

---

## 📊 Métricas y Monitoreo

### KPIs Técnicos

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| **Tiempo de carga** | < 2s | Vercel Analytics |
| **Uptime** | > 99.9% | Vercel Status |
| **Tasa de error API** | < 0.1% | Vercel Logs |
| **Cold start time** | < 500ms | Vercel Functions |

### KPIs de Negocio

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Tasa de inicio de chat** | > 15% | Google Analytics |
| **Tasa de completación** | > 60% | Vercel KV |
| **Leads generados/día** | > 5 | WhatsApp |
| **Conversión a venta** | > 20% | CRM manual |

---

## 🔐 Seguridad

### Medidas Implementadas

✅ **HTTPS obligatorio** - Certificados SSL automáticos  
✅ **CORS configurado** - Solo dominios autorizados  
✅ **Rate limiting** - Vercel Edge protección DDoS  
✅ **Sanitización de inputs** - Validación en backend  
✅ **Session IDs únicos** - Generados con timestamp + random  
✅ **No almacenamiento de datos sensibles** - Solo lo necesario

### Consideraciones Futuras

- [ ] Implementar CAPTCHA para prevenir spam
- [ ] Agregar autenticación para panel de administración
- [ ] Encriptar datos en Vercel KV
- [ ] Implementar audit logs

---

## 📚 Referencias

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [WhatsApp Click to Chat](https://faq.whatsapp.com/general/chats/how-to-use-click-to-chat)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 📝 Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | Enero 2026 | Documento inicial |

---

**Documento preparado para el equipo de desarrollo**  
**TESLA Electricidad y Automatización S.A.C.**
