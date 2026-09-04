# Especificación técnica maestra
## Plataforma TESLA — PILI, base de datos y generación documental

**Empresa:** TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C. — RUC 20601138787
**Versión:** 1.0
**Fecha:** 30 de agosto de 2026
**Repositorio:** `WEB-TESLA-ELECTRICIDAD-Y-AUTOAMTIZACI-N-S.A.C`
**Destinatario:** equipo de desarrollo y agente de codificación (Antigravity)

---

## Cómo usar este documento

Está escrito para ejecutarse por partes. Cada fase tiene criterios de aceptación
verificables. **No avanzar a la fase siguiente sin cumplir los criterios de la
anterior.**

Las secciones marcadas **[BLOQUEANTE]** deben resolverse antes de cualquier otro
trabajo. No son mejoras: son riesgos activos hoy.

---

# PARTE I — ESTADO ACTUAL

## 1. Qué existe y funciona

| Componente | Estado | Ubicación |
|---|---|---|
| Sitio web estático | Operativo | `index.html` (2117 líneas) |
| Chatbot PILI web | Operativo | `api/chat.js` |
| Enrutamiento por especialidad | Operativo | `lib/pili-multi-agent-rag.js` |
| Integración con modelo (Gemini Flash) | Parcial | `api/chat.js:296-352` |
| Webhook WhatsApp | Operativo, inseguro | `api/whatsapp-webhook.js` |
| Webhook Telegram | Operativo, inseguro | `api/telegram-webhook.js` |
| Captura de leads | Operativo | `api/save-lead.js` |
| Base de datos Supabase | Operativo | Proyecto activo |
| RLS sobre `leads` | Correctamente configurado | `supabase-setup.sql` |
| Dashboard con autenticación | Operativo | `dashboard.html`, `login.html` |
| Plantillas documentales Word/Excel | Construidas | Entregadas fuera del repo |

**Lo que está bien hecho y no debe tocarse:** la política RLS sobre `leads`
(anónimo solo inserta), los atributos `alt` en las imágenes, el SEO básico
completo, y el respaldo a `unpkg` si falla el CDN de `jsdelivr` en `login.html`.

## 2. Defectos abiertos

### 2.1 [BLOQUEANTE] Credenciales expuestas en repositorio público

| # | Defecto | Ubicación |
|---|---|---|
| S-01 | Contraseña `admin1234` en texto plano | `supabase-setup.sql` líneas 9, 51, 62, 98 |
| S-02 | URL y clave publicable de Supabase quemadas como *fallback* | `api/supabaseClient.js` líneas 6-7 |
| S-03 | Token de verificación de WhatsApp quemado | `api/whatsapp-webhook.js` línea 8 |

**S-01 es el más grave.** Con la contraseña, el correo del administrador y la URL
del proyecto — los tres en el repositorio — cualquiera accede al dashboard y
obtiene nombres, teléfonos y ubicaciones de los clientes. Eso constituye
tratamiento indebido de datos personales bajo la Ley 29733.

Borrar el archivo **no es suficiente**: el historial de Git conserva el contenido.
La única mitigación real es **cambiar la contraseña y rotar las claves**.

### 2.2 [BLOQUEANTE] Webhooks sin verificación de firma

`api/whatsapp-webhook.js` valida el `GET` de Meta pero **no verifica la cabecera
`X-Hub-Signature-256` en el `POST`**. Cualquiera puede enviar eventos falsos y
hacer que PILI responda a números arbitrarios desde la cuenta de Tesla. Riesgo
concreto: suspensión del número de WhatsApp Business por parte de Meta.

`api/telegram-webhook.js` no valida nada en absoluto.

### 2.3 [BLOQUEANTE] Afirmación técnica incorrecta en producción

`lib/pili-multi-agent-rag.js`, líneas 17 y 196, afirma al cliente:

> "pozo a tierra certificados con medición **< 5Ω según el CNE Perú**"

