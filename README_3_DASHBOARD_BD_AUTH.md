# 📊 TESLA DASHBOARD + BD + AUTENTICACIÓN — README TÉCNICO #3

**TESLA Electricidad y Automatización S.A.C.**

> Este documento resume todo el trabajo realizado sobre el **Dashboard de administración**, la **base de datos (Supabase)** y la **autenticación (login)**. Complementa el `README.md` (chatbot PILI) y el `README_PILI_CHAT.md`.

---

## 1️⃣ RESUMEN GENERAL

El proyecto consta de tres grandes bloques:

| Módulo | Descripción | Estado |
|---|---|---|
| **Landing** (`index.html`) | Página pública con chatbot PILI y captura de leads | ✅ Funcional |
| **Dashboard** (`dashboard.html`) | Panel admin: KPIs, gráficos, tabla de leads, seguimiento WhatsApp | ✅ Funcional + animado |
| **Login** (`login.html`) | Autenticación contra Supabase Auth | ✅ Funcional |
| **Base de datos** (Supabase) | Tabla `leads` con RLS | ✅ 1,001 registros |

---

## 2️⃣ DASHBOARD DE ADMINISTRACIÓN

Archivo principal: **`dashboard.html`**.

### 2.1 KPIs en tarjetas (resumen)
Seis tarjetas superiores con número grande y barra de progreso:

- **Total Leads** (rojo)
- **Nuevos Hoy** (dorado)
- **Contacto Inicial** (azul)
- **Propuesta Enviada** (púrpura)
- **Negociación** (naranja)
- **Ganados** (verde)

→ Los números se actualizan con **Animación de conteo** (`AnimatedNumber`).
→ Tarjetas **translúcidas** con `backdrop-filter: blur()` y **letras más delgadas**.

### 2.2 Filtros y controles
- **Filtro rápido de tiempo**: Hoy / Esta Semana / Este Mes / Últimos 3 Meses / Todo.
- **Rangos de fecha** personalizados (desde → hasta) para los gráficos.
- **Filtros por estado, etapa, servicio, ciudad, fuente y estado WhatsApp.**.
- Botón **Actualizar** (refresca datos).

### 2.3 Gráficos (Chart.js)
- Embudo de Conversión
- Actividad Reciente
- Distribución por estado/servicio
- Top 5 servicios
- Tendencia de Leads (línea, evolucion time)
- Comparación y Volumen Acumulado
- Descarga de cada gráfico como **PNG**.

### 2.4 Tabla de Leads (DataTables)
- Columnas: nombre, teléfono, servicio, etapa, ubicación, fuente, estado, fecha, WhatsApp.
- Acciones por fila: **📱 WhatsApp** (`https://wa.me/<telefono>`) y **📝 nota**.
- Búsqueda, orden y paginación.

### 2.5 Seguimiento WhatsApp
- Métricas: contactados / que respondieron / citas / convertidos.
- Acciones: marcar como **contactado**, **respondió**, **cita agendada**, **convertido**.
- Vista de detalle de cada lead con todo su historial.

### 2.6 Interactividad extra (React Bits → JS puro)
Se portaron componentes de **React Bits / 21st** a JavaScript plano (el dashboard es HTML + Tailwind CDN + Chart.js):

| Archivo | Componente | Cómo se ve |
|---|---|---|
| `waves.js` | `<Waves />` | Fondo de ondas doradas que reaccionan al cursor |
| `splash-cursor.js` | `<SplashCursor />` | Fluido WebGL que sigue el cursor en lista/rojo |
| `animations.js` | `AnimatedNumber`, `ScrollProgress`, `MagneticButton` | Contadores, barra de scroll dorada, botones magnéticos |

Estilos de marca usados: dorado `#FFB800` y rojo `#DC2626` (variables `--tesla-gold`, `--tesla-red`, `--tesla-dark`).

---

## 3️⃣ BASE DE DATOS (SUPABASE)

Proyecto Supabase: `https://fckbbohlxfqoyiomyxqm.supabase.co`

### 3.1 Tabla `leads`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Generado (`gen_random_uuid()`) |
| `created_at` | timestamptz | fecha de captura |
| `nombre` | text | nombre del contacto |
| `telefono` | text | formato `+519XXXXXXXX` (sin espacios, requerido por wa.me) |
| `servicio_interes` | text | servicio solicitado |
| `etapa` | text | etapa del embudo |
| `ubicacion` | text | ciudad |
| `estado` | text | `Nuevo`/`Contactado`/`Calificado`/`convertido`/`perdido` |
| `resumen_chat` | text | resumen del chat PILI |
| `fuente` | text | `PILi_Bot`/`Web`/`WhatsApp`/`Referido` |
| `contactado_whatsapp` | bool | ya contactado por WhatsApp |
| `fecha_contacto` | timestamptz | fecha de primer contacto |
| `respondio_whatsapp` | bool | el lead respondió |
| `fecha_respuesta` | timestamptz | fecha de respuesta |
| `cita_agendada` | bool | hay cita agendada |
| `fecha_cita` | timestamptz | fecha de la cita |
| `cita` | text | "Si"/NULL (complemento) |

