# AGENTS.md — TESLA BIM MEP Hub

Reglas operativas para agentes de IA que trabajan en este repo (metodología Ralph/Tenet).
Lee este archivo y `IMPLEMENTATION_PLAN.md` antes de tocar código.

## Qué es
App web que convierte planos CAD/PDF/IFC a 3D para auditoría MEP de edificios.
Frontend React+Vite+three.js/R3F. Conversor Python local (Flask) para formatos
que el navegador no puede leer (DWG, IFC pesado, PDF vectorial).

## Puertos (NO cambiar)
- `3000` — visor web (`npm run dev`)
- `5000` — conversor Python (`python python/server.py`)
- `3001` — landing `tesla-landing` (proyecto aparte, NO tocar)

## Gates de calidad (obligatorios antes de dar una tarea por terminada)
- Frontend: `npm run lint` (tsc --noEmit). **NO correr `npm run build` en esta laptop**
  (Vite/Rollup escribe miles de archivos + Windows Defender lo escanea en tiempo real
  → disco D: al 100% y la laptop se congela). El build SOLO corre en la nube (Vercel).
  Si es imprescindible probar el build, correrlo una sola vez y con Defender excluyendo
  `D:\TESLA_LANDIG_PAGE` (`Add-MpPreference -ExclusionPath "D:\TESLA_LANDIG_PAGE"` como admin).
- Python: `python python/selfcheck.py` (DXF+PDF→GLB válido + stats)
- End-to-end: subir `tools/sample_plano.dxf` y `tools/sample_plano.pdf` a `/api/convert` y verificar respuesta `ok:true`

## Convenciones
- UI en español, identificadores/código en inglés. Sin comentarios salvo que se pidan.
- Nombres de mesh que el visor usa para clasificar (`MepScene3D.tsx`): `wall`, `col`, `mep-<cls>`, `slab`, `door`, `struct-*`, `elec-*`, `san-*`, `hvac-*`, `ifc-*`.
- El conversor devuelve `{file, pages?, stats}` y el frontend hace fallback al navegador si no hay servidor (nunca romper la UX sin servidor).
- No subir secretos. `outputs/`, `node_modules/`, `dist/` no van al repo.

## Prerequisitos de máquina
- Python 3.11+ (verificado: 3.11.9 en este equipo).
- Dependencias Python ya instaladas: flask, ezdxf, trimesh, numpy, ifcopenshell, pymupdf.
- **DWG requiere ODA File Converter** (gratuito, opendesign.com). NO está instalado en este equipo: el servidor da un error claro pidiéndolo. Para contenedor Linux el plan es usar `dwg2dxf` (LibreDWG).
- Node 20+.

## Skills disponibles en el repo
- `.agents/skills/supabase` y `.agents/skills/supabase-postgres-best-practices` (usar cuando toquemos Supabase/Postgres).

## Regla de iteración (Ralph)
Una tarea a la vez. No mezclar refactors con features. Al terminar cada tarea:
1. Correr gates. 2. Actualizar `IMPLEMENTATION_PLAN.md` (marcar hecho). 3. Añadir aprendizajes a `progress.md`. 4. Commit solo si los gates pasan.