**El límite del Código Nacional de Electricidad, regla 060-712, es 25 Ω, no 5 Ω.**

Es un dato falso atribuido a una norma, y es una promesa que las propias
mediciones de Tesla no cumplen: el certificado de L & A Medic del 15/10/2021
registró 7,375 Ω y 7,45 Ω, correctamente declarados aceptables bajo el límite
real. Bajo la promesa que hoy hace PILI, ese pozo estaría reprobado.

Otras tres afirmaciones a corregir en el mismo archivo:

| Agente | Texto actual | Problema |
|---|---|---|
| AUTOMATIZACION | "ahorro **comprobado** de hasta 30%" | "Comprobado" exige evidencia documentada |
| BIM_MEP | "reduciendo a **0%** los retrabajos" | Absoluto indefendible |
| ITSE | "auditoría pre-inspección previa **sin costo**" | El agente compromete trabajo gratuito por su cuenta |

### 2.4 Defectos funcionales

| # | Defecto | Ubicación | Efecto |
|---|---|---|---|
| F-01 | Sesiones en `Map` en memoria | `api/chat.js:356` | La conversación se corta al reciclarse la instancia serverless |
| F-02 | `GEMINI_API_KEY \|\| ""` | `api/chat.js:296` | Si falta la variable, llama con clave vacía, falla y cae al guion fijo **sin avisar** |
| F-03 | Mensaje del usuario concatenado al *system prompt* | `api/chat.js:320` | Inyección de prompt: PILI puede ser redirigida hablando como Tesla |
| F-04 | *Timeout* de 4 s | `api/chat.js:326` | Insuficiente para peticiones con imagen |
| F-05 | Fuga de *stack trace* con `status(200)` | `api/save-lead.js:69` | Revela estructura interna y oculta fallos reales de guardado |
| F-06 | `Access-Control-Allow-Origin: '*'` | `api/save-lead.js:11` | Cualquier sitio puede insertar leads; sin límite de tasa |
| F-07 | Validación laxa de opciones | `api/chat.js` `isValidOption` | Una sola letra pasa como opción válida y se guarda como `tipo_proyecto` |

### 2.5 Deuda técnica

- **Imágenes:** 15 MB, 47 archivos PNG, **0 WebP**, **0 de 30 con `loading="lazy"`**.
  `pili_avatar_02.png` pesa 1,4 MB.
- **Repositorio:** 132 archivos. Residuos: `index_cero.html`, `index_old.html`,
  `old_index_utf8.html`, `temp_old_index.html`, `Backup_main.js`,
  `temp_old_main.js`, `card_code.txt`, `changes_diff.txt`, más cinco generadores
  de leads de prueba mezclados con producción.
- **URL con error tipográfico** (`autoamtiza` en vez de `automatiza`) presente en
  6 archivos: `index.html`, `main.js`, `api/whatsapp-webhook.js`,
  `lib/pili-multi-agent-rag.js`, `lib/whatsapp-interactive-catalog.js`,
  `lib/whatsapp-notifier.js`.

### 2.6 Inconsistencias de datos de negocio

| Fuente | Dato | Conflicto |
|---|---|---|
| `HOJA_MEMBRETADA_TESLA.docx` | Domicilio en **Huancayo, Junín** | vs. Lima en certificados |
| `index.html` | Menciona **Huancayo** | vs. Lima en certificados |
| Certificados y contratos | **Jr. Las Ágatas, San Juan de Lurigancho, Lima** | vs. Huancayo |
| Contrato Aymar | RUC `20801138787` | Dígito incorrecto; el real es `20601138787` |
| Web / PILI / conversación | 6 tarjetas / 7 categorías / "8 servicios" | Tres listas distintas |

**Acción requerida del cliente (no del desarrollo):** consultar la Ficha RUC en
SUNAT y determinar cuál es el domicilio fiscal y cuál el establecimiento anexo.
Un contribuyente tiene **un solo domicilio fiscal** y puede declarar tantos
establecimientos anexos como opere (Formulario 2046 o Formulario Virtual 3128).

