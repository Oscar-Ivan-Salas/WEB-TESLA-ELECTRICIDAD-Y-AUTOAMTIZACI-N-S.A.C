# progress.md — Aprendizajes del loop

## 2026-08-12
- `page.get_drawings()` de PyMuPDF devuelve items con formatos NO uniformes:
  `('l', p1, p2)`, `('c', p1..p4)`, `('re', Rect, 1)`, `('qu', Quad)`. Corregí `pdf_to_glb`
  tras error "tuple index out of range". Verificar estructura real antes de desempaquetar.
- PyMuPDF no tiene `Page.draw_arc`; usar `draw_polyline`/`draw_bezier` para arcos.
- PDF usa escala 1:100 asumida (`PT_TO_M = (0.0254/72)*100`): sin esa escala los umbrales
  de emparejamiento de muros (0.06–0.6 m) no aplican y no se levanta nada.
- Los dev servers de Vite que quedan huérfanos (puerto 3002) confunden al usuario: matar
  procesos viejos y estandarizar puerto 3000.
- `Start-Job` de PowerShell muere al cerrar el shell: usar `Start-Process -WindowStyle Hidden`
  con logs en `%TEMP%` para servidores persistentes.
- ODA File Converter NO está instalado: DWG falla con error claro (comportamiento correcto,
  prerequisito documentado en AGENTS.md).
- `python/selfcheck.py` es el gate del conversor: genera sus propios DXF/PDF sintéticos en un
  tempdir, convierte con el mismo motor y valida GLB+stats. 9/9 PASS en la primera corrida.
- PyMuPDF avisa "fitz API deprecated, use `import pymupdf`": funciona hoy; migrar imports en un
  futuro mantenimiento (no urgente).
- End-to-end vía API verificado: GLB y PNG se sirven desde /outputs con HTTP 200 y content-type
  correcto. Lo que falta es la validación visual en el navegador (subir archivo y ver el 3D).
- CONGELAMIENTOS DE LAPTOP: `npm run build` (Vite/Rollup) escribe miles de archivos y Windows
  Defender los escanea en tiempo real → disco D: al 100% y el equipo se congela (4 veces, todas
  durante el build). No es RAM (solo 3.8/15.9 GB usados) ni procesos zombie (solo opencode, IO=0).
  Política: NO correr build local; lint es el gate. Fix opcional: excluir D:\TESLA_LANDIG_PAGE
  de Defender.
- VISOR RENDIMIENTO: se añadió `quality` ('alto'|'medio'|'bajo', default 'medio'). 'medio' elimina
  MeshReflectorMaterial, sombras 1024, bloom ligero, dpr 1.5, ContactShadows frames=1.
  'bajo' sin efectos/sombras/niebla. autoRotate default false.
- VISIBILIDAD MODELOS SUBIDOS: `applyPBRByMeshName(root, {replaceMaterials:false})` para modelos
  subidos (PDF/IFC/GLB) — conservan materiales opacos del conversor y solo reciben userData.layer.
  Antes PBR.structure (opacidad 0.18) los dejaba casi invisibles ("falta mucho / no se genera el
  plano").
