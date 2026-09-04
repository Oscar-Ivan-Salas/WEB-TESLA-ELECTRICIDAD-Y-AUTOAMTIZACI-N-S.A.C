# IMPLEMENTATION_PLAN.md — TESLA BIM MEP Hub

Prioridad: desc. `[x]` = hecho y verificado por gates. `[ ]` = pendiente.

## Hito 1 — Núcleo local funcional
- [x] Visor 3D multi-especialidad + modo comparador (MepScene3D) — 2026-08-11
- [x] DXF→3D en navegador (`src/lib/dxfExtruder.ts`) — 2026-08-11
- [x] IFC→3D en navegador (web-ifc) — 2026-08-11
- [x] Carga GLB/GLTF — 2026-08-11
- [x] Conversor Python: DXF/DWG/IFC/PDF→GLB + PDF→PNG — 2026-08-11
- [x] Refactor motor compartido `lift_segments`/`export_meshes` (DXF sin cambios) — 2026-08-12
- [x] PDF vectorial→3D (`pdf_to_glb`) — 2026-08-12 (verificado: walls:15, columns:4, mepRuns:4)
- [x] Frontend: indicador de servidor + fallbacks sin servidor — 2026-08-12
- [x] `tools/sample_plano.pdf` + `tools/make_sample_pdf.py` — 2026-08-12

## Hito 2 — Calidad (gates)
- [x] Crear `python/selfcheck.py` (DXF+PDF→GLB válido + stats, exit no-cero si falla) — 2026-08-12 (RESULTADO: OK)
- [x] Gate frontend: `npm run lint` + `npm run build` verdes — 2026-08-12
- [x] End-to-end API: `sample_plano.dxf`→GLB (walls:6) y `sample_plano.pdf`→GLB+PNG (walls:15) en /api/convert — 2026-08-12
- [ ] Validación visual en navegador: subir PDF y DXF en http://localhost:3000 y ver el 3D levantado

## Hito 3 — DWG
- [ ] Instalar ODA File Converter (prereq) y probar DWG real local
- [ ] (futuro) `dwg2dxf` LibreDWG en el Dockerfile para Linux

## Hito 4 — Deploy (decisión pendiente)
- [ ] Frontend → Vercel
- [ ] Conversor → contenedor (Render/Railway/Fly o Vercel Docker) + `VITE_CONVERT_URL`
- [ ] Supabase/Postgres si aplica (usar skills `.agents/skills/supabase*`)

## Historias pequeñas (para iterar de a una)
1. `selfcheck.py` corre y pasa con los samples existentes.
2. Los gates frontend corren verdes tras cada cambio.
3. Subir `sample_plano.pdf` en el navegador muestra el modelo 3D levantado.
4. Subir `sample_plano.dxf` en el navegador muestra el modelo 3D levantado.
5. Sin servidor (5000 apagado), DXF/GLB/IFC siguen funcionando y DWG da mensaje claro.