---

# PARTE II — DECISIONES DE ARQUITECTURA

## 3. Veredicto sobre los 8 agentes

**Pregunta:** ¿es adecuado tener un agente por servicio?

**Respuesta: la cantidad no es el problema; la ubicación del conocimiento sí.**

La implementación actual está **mejor de lo que su nombre sugiere**. Los ocho
"agentes" comparten un solo proceso, un solo endpoint y una sola llamada al
modelo. Lo único que cambia es el *system prompt*. Eso no es un sistema
multiagente: es **un agente con ocho contextos**, que es exactamente la
arquitectura correcta.

**Lo que sí debe cambiar:**

1. **No es RAG.** No hay embeddings, ni base vectorial, ni recuperación. Renombrar
   `lib/pili-multi-agent-rag.js` a `lib/pili-personas.js` mientras no exista
   recuperación real. El nombre incorrecto induce decisiones incorrectas.

2. **El conocimiento debe salir del código.** Hoy, corregir un dato técnico exige
   editar JavaScript y volver a desplegar. Así fue como el error de los 5 Ω quedó
   incrustado en producción. El conocimiento pasa a las tablas `kb_documentos` y
   `kb_chunks`, editables sin desplegar.

3. **Separar por permiso, no por servicio.** Ver sección 4.

**Conclusión:** conservar las 8 especialidades como *categorías de contenido*
(tabla `categorias_servicio`). No crear ocho servicios, ni ocho endpoints, ni
ocho despliegues.

## 4. Las dos PILI

La separación correcta es por **nivel de permiso**, porque ahí es donde cambia
qué puede ver y qué puede hacer el agente.

### 4.1 PILI Vendedora (canal público)

| Aspecto | Definición |
|---|---|
| Usuarios | Cualquiera: web, WhatsApp, Telegram |
| Autenticación | Ninguna |
| Acceso a datos | `v_catalogo_publico` y `kb_documentos`. **Nunca** clientes ni precios |
| Puede escribir | Solo `leads` |
| Salida comercial | **Estimado referencial**: rango, vigencia, supuestos |
| Objetivo | Capturar el lead y agendar la visita técnica |

**Prohibiciones explícitas** (deben estar en el *system prompt* y verificarse en
pruebas):

- No dar precio cerrado ni comprometer plazos de ejecución.
- No ofrecer descuentos ni trabajo sin costo.
- No afirmar valores técnicos como garantía contractual.
- Ante duda técnica específica, derivar a visita con ingeniero colegiado.

Un precio comunicado por escrito puede interpretarse como oferta. Todo importe
que emita este canal debe rotularse *estimado referencial, sujeto a confirmación
tras visita técnica*, con vigencia y supuestos declarados.

### 4.2 PILI Secretaria (canal interno)

| Aspecto | Definición |
|---|---|
| Usuarios | Gerencia, ingenieros, asesores, técnicos |
| Autenticación | Supabase Auth obligatoria |
| Acceso a datos | Completo según rol (RLS) |
| Salida | Cotizaciones, informes y certificados **en estado borrador** |
| Objetivo | Reducir el tiempo de producción documental |

**Prohibiciones explícitas:**

- No enviar nada a un cliente sin aprobación humana explícita.
- No firmar ni marcar documentos como emitidos.
- No inventar precios: si no está en catálogo, preguntar.
- No calcular montos: los calcula la base de datos.

### 4.3 Regla de despliegue

**Son dos despliegues separados, con credenciales separadas.** Si el endpoint que
atiende a desconocidos comparte proceso con el que escribe mediciones, existirá
una ruta para escribir datos falsos. Esta separación debe hacerse **desde el
primer día**: hacerla después significa rehacer.

## 5. Reglas de negocio innegociables

