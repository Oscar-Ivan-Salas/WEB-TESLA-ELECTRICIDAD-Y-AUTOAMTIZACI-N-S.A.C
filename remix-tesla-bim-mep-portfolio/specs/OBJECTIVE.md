# Objetivo (congelado)

Construir un **Hub de Ingeniería BIM/MEP** web que permita a un ingeniero subir un
plano (DXF, DWG, PDF) o modelo (GLB, IFC) y obtener en segundos:

1. **Levantamiento 2D→3D** del plano (muros, columnas, redes MEP) visualizado en un visor 3D navegable.
2. **Metrados automáticos** (n.º de muros, columnas, tramos MEP, área) por archivo.
3. **Pre-auditoría de redes** (eléctricas, sanitarias, incendio/ACI, HVAC).
4. Flujo 100% local (sin envío a nube) con conversor Python opcional; el frontend degrada elegantemente sin servidor.

## Criterios de éxito
- Subir un plano vectorial (DXF o PDF) muestra su versión 3D en el visor.
- Los formatos pesados (DWG/IFC/PDF) se convierten con el conversor local.
- Sin servidor, DXF/GLB/IFC siguen funcionando en el navegador.
- Los gates de calidad pasan antes de cada commit.
- Deploy futuro (no decidido aún): frontend en Vercel + conversor en contenedor (Docker).
