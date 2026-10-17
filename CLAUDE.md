# TESLA Landing — contexto del proyecto

## Alcance (importante)

Este repositorio (`D:\TESLA_LANDIG_PAGE\tesla-landing`) es un **repo Git independiente**, separado del repo raíz `D:\TESLA_LANDIG_PAGE` (que contiene otras carpetas como `OYP_LANDIG_PAGE`, `remix-tesla-bim-mep-portfolio`, `docs`, que son proyectos distintos sin relación).

**Regla:** salvo que el usuario pida explícitamente algo en otra carpeta, todo el trabajo (lectura, edición, commits, deploys) se hace exclusivamente dentro de `tesla-landing/`. No tocar `OYP_LANDIG_PAGE/` ni las otras carpetas hermanas.

## Qué es este proyecto

Landing page de **TESLA Electricidad y Automatización S.A.C.** (empresa peruana de ingeniería eléctrica, automatización, contra incendios y acabados técnicos) con un chatbot embebido llamado **PILi**.

- Frontend: HTML/CSS/JS vanilla (`index.html`, `main.js`, `styles.css`, Tailwind vía CDN + build local con `tailwindcss` CLI a `styles-tailwind.css`).
- Backend: funciones serverless de Vercel en `api/` (`chat.js`, `save-lead.js`, `whatsapp-webhook.js`, `telegram-webhook.js`, `diagnostic.js`) + `supabaseClient.js`.
- Lógica del chatbot PILi en `lib/`: `pili-brain.js` (máquina de estados), `pili-memory.js`, `pili-multi-agent-rag.js` (arquitectura multi-agente RAG con 6 especialistas — ver `.agent/skills/pili-multi-agent/SKILL.md`), `whatsapp-notifier.js`, `whatsapp-interactive-catalog.js`.
- Base de datos: Supabase (ver `tesla_schema.sql`, `SUPABASE_INSTRUCCIONES_CLAVE.md`).
- Dev local: `node server-local.js` (Express, sirve estáticos + simula el chat sin backend real) en `:3001`, o `vercel dev` para el entorno serverless completo.
- Deploy: Vercel, proyecto `web-tesla-electricidad-y-autoamtizaci-n-s-a-c-pa1e` (ver `.vercel/project.json`). Dominio de producción: `https://web-tesla-electricidad-y-autoamtiza-psi.vercel.app`. El push a GitHub (`origin main`) **no** dispara auto-deploy — hay que correr `npx vercel --prod --yes` manualmente.
- Repo GitHub: `Oscar-Ivan-Salas/WEB-TESLA-ELECTRICIDAD-Y-AUTOAMTIZACI-N-S.A.C`, branch `main`.

## Preview local

Hay una configuración de preview en `D:\TESLA_LANDIG_PAGE\.claude\launch.json` con el nombre `"tesla-landing"` (ejecuta `node server-local.js` en el puerto 3001, con `autoPort`).

## Estado conocido / historial relevante

- **2026-10-16**: se encontró y arregló un bug real: `main.js` estaba incluido dos veces en `index.html` (línea ~1572 y ~2145), y además el botón del chat (`#chatbot-fab`) tenía doble manejador de click (`onclick` inline + `addEventListener` en `main.js`), que se cancelaban entre sí — el botón de abrir el chat no hacía nada. Se quitó el `<script src="main.js">` duplicado y el `addEventListener` redundante (quedó solo el `onclick` inline). Verificado en local y en producción. Commit `55b23c2`.
- Hay muchos archivos sueltos de respaldo/debug en la raíz (`index_cero.html`, `index_old.html`, `old_index_utf8.html`, `temp_old_index.html`, `temp_old_main.js`, `Backup_main.js`, `changes_diff.txt`, `card_code.txt`) — son versiones viejas, no se deben usar como fuente de verdad; el archivo vivo es `index.html` + `main.js`.
- La documentación en `README.md` y `ESTADO_ACTUAL.md` está desactualizada (menciona rutas en `E:\`, y dice "sin IA externa" cuando en realidad `lib/pili-multi-agent-rag.js` ya usa Gemini `gemini-flash-latest`). No confiar en esos docs sin verificar contra el código actual.

## Convenciones al trabajar aquí

- Verificar cambios de frontend levantando `server-local.js` (preview `tesla-landing`) y probando en el navegador antes de dar algo por arreglado — no basta con leer el código.
- Al desplegar a producción, confirmar con el usuario antes de correr `vercel --prod` si no fue pedido explícitamente en ese turno.