| # | Regla | Justificación |
|---|---|---|
| R-01 | Los montos los calcula PostgreSQL, nunca el modelo | Un LLM no es una calculadora auditable |
| R-02 | Los precios salen de consulta SQL exacta, nunca de búsqueda semántica | La similitud de texto devuelve el precio del servicio parecido |
| R-03 | Ningún documento se emite con instrumento de calibración vencida | Sin respaldo metrológico el certificado es nulo |
| R-04 | Ningún documento se emite sin profesional colegiado y habilitado | Exigencia de la NTP 370.310 |
| R-05 | El correlativo se asigna al aprobar, no al crear el borrador | Evita huecos en la numeración ante auditoría |
| R-06 | El agente propone; el humano firma | La responsabilidad profesional es personal e indelegable |
| R-07 | En mediciones, el técnico escribe **antes** de que la IA vea la foto | Evita el sesgo de automatización |
| R-08 | Todo RUC se valida por módulo 11 antes de guardarse | Habría evitado el `20801138787` |
| R-09 | Límite CNE-U regla 060-712: **25 Ω** | Dato normativo real |

---

# PARTE III — BASE DE DATOS

## 6. Esquema

El esquema completo está en **`tesla_schema.sql`**, listo para ejecutar en el SQL
Editor de Supabase. Validado sintácticamente contra el analizador de PostgreSQL:
114 sentencias, sin errores.

### 6.1 Módulos

| Módulo | Tablas | Fase |
|---|---|---|
| Usuarios y roles | `perfiles` | 1 |
| Clientes | `clientes`, `sedes`, `contactos` | 1 |
| Catálogo | `categorias_servicio`, `servicios`, `historial_precios` | 1 |
| Cotizaciones | `cotizaciones`, `cotizacion_items`, `correlativos` | 1 |
| Proveedores | `proveedores`, `insumos`, `precios_proveedor` | 3 |
| Recursos | `profesionales`, `instrumentos`, `calibraciones` | 2 |
| Operación | `ordenes_trabajo`, `mediciones`, `fotos` | 2 |
| Documentos | `documentos`, vista `v_vencimientos` | 2 |
| Conocimiento | `kb_documentos`, `kb_chunks` | 3 |
| Trazabilidad | `leads`, `auditoria` | 1 |

### 6.2 Validaciones incorporadas

**`fn_ruc_valido(text)`** — módulo 11 con pesos `5,4,3,2,7,6,5,4,3,2`.
Verificada contra los RUC reales del proyecto:

| RUC | Origen | Resultado |
|---|---|---|
| 20601138787 | Tesla, membrete y certificados | **Válido** |
| 20801138787 | Tesla, mal escrito en contrato Aymar | **Rechazado** |
| 20492574652 | Importaciones L & A Medic | **Válido** |
| 20551663401 | Distribuidora Aymar Medic | **Válido** |
| 20612301493 | Global Metric Lab | **Válido** |

**`fn_instrumento_vigente(uuid, date)`** — verifica que la calibración cubra la
fecha de inspección. Detecta el conflicto real detectado en agosto de 2026: un
certificado fechado el 25/08/2025 no puede citar la calibración GM-345-2025,
emitida el 16/09/2025.

**`fn_validar_emision()`** — *trigger* sobre `documentos`. Impide pasar a estado
`emitido` si falta fecha de inspección, si el instrumento no tenía calibración
vigente, si el profesional no está habilitado o si falta correlativo. Calcula el
vencimiento automáticamente.

**`fn_recalcular_cotizacion()`** — *trigger* sobre `cotizacion_items`. Recalcula
subtotal, descuento, valor de venta, IGV y total en cada cambio. Implementa R-01.

**`fn_siguiente_correlativo()`** — numeración atómica por tipo y año. Implementa R-05.

### 6.3 La vista que genera ingresos

`v_vencimientos` clasifica cada documento emitido en `vigente`, `por_vencer`
(≤30 días) o `vencido`, con los datos de contacto del cliente.

