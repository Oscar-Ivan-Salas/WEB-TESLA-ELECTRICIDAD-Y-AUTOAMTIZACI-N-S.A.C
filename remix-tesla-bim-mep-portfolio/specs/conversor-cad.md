# Spec: Conversor CAD (Python)

Servidor Flask en `python/server.py`, motor en `python/cad2glb.py`.

## Comportamiento aceptado
- Endpoints:
  - `GET /health` → `{"ok": true, "converter": bool(ODA instalado)}`
  - `POST /api/convert` (multipart `file`) → `{ok, kind, file?, pages?, stats?, error?}`
  - `GET /outputs/<path>` sirve GLB y PNG generados.
- Formatos:
  - **DXF/DXF binario** → GLB vía `dxf_to_glb` (ezdxf).
  - **DWG** → ODA File Converter a DXF → GLB. Si no hay ODA: error claro.
  - **IFC** → GLB vía `ifc_to_glb` (ifcopenshell).
  - **PDF** → `pdf_to_glb` (vectorial: `page.get_drawings()`, escala 1:100 asumida, clasificación por color de trazo) + `pdf_to_pngs` (preview). Si no hay vectorial, solo páginas.
- Motor de levantamiento compartido `lift_segments()` + `export_meshes()` (refactor sin cambio de comportamiento para DXF).
- CORS abierto (`*`). Límite de subida 200 MB. Escucha en `$PORT` (def. 5000), host `0.0.0.0`.

## Criterios de aceptación
- [x] DXF→GLB (regresión verificada: `walls:6, columns:9, mepRuns:6`).
- [x] PDF→GLB (verificado: `walls:15, columns:4, mepRuns:4`).
- [x] PDF→PNG (verificado: `page_1.png`, HTTP 200).
- [x] IFC→GLB (código, sin archivo de prueba aún).
- [ ] DWG→GLB (requiere ODA File Converter; no instalado en este equipo).
- [ ] Gate automatizado `python/selfcheck.py` (pendiente de crear).
