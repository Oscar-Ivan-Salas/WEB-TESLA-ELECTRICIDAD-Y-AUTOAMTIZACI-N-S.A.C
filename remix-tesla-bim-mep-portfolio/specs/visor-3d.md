# Spec: Visor 3D y carga de archivos

## Comportamiento aceptado
- Dropzone acepta: `.dxf .glb .gltf .ifc .pdf` (y `.dwg`/`.dxfb` si el servidor está activo).
- Detección por contenido real (no solo extensión), en `BimMepViewer.tsx handleFile`.
- Flujo por tipo:
  - **DXF ASCII**: levantamiento 2D→3D en navegador (`src/lib/dxfExtruder.ts`, `liftDxf`).
  - **GLB/GLTF**: carga con `GLTFLoader`.
  - **IFC**: carga con `web-ifc` (`src/lib/ifcLoader.ts`); si el servidor está activo, el servidor lo convierte primero.
  - **DWG / DXF binario**: solo servidor; sin servidor → mensaje claro con instrucciones.
  - **PDF**: servidor → GLB (si es vectorial) + páginas PNG; sin servidor → panel plano con vista previa.
- El visor 3D (`MepScene3D`) muestra la escena subida (o la maqueta demo si no hay ninguna).
- Indicador "Conversor local activo/apagado" (`/health`) en el panel de carga.

## Criterios de aceptación
- [x] DXF→3D en navegador (verificado).
- [x] GLB/GLTF en navegador (verificado).
- [x] IFC en navegador (web-ifc) y por servidor.
- [x] PDF→3D vectorial por servidor (verificado con `tools/sample_plano.pdf`).
- [x] PDF→preview PNG por servidor.
- [x] Fallbacks sin servidor (DXF/GLB/IFC OK; DWG mensaje claro).
- [x] Indicador de servidor.
- [ ] Prueba manual en navegador del flujo PDF→3D completo (pendiente de validación visual).