**Contexto:** los certificados de IMPORTACIONES L & A MEDIC S.A.C. vencieron en
octubre de 2022 y nadie lo detectó hasta agosto de 2026. Casi cuatro años de
facturación recurrente perdidos por no tener esta consulta.

Es la funcionalidad de mayor retorno del sistema y **no requiere inteligencia
artificial**: es una vista SQL más un trabajo programado.

### 6.4 Seguridad a nivel de fila

Principio: **el canal anónimo solo puede insertar en `leads`.** Todo lo demás
exige sesión iniciada. Precios, proveedores, profesionales, instrumentos,
calibraciones y base de conocimiento quedan restringidos a los roles `gerente` e
`ingeniero`. La tabla `auditoria` es de solo lectura para gerencia.

---

# PARTE IV — PLAN DE EJECUCIÓN

## Fase 0 — Contención [BLOQUEANTE]

**Duración estimada: 1 día. Ninguna otra fase empieza antes.**

| Tarea | Detalle |
|---|---|
| 0.1 | Cambiar la contraseña del administrador. Larga y única |
| 0.2 | Rotar las claves de Supabase desde el panel |
| 0.3 | Activar verificación en dos pasos en Supabase, Vercel y GitHub |
| 0.4 | Eliminar credenciales de `supabase-setup.sql`; dejar marcadores |
| 0.5 | Quitar los *fallback* `\|\| '...'` de `api/supabaseClient.js`; que falle con error explícito si falta la variable |
| 0.6 | Corregir `save-lead.js`: `status(500)` en error, sin `stack` |
| 0.7 | Restringir CORS al dominio propio |
| 0.8 | Verificar `X-Hub-Signature-256` en el webhook de WhatsApp |
| 0.9 | Verificar `secret_token` en el webhook de Telegram |
| 0.10 | Corregir 5 Ω → 25 Ω y las otras tres afirmaciones de la sección 2.3 |

**Criterio de aceptación:** ningún secreto en el repositorio; los dos webhooks
rechazan peticiones sin firma válida; ninguna afirmación técnica sin respaldo
normativo.

## Fase 1 — Cotizaciones desde chat interno

**Objetivo:** que un asesor genere una cotización conversando, y que el ciclo
completo quede probado con uso real.

### 1.1 Base de datos
Ejecutar `tesla_schema.sql`. Cargar el catálogo real de servicios con sus
precios. Crear los perfiles de usuario con sus roles.

### 1.2 Herramientas del agente

| Herramienta | Firma | Regla |
|---|---|---|
| `buscar_cliente` | `(texto) → cliente[]` | Búsqueda por razón social o RUC |
| `crear_cliente` | `(razon_social, ruc, direccion, distrito) → cliente` | Valida RUC antes de insertar |
| `buscar_servicio` | `(texto, categoria?) → servicio[]` | Devuelve precio vigente |
| `crear_cotizacion` | `(cliente_id, sede_id?, items[]) → cotizacion` | Estado `borrador`, sin correlativo |
| `generar_excel_cotizacion` | `(cotizacion_id) → url` | Reutiliza el generador existente |
| `aprobar_cotizacion` | `(cotizacion_id) → correlativo` | Asigna correlativo. **Requiere confirmación humana** |
| `enviar_cotizacion` | `(cotizacion_id, canal) → ok` | Acción separada. **Requiere confirmación humana** |

**Si un servicio no está en catálogo, el agente NO estima.** Informa que no lo
tiene, pregunta el precio y ofrece guardarlo. El catálogo se completa con el uso.

### 1.3 Flujo conversacional

1. Identificar cliente → confirmar con el usuario
2. Capturar ítems → recuperar precios vigentes
3. Mostrar resumen: cliente, ítems, subtotal, IGV, total
4. Esperar confirmación explícita
5. Generar borrador y archivo Excel
6. Envío como paso separado, con confirmación aparte

### 1.4 Correcciones técnicas incluidas