### 3.2 Seguridad (RLS)
- **INSERT** anónimo: permitido (la landing captura sin `Prefer: return=representation`).
- **SELECT** autenticado: solo usuarios logueados leen los leads.
- Las políticas RLS están definidas en `supabase-setup.sql`.

### 3.3 Datos / Leads
- **Total: `1,001 leads`** en BD (fase de pruebas).
- Distribuidos en los **últimos 6 meses** (Feb – Ago 2026):
  `Feb 57 · Mar 76 · Abr 75 · May 240 · Jun 243 · Jul 289 · Ago 21`.
- Teléfonos sin espacios (validado): **0 con espacio**.
- Scripts seed: `seed_200_leads.js`, `seed_300_whatsapp.js`, `seed_500_leads_6months.js`.

---

## 4️⃣ AUTENTICACIÓN (SUPABASE AUTH)

Archivo principal: **`login.html`**.

- **Correo** (email/password de GoTrue).
- **Endpoint**: `/auth/v1/token?grant_type=password`.
- Cliente Supabase JS (`supabaseClient` en `api/supabaseClient.js`).

### Credenciales de administrador
| Campo | Valor |
|---|---|
| Correo | `oyp.solucionesdeingenieria@gmail.com` |
| Contraseña | `admin1234` |
| ID (auth.users) | `48c5895d-0c5b-450f-a60d-549604f0f627` |

> ⚠️ **IMPORTANTE**: la contraseña en producción es **`admin1234`** (confirmada y verificada en login). Cámbiala luego de la etapa de pruebas.

### Flujo del login
1. El usuario ingresa correo + contraseña.
2. `supabase.auth.signInWithPassword()` devuelve una sesión.
3. El token se usa para que el dashboard haga `SELECT` con RLS.
4. Memoria del correo en `localStorage` (`tesla_admin_email`).
5. Visor de contraseña (ojo 👁) y fallback de CDN (`jsdelivr` → `unpkg`) para `@supabase/supabase-js`.

### Datos técnicos de conexión (client)
- URL: `https://fckbbohlxfqoyiomyxqm.supabase.co`
- Clave publishable: `sb_publishable_lbRx3jVpe9P7gzl3B5gFEg_5GbQXXF0`

---

## 5️⃣ EJECUCIÓN LOCAL

Servidor local: **`server-local.js`** → puerto **3001** (variable `PORT`, fallback 3001).

```bash
cd tesla-landing
npm start          # o: node server-local.js
```

Luego abre:
- Landing: `http://localhost:3001/`
- Login: `http://localhost:3001/login.html`
- Dashboard: `http://localhost:3001/dashboard.html`

Para pruebas en Vercel: `vercel dev --listen 3001`.

---

## 6️⃣ ESTRUCTURA DE ARCHIVOS CLAVE

```
tesla-landing/
├── index.html                    # Landing + chatbot PILI
├── login.html                    # Autenticación admin
├── dashboard.html               # Panel de administración
├── animations.js                 # AnimatedNumber, ScrollProgress, MagneticButton
├── waves.js                      # Fondo animado (Waves)
├── splash-cursor.js              # Fluido del cursor (SplashCursor)
├── api/
│   ├── supabaseClient.js        # Cliente Supabase (URL + key)
│   └── chat.js                  # Endpoint chatbot PILI (Vercel)
├── lib/
│   └── pili-*.js                # Cerebro + memoria + WhatsApp notifier
├── seed_200_leads.js            # 200 leads
├── seed_300_whatsapp.js         # 300 leads WhatsApp
├── seed_500_leads_6months.js   # 500 leads (últimos 6 meses)
├── supabase-setup.sql           # Estructura + RLS + admin
├── server-local.js              # Servidor local (puerto 3001)
└── README.md / README_PILI_CHAT.md / README_3_*.md   # Documentación
```

---

## 7️⃣ ESTADO ACTUAL / PASOS SIGUIENTES

✅ Dashboard + BD + Auth funcionando y verificados en local (puerto 3001).
✅ Login: password corregido a `admin1234`, verificado vía REST.
✅ 1,001 leads de prueba en BD (Feb–Ago 2026).
⬜ Subida a **GitHub** (repo: `Oscar-Ivan-Salas/WEB-TESLA-...`).
⬜ Configurar variables de entorno en **Vercel** hacia el proyecto Supabase real.

---

## Licencia
Privado — TESLA Electricidad y Automatización S.A.C.