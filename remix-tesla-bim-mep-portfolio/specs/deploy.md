# Spec: Deploy y seguridad

## Estado actual (decisión pendiente de deploy)
- Frontend: listo para Vercel (build pasa).
- Conversor: `Dockerfile` + `python/requirements.txt` + `.dockerignore` creados (imagen Python 3.11, `$PORT`, healthcheck).
- `VITE_CONVERT_URL` configura el conversor desde el frontend (def. `http://localhost:5000`).

## Plan futuro (cuando se decida)
1. Frontend → Vercel (estático, sin cambios).
2. Conversor → contenedor en Render/Railway/Fly (o Vercel Docker). Límites de tamaño y costo (free tier duerme).
3. `VITE_CONVERT_URL=https://<host>` en Vercel.
4. DWG en Linux: sustituir `dwg_to_dxf` (ODA es Windows) por `dwg2dxf` de LibreDWG dentro del contenedor.
5. Supabase/Postgres (si aplica): usar skills instaladas en `.agents/skills/supabase*`.

## Notas
- Serverless (Vercel functions/Supabase Edge) NO sirve para archivos grandes (IFC/DWG de decenas de MB): para eso es el contenedor.
- `outputs/` es efímero en contenedor; la app reconvierte cada vez (aceptado).