- Sesiones a Vercel KV (resuelve F-01)
- `GEMINI_API_KEY` sin *fallback*; error explícito si falta (F-02)
- Usar `systemInstruction` en lugar de concatenar (F-03)
- Ampliar *timeout* y revisar el límite de ejecución del plan de Vercel (F-04)
- Reemplazar `isValidOption` por comparación exacta o índice numérico (F-07)

**Criterios de aceptación:**
- Un asesor genera una cotización completa en menos de 2 minutos.
- Ningún monto proviene del modelo; todos de `fn_recalcular_cotizacion`.
- Ninguna cotización se envía sin confirmación humana.
- Un RUC inválido es rechazado con mensaje claro.
- La cotización generada es idéntica en formato a la plantilla aprobada.

## Fase 2 — Generación documental y campo

### 2.1 PILI Campo (aplicación autenticada separada)

Requiere: Supabase Auth, bucket de Storage con políticas, llamada multimodal,
captura sin conexión con sincronización posterior.

### 2.2 Doble entrada ciega para mediciones

**Orden obligatorio, no negociable:**

1. El técnico escribe el valor **sin ver ninguna sugerencia** → `valor_tecnico`
2. Sube la foto del display
3. El modelo propone su lectura → `valor_ia`
4. El sistema compara (`coincide`, tolerancia 0,05 Ω)
5. Si coinciden → `valor_confirmado`. Si no → alerta, nueva foto o revisión

Si el modelo propone primero, el técnico aprueba sin verificar y la validación se
vuelve decorativa. **El orden es el control.**

**Los valores numéricos se capturan en campos con unidad y rango fijos, no en
chat libre.** "siete punto seis", "7,6", "7.6" y "76" son todos texto válido en
un chat; en un campo numérico con rango, el 76 se rechaza solo.

### 2.3 Alertas automáticas

| Condición | Acción |
|---|---|
| Calibración vencida a la fecha de inspección | **Bloquea la emisión** |
| Dispersión alta entre las 4 lecturas de un punto | Advertencia: problema de medición, no de digitación |
| Promedio entre 20 y 25 Ω | Fuerza revisión del ingeniero |
| Valor fuera del rango del instrumento | Rechaza |
| Discrepancia técnico / IA | Solicita nueva foto |

El promedio lo calcula la base de datos. Nunca se lee de una foto ni se escribe a
mano.

### 2.4 Generación de documentos

Reutilizar los generadores ya construidos (`docx` y `openpyxl`) como funciones
serverless. Plantillas disponibles: certificado de sistema eléctrico, de aire
acondicionado, de pozo a tierra, informe técnico y cotización.

**Criterios de aceptación:**
- Imposible emitir con calibración vencida (probado con caso real).
- Imposible emitir con profesional no habilitado.
- Toda medición tiene foto asociada y registro de quién confirmó.
- La auditoría registra qué valores vinieron de la IA y cuáles se corrigieron.

## Fase 3 — Conocimiento, seguimiento y proveedores

### 3.1 RAG real
Migrar los 8 *system prompts* a `kb_documentos`. Generar embeddings.
Sustituir la coincidencia por palabras clave por `fn_buscar_conocimiento`.

**Regla R-02 vigente:** el RAG responde prosa. Precios y mediciones salen de SQL.

### 3.2 Seguimiento automático de vencimientos
Trabajo programado diario sobre `v_vencimientos`. A 30 días del vencimiento,
generar la cotización de renovación y notificar. **Máximo retorno del proyecto.**

### 3.3 Precios de proveedores
Los precios de material eléctrico en Perú no son públicos; se cotizan. **No
raspar sitios web:** es frágil y suele violar términos de servicio.

Camino correcto: PILI lee las listas en PDF o Excel que envían los proveedores y
actualiza `precios_proveedor`. Para lo no listado, redacta la solicitud e
interpreta la respuesta.

### 3.4 Rendimiento y limpieza
Convertir las 47 imágenes a WebP con `loading="lazy"` (de 15 MB a menos de 2 MB).
Eliminar los archivos residuales de la sección 2.5. Corregir el nombre del
proyecto en Vercel y evaluar dominio propio.

