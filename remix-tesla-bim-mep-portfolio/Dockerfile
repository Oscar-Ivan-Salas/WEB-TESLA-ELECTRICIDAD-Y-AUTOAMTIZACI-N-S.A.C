# TESLA BIM MEP — Conversor CAD/IFC (DWG · DXF · IFC · PDF → GLB/PNG)
# Imagen lista para Render, Railway, Fly.io, Cloud Run o Vercel (Docker).
# Acepta peticiones de cualquier origen (CORS *) y escucha en $PORT (def. 5000).
FROM python:3.11-slim

WORKDIR /srv

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

COPY python/requirements.txt ./
RUN pip install -r requirements.txt

COPY python/cad2glb.py python/server.py ./
RUN mkdir -p /srv/outputs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5000/health', timeout=3)" || exit 1

CMD ["python", "server.py"]
