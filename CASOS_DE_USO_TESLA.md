# Casos de Uso - TESLA Landing Page

> **Guía de Casos de Uso del Sistema**  
> Versión: 1.0  
> Fecha: Enero 2026  
> Equipo: TESLA Electricidad y Automatización S.A.C.

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Actores del Sistema](#actores-del-sistema)
3. [Casos de Uso Principales](#casos-de-uso-principales)
4. [Flujos Detallados](#flujos-detallados)
5. [Diagramas de Flujo](#diagramas-de-flujo)
6. [Escenarios de Uso](#escenarios-de-uso)

---

## 🎯 Introducción

Este documento describe los casos de uso principales del sistema TESLA Landing Page, detallando cómo los diferentes actores interactúan con la plataforma para lograr sus objetivos.

### Objetivos del Sistema

1. **Captar leads calificados** de clientes potenciales
2. **Automatizar la calificación inicial** mediante conversación guiada
3. **Facilitar el contacto directo** con el equipo de ventas
4. **Presentar servicios** de manera visual y atractiva

---

## 👥 Actores del Sistema

### 1. **Visitante Web** (Usuario Anónimo)
- **Descripción:** Persona que llega a la landing page por primera vez
- **Objetivos:** 
  - Conocer los servicios de TESLA
  - Entender la propuesta de valor
  - Evaluar si TESLA puede resolver su necesidad
- **Acciones posibles:**
  - Navegar por la landing page
  - Leer información de servicios
  - Iniciar conversación con PILi
  - Contactar vía WhatsApp

### 2. **Cliente Potencial** (Lead)
- **Descripción:** Visitante que inicia conversación con PILi
- **Objetivos:**
  - Obtener evaluación técnica para su proyecto
  - Recibir orientación sobre soluciones
  - Coordinar contacto con especialista
- **Acciones posibles:**
  - Completar flujo de conversación
  - Proporcionar datos del proyecto
  - Agendar contacto
  - Enviar solicitud vía WhatsApp

### 3. **Equipo de Ventas TESLA**
- **Descripción:** Personal de TESLA que recibe y procesa leads
- **Objetivos:**
  - Recibir leads calificados
  - Contactar clientes potenciales
  - Cerrar ventas
- **Acciones posibles:**
  - Recibir notificaciones de WhatsApp
  - Revisar información del lead
  - Contactar al cliente
  - Dar seguimiento

### 4. **Administrador del Sistema**
- **Descripción:** Desarrollador o responsable técnico
- **Objetivos:**
  - Mantener el sistema funcionando
  - Actualizar contenido
  - Monitorear métricas
- **Acciones posibles:**
  - Desplegar actualizaciones
  - Revisar logs
  - Analizar conversiones

---

## 📊 Casos de Uso Principales

### Diagrama de Casos de Uso

```
                    ┌─────────────────────┐
                    │  VISITANTE WEB      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   UC-01      │  │   UC-02      │  │   UC-03      │
    │  Explorar    │  │  Conversar   │  │  Contactar   │
    │  Landing     │  │  con PILi    │  │  WhatsApp    │
    └──────────────┘  └──────┬───────┘  └──────────────┘
                             │
                             │ «include»
                             ▼
                    ┌──────────────────┐
                    │   UC-04          │
                    │  Calificar Lead  │
                    └────────┬─────────┘
                             │
                             │ «extend»
                             ▼
                    ┌──────────────────┐
                    │   UC-05          │
                    │  Generar         │
                    │  Notificación    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ EQUIPO DE VENTAS │
                    └──────────────────┘
```

---

## 🔄 Casos de Uso Detallados

### UC-01: Explorar Landing Page

**Actor Principal:** Visitante Web  
**Precondiciones:** Ninguna  
**Postcondiciones:** Usuario conoce servicios de TESLA

#### Flujo Principal

1. Usuario accede a `https://tesla-landing-self.vercel.app`
2. Sistema muestra landing page con:
   - Header con logo y navegación
   - Hero con propuesta de valor principal
   - Sección "El Modelo TESLA" (4 pilares)
   - Sección "Servicios" (6 servicios)
   - Sección "Experiencia"
   - Footer con información corporativa
3. Usuario navega por las secciones usando:
   - Menú de navegación
   - Scroll
   - Botones de acción
4. Usuario puede hacer clic en tarjetas de servicios para ver detalles
5. Sistema muestra información expandida en acordeón

#### Flujos Alternativos

**FA-01: Usuario en móvil**
- Sistema adapta diseño responsive
- Muestra versión mobile del hero
- Oculta navegación en menú hamburguesa

**FA-02: Usuario cambia tema**
- Usuario hace clic en botón de tema (sol/luna)
- Sistema alterna entre modo claro y oscuro
- Preferencia se guarda en localStorage

#### Puntos de Extensión

- **PE-01:** Usuario hace clic en "Evaluación Técnica" → UC-02
- **PE-02:** Usuario hace clic en WhatsApp → UC-03

---

### UC-02: Conversar con PILi

**Actor Principal:** Cliente Potencial  
**Precondiciones:** Usuario en la landing page  
**Postcondiciones:** Lead calificado generado

#### Flujo Principal

1. Usuario hace clic en botón "Evaluación Técnica" o FAB de chat
2. Sistema abre sidebar de chat con PILi
3. Sistema envía mensaje de bienvenida automáticamente
4. PILi pregunta: "¿Qué tipo de proyecto estás evaluando?"
5. Sistema muestra opciones:
   - 🏗️ Obra en ejecución
   - 🏢 Proyecto nuevo
   - 🔧 Mantenimiento / Remodelación
6. Usuario selecciona opción
7. PILi pregunta: "¿En qué etapa se encuentra?"
8. Sistema muestra opciones:
   - Inicio / Planos
   - En ejecución / Casco
   - Etapa final / Cierre
9. Usuario selecciona opción
10. PILi pregunta: "¿Qué necesitas resolver?"
11. Sistema muestra opciones:
    - ⚡ Electricidad
    - 🚨 Sistemas contra incendios
    - 🤖 Automatización / Domótica
    - 🔐 Seguridad electrónica
    - 🏗️ Acabados técnicos
    - 🧩 Solución integral TESLA
12. Usuario selecciona opción
13. PILi solicita: "Indícame tu Nombre Completo"
14. Usuario escribe nombre
15. PILi solicita: "¿Cuál es tu número de WhatsApp?"
16. Usuario escribe teléfono
17. PILi solicita: "¿En qué ciudad se ubica el proyecto?"
18. Usuario escribe ubicación
19. PILi pregunta: "¿Cuándo prefieres que te contactemos?"
20. Sistema muestra opciones:
    - 🌅 Mañana
    - 🕐 Tarde
    - 📅 Fin de semana
21. Usuario selecciona opción
22. PILi muestra resumen de la solicitud
23. Sistema genera enlace de WhatsApp con datos
24. Sistema muestra botón "Confirmar por WhatsApp"

#### Flujos Alternativos

**FA-01: Usuario escribe mensaje libre**
- Sistema detecta que no es una opción válida
- PILi responde: "Por favor, selecciona una opción del menú"
- Sistema vuelve a mostrar opciones

**FA-02: Usuario cierra chat antes de completar**
- Sistema guarda sesión en localStorage
- Al reabrir, sistema recupera estado
- PILi continúa desde donde se quedó

**FA-03: Usuario ingresa datos inválidos**
- Sistema valida formato (nombre < 3 caracteres, teléfono < 9 dígitos)
- PILi solicita corrección
- Usuario reingresa datos

#### Flujos de Excepción

**FE-01: Error de conexión con backend**
- Sistema muestra mensaje: "Lo siento, hubo un error de conexión"
- Usuario puede reintentar
- Sistema registra error en logs

**FE-02: Sesión expirada**
- Sistema detecta sesión inválida
- PILi reinicia conversación desde el inicio
- Usuario debe proporcionar datos nuevamente

---

### UC-03: Contactar Directamente por WhatsApp

**Actor Principal:** Visitante Web / Cliente Potencial  
**Precondiciones:** Usuario en la landing page  
**Postcondiciones:** WhatsApp abierto con mensaje pre-rellenado

#### Flujo Principal

1. Usuario hace clic en botón de WhatsApp (header, hero, o chat)
2. Sistema genera enlace con mensaje contextual:
   - Desde header/hero: Mensaje genérico de consulta
   - Desde chat: Mensaje con datos del lead
3. Sistema abre WhatsApp en nueva pestaña/app
4. WhatsApp muestra chat con TESLA (906 315 961)
5. Mensaje aparece pre-rellenado en campo de texto
6. Usuario puede editar mensaje si desea
7. Usuario envía mensaje
8. Equipo de ventas recibe notificación

#### Flujos Alternativos

**FA-01: Usuario en desktop sin WhatsApp Web**
- Sistema abre WhatsApp Web
- Usuario debe escanear QR si no está logueado
- Continúa flujo normal

**FA-02: Usuario en móvil**
- Sistema abre app nativa de WhatsApp
- Mensaje pre-rellenado aparece directamente
- Experiencia más fluida

---

### UC-04: Calificar Lead

**Actor Principal:** Sistema (automático)  
**Precondiciones:** Usuario completó conversación con PILi  
**Postcondiciones:** Lead calificado y almacenado

#### Flujo Principal

1. Sistema recopila datos de la conversación:
   ```javascript
   {
     tipo_proyecto: "🏗️ Obra en ejecución",
     etapa: "En ejecución / Casco",
     necesidad: "⚡ Electricidad",
     nombre: "Juan Pérez",
     telefono: "906315961",
     ubicacion: "Huancayo",
     cita: "🌅 Mañana"
   }
   ```
2. Sistema valida completitud de datos
3. Sistema asigna prioridad según criterios:
   - **Alta:** Solución integral + Proyecto nuevo
   - **Media:** Múltiples sistemas + Obra en ejecución
   - **Normal:** Servicio único + Mantenimiento
4. Sistema almacena en Vercel KV con TTL de 24h
5. Sistema genera timestamp de creación
6. Sistema marca estado como "LEAD_CALIFICADO"

#### Criterios de Calificación

| Campo | Peso | Criterio |
|-------|------|----------|
| **Necesidad** | 40% | Solución integral > Múltiples > Individual |
| **Tipo Proyecto** | 30% | Proyecto nuevo > Obra > Mantenimiento |
| **Etapa** | 20% | Inicio > Ejecución > Final |
| **Ubicación** | 10% | Huancayo > Junín > Otras regiones |

---

### UC-05: Generar Notificación WhatsApp

**Actor Principal:** Sistema (automático)  
**Precondiciones:** Lead calificado (UC-04)  
**Postcondiciones:** Enlace de WhatsApp generado

#### Flujo Principal

1. Sistema recibe datos del lead calificado
2. Sistema formatea mensaje con emojis compatibles:
   ```
   🔔 *SOLICITUD PILi V4* 🔔
   
   👤 *Cliente:* Juan Pérez
   📱 *WhatsApp:* 906315961
   📍 *Ubicación:* Huancayo
   
   🏗️ *Proyecto:* 🏗️ Obra en ejecución
   📊 *Etapa:* En ejecución / Casco
   🛠️ *Necesidad:* ⚡ Electricidad
   
   📅 *Cita:* 🌅 Mañana
   
   Link autogenerado por PILi Chat.
   ```
3. Sistema codifica mensaje para URL:
   ```javascript
   const encodedText = encodeURIComponent(message);
   ```
4. Sistema genera enlace:
   ```
   https://wa.me/51906315961?text=<encoded_message>
   ```
5. Sistema retorna enlace al frontend
6. Frontend muestra botón con el enlace

#### Validaciones

- ✅ Todos los campos obligatorios presentes
- ✅ Formato de teléfono válido (9+ dígitos)
- ✅ Emojis compatibles con WhatsApp
- ✅ Longitud de mensaje < 2000 caracteres

---

## 🔀 Diagramas de Flujo

### Flujo Completo de Conversión de Lead

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO                                   │
│              Usuario llega a landing                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │ ¿Qué hace el   │
            │    usuario?    │
            └────┬──────┬────┘
                 │      │
        ┌────────┘      └────────┐
        │                        │
        ▼                        ▼
┌──────────────┐        ┌──────────────┐
│   Explorar   │        │ Abrir Chat   │
│   Landing    │        │    PILi      │
└──────┬───────┘        └──────┬───────┘
       │                       │
       │                       ▼
       │              ┌─────────────────┐
       │              │ Conversación    │
       │              │ Guiada (8 pasos)│
       │              └────────┬────────┘
       │                       │
       │                       ▼
       │              ┌─────────────────┐
       │              │ ¿Completó       │
       │              │ conversación?   │
       │              └────┬──────┬─────┘
       │                   │      │
       │              Sí   │      │ No
       │                   │      │
       │                   ▼      ▼
       │          ┌──────────┐  ┌──────────┐
       │          │ Generar  │  │ Guardar  │
       │          │ WhatsApp │  │ Sesión   │
       │          │  Link    │  └──────────┘
       │          └────┬─────┘
       │               │
       │               ▼
       │      ┌─────────────────┐
       │      │ Usuario hace    │
       │      │ clic en botón   │
       │      └────────┬────────┘
       │               │
       └───────────────┼────────────────┐
                       │                │
                       ▼                ▼
              ┌─────────────┐  ┌─────────────┐
              │  WhatsApp   │  │  Salir sin  │
              │   Abierto   │  │  contactar  │
              └──────┬──────┘  └─────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Equipo de Ventas│
            │ recibe mensaje  │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │   Seguimiento   │
            │   y Cierre      │
            └─────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │      FIN        │
            └─────────────────┘
```

### Flujo de Estados de PILi

```
START
  │
  ├─► "Hola" → ASK_PROJECT_TYPE
  │              │
  │              ├─► "🏗️ Obra" → ASK_STAGE
  │              │                  │
  │              │                  ├─► "Ejecución" → ASK_NEED
  │              │                  │                    │
  │              │                  │                    ├─► "Electricidad" → ASK_NAME
  │              │                  │                    │                      │
  │              │                  │                    │                      ├─► "Juan" → ASK_PHONE
  │              │                  │                    │                      │              │
  │              │                  │                    │                      │              ├─► "906315961" → ASK_LOCATION
  │              │                  │                    │                      │              │                   │
  │              │                  │                    │                      │              │                   ├─► "Huancayo" → ASK_APPOINTMENT
  │              │                  │                    │                      │              │                   │                   │
  │              │                  │                    │                      │              │                   │                   ├─► "Mañana" → CONFIRM
  │              │                  │                    │                      │              │                   │                   │              │
  │              │                  │                    │                      │              │                   │                   │              └─► END
  │              │                  │                    │                      │              │                   │                   │
  │              │                  │                    │                      │              │                   │                   └─► [WhatsApp Link]
  │              │                  │                    │                      │              │                   │
  │              │                  │                    │                      │              │                   └─► [Guardar en KV]
  │              │                  │                    │                      │              │
  │              │                  │                    │                      │              └─► [Validar teléfono]
  │              │                  │                    │                      │
  │              │                  │                    │                      └─► [Validar nombre]
  │              │                  │                    │
  │              │                  │                    └─► [Validar opción]
  │              │                  │
  │              │                  └─► [Validar opción]
  │              │
  │              └─► [Validar opción]
  │
  └─► [Inicializar sesión]
```

---

## 🎬 Escenarios de Uso

### Escenario 1: Cliente Industrial Busca Solución Integral

**Contexto:**  
Gerente de planta industrial en Huancayo busca integrador para nuevo proyecto

**Flujo:**

1. **Descubrimiento:**
   - Usuario busca "electricidad industrial Huancayo" en Google
   - Encuentra landing page de TESLA
   - Lee sobre "El Modelo TESLA" y "Solución Integral"

2. **Evaluación:**
   - Hace clic en "Evaluación Técnica"
   - Conversa con PILi:
     - Tipo: "🏢 Proyecto nuevo"
     - Etapa: "Inicio / Planos"
     - Necesidad: "🧩 Solución integral TESLA"
     - Datos: "Carlos Mendoza - 987654321 - Huancayo"
     - Cita: "🌅 Mañana"

3. **Conversión:**
   - Recibe resumen de solicitud
   - Hace clic en "Confirmar por WhatsApp"
   - WhatsApp se abre con mensaje pre-rellenado
   - Envía mensaje

4. **Seguimiento:**
   - Equipo de ventas recibe notificación
   - Asesor técnico contacta en 2 horas
   - Agenda visita técnica
   - Cierra venta de proyecto integral

**Resultado:** Lead de alta calidad → Venta cerrada

---

### Escenario 2: Arquitecto Busca Información Rápida

**Contexto:**  
Arquitecto necesita cotización rápida para sistema contra incendios

**Flujo:**

1. **Acceso Rápido:**
   - Recibe link de WhatsApp de colega
   - Abre landing page en móvil
   - Lee sección de "Sistemas contra incendios"

2. **Contacto Directo:**
   - No quiere llenar formulario
   - Hace clic en botón WhatsApp del header
   - Escribe mensaje personalizado directamente
   - Envía consulta específica

3. **Respuesta:**
   - Equipo responde en 15 minutos
   - Coordina reunión virtual
   - Envía cotización preliminar

**Resultado:** Lead calificado → Cotización enviada

---

### Escenario 3: Cliente Residencial Explora Opciones

**Contexto:**  
Propietario de casa en construcción evalúa domótica

**Flujo:**

1. **Investigación:**
   - Llega desde Facebook Ads
   - Navega por toda la landing page
   - Lee sobre automatización y domótica
   - Ve ejemplos visuales

2. **Consulta Inicial:**
   - Abre chat con PILi
   - Selecciona:
     - Tipo: "🏗️ Obra en ejecución"
     - Etapa: "Etapa final / Cierre"
     - Necesidad: "🤖 Automatización / Domótica"
   - Proporciona datos básicos

3. **Decisión Posterior:**
   - Cierra chat antes de confirmar
   - Sesión se guarda
   - Vuelve al día siguiente
   - PILi recupera conversación
   - Completa solicitud

4. **Conversión:**
   - Confirma por WhatsApp
   - Recibe visita técnica
   - Contrata paquete de domótica básica

**Resultado:** Lead nurturing → Venta cerrada

---

### Escenario 4: Competidor Investiga

**Contexto:**  
Empresa competidora revisa la landing page

**Flujo:**

1. **Exploración:**
   - Navega por toda la página
   - Lee información técnica
   - Intenta abrir chat

2. **Conversación Incompleta:**
   - Inicia chat con PILi
   - Proporciona datos falsos
   - No completa conversación
   - Cierra página

3. **Sistema:**
   - Sesión expira en 24h
   - No se genera lead
   - No hay notificación al equipo

**Resultado:** Sin impacto negativo, sistema protegido

---

## 📊 Métricas de Éxito por Caso de Uso

| Caso de Uso | Métrica Clave | Objetivo | Medición |
|-------------|---------------|----------|----------|
| **UC-01: Explorar Landing** | Tiempo en página | > 2 min | Google Analytics |
| **UC-02: Conversar con PILi** | Tasa de completación | > 60% | Vercel KV |
| **UC-03: Contactar WhatsApp** | Click-through rate | > 15% | Event tracking |
| **UC-04: Calificar Lead** | Leads/día | > 5 | Vercel KV count |
| **UC-05: Generar Notificación** | Tasa de envío | 100% | WhatsApp logs |

---

## 🔄 Casos de Uso Futuros (Roadmap)

### Fase 2: Integración con IA

- **UC-06:** Conversación con IA (ChatGPT/Gemini)
- **UC-07:** Generación de cotización automática
- **UC-08:** Recomendación de servicios personalizados

### Fase 3: Panel de Administración

- **UC-09:** Login de administrador
- **UC-10:** Visualizar dashboard de leads
- **UC-11:** Exportar leads a CRM
- **UC-12:** Configurar respuestas de PILi

### Fase 4: Funcionalidades Avanzadas

- **UC-13:** Agendar cita en calendario
- **UC-14:** Subir planos/documentos
- **UC-15:** Video llamada con asesor
- **UC-16:** Firma digital de contratos

---

## 📝 Notas Técnicas

### Consideraciones de UX

- **Simplicidad:** Máximo 3 clics para contactar
- **Claridad:** Mensajes concisos y directos
- **Velocidad:** Respuestas instantáneas (< 500ms)
- **Accesibilidad:** Compatible con lectores de pantalla
- **Responsive:** Optimizado para móviles (70% del tráfico)

### Consideraciones de Negocio

- **Calificación:** Solo leads con datos completos
- **Priorización:** Leads de alta calidad primero
- **Seguimiento:** Contacto en < 24 horas
- **Conversión:** Objetivo 20% de cierre

---

**Documento preparado para el equipo de desarrollo**  
**TESLA Electricidad y Automatización S.A.C.**