---

# PARTE V — REFERENCIA

## 7. Variables de entorno

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # solo en funciones serverless internas
GEMINI_API_KEY=                 # sin fallback: fallar si falta
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=            # para X-Hub-Signature-256
WHATSAPP_TOKEN=
TELEGRAM_BOT_TOKEN=
TELEGRAM_SECRET_TOKEN=
KV_REST_API_URL=
KV_REST_API_TOKEN=
ALLOWED_ORIGIN=
```

Ninguna con valor por defecto en el código. Si falta, la aplicación debe fallar
con un error explícito, no continuar en silencio.

## 8. Datos de referencia verificados

**Empresa:** TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C. — RUC 20601138787
Gerente General: Oscar Iván Salas Contreras, DNI 20443815
WhatsApp: 906315961 · ingenieria.teslaelectricidad@gmail.com
Colores de marca: `#A21305` (rojo), `#FFEE0E` (amarillo)

*Domicilio pendiente de confirmación en Ficha RUC (ver 2.6).*

**Profesional:** Ing. Leslie Milton Reinoso Zamudio — CIP 126355

**Instrumento:** Telurómetro digital TESTECH KT-480D, serie 20048144
Rangos: 20 Ω / 200 Ω / 2000 Ω · Earth voltage 0-200 VAC
Calibración GM-345-2025, Global Metric Lab E.I.R.L. (RUC 20612301493)
Calibrado 16/09/2025 · **Vence 16/09/2026**
Incertidumbre expandida k=2: ± 0,12 Ω a ± 0,13 Ω en el rango de 20 Ω
Trazabilidad: Dirección de Metrología del INACAL

> **Alerta operativa:** la calibración vence el 16/09/2026. A partir de esa fecha
> ningún certificado de pozo a tierra tendrá respaldo metrológico. Programar la
> recalibración.

**Normativa aplicable:**

| Norma | Contenido |
|---|---|
| CNE-U regla 060-712 | Resistencia de puesta a tierra **≤ 25 Ω** |
| NTP 370.310 | Guía de inspección; exige firma de ingeniero electricista o mecánico electricista colegiado |
| NTP 370.016:2010 | Pozos a tierra: diámetro ≥ 0,10 m, profundidad ≥ 2,40 m |
| NTP 370.052 / .053 / .056 | Materiales, conductores de protección y electrodos de cobre |

## 9. Lo que NO se debe construir

| No construir | Usar |
|---|---|
| Modelo de lenguaje propio | API existente |
| Motor de base de datos | Supabase (PostgreSQL) |
| Sistema de autenticación | Supabase Auth |
| Motor de búsqueda vectorial | pgvector |
| Pasarela de WhatsApp | API oficial de Meta |
| Transcripción de voz | API existente |
| Calendario | Google Calendar API |
| Framework de orquestación de agentes | Llamadas a funciones nativas de la API |

**Lo único propio de Tesla:** el catálogo de servicios, la estructura de precios,
las plantillas documentales, las validaciones normativas y el control de
vencimientos. Todo lo demás se alquila.

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| Alcance excesivo en fase 1 | Una sola herramienta hasta que funcione con uso real |
| El agente compromete precios o plazos | Prohibiciones explícitas + salida siempre en borrador |
| Sesgo de automatización en mediciones | Doble entrada ciega con orden forzado (R-07) |
| Datos personales enviados a un tercero | Revisar términos de uso del proveedor del modelo; nivel gratuito solo para pruebas con datos ficticios |
| Domicilio fiscal incorrecto en documentos emitidos | Resolver 2.6 antes de emitir a clientes nuevos |
| Calibración vencida el 16/09/2026 | Programar recalibración; R-03 bloquea la emisión |
| Conflictos de fusión entre agentes de código | Separar por dominio: frontend a un agente, datos y lógica al otro |

---

**Fin del documento.**
