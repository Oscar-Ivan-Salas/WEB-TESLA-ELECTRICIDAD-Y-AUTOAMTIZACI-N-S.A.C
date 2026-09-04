"""Validación E2E del pipeline completo (API + cliente DXF).

Simula lo que hace el navegador al subir sample_plano.dxf (cliente) y
sample_plano.pdf (servidor). Sale 0 si todo OK, 1 si falla.
Uso: python tools/validate_e2e.py [--server http://localhost:5000]
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / 'tools'
SAMPLES = {
    'dxf': TOOLS / 'sample_plano.dxf',
    'pdf': TOOLS / 'sample_plano.pdf',
}


def _multipart(path: Path, field: str = 'file') -> tuple[bytes, str]:
    boundary = b'----teslaE2EBoundary'
    data = path.read_bytes()
    body = (
        b'--' + boundary + b'\r\n'
        b'Content-Disposition: form-data; name="' + field.encode() + b'"; filename="' + path.name.encode() + b'"\r\n'
        b'Content-Type: application/octet-stream\r\n\r\n'
        + data + b'\r\n'
        b'--' + boundary + b'--\r\n'
    )
    ctype = f'multipart/form-data; boundary={boundary.decode()}'
    return body, ctype


def post_convert(server: str, path: Path) -> dict:
    body, ctype = _multipart(path)
    req = urllib.request.Request(
        f'{server.rstrip("/")}/api/convert',
        data=body,
        headers={'Content-Type': ctype},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read())


def fetch_glb(server: str, rel_path: str) -> bytes:
    url = f'{server.rstrip("/")}{rel_path}'
    with urllib.request.urlopen(url, timeout=60) as resp:
        return resp.read()


def validate_glb(data: bytes, label: str) -> bool:
    ok_size = len(data) > 500
    meshes = 0
    try:
        import trimesh
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.glb', delete=False) as tmp:
            tmp.write(data)
            tmp_path = tmp.name
        try:
            scene = trimesh.load(tmp_path)
            meshes = len(getattr(scene, 'geometry', {}))
        finally:
            os.unlink(tmp_path)
    except Exception as exc:
        print('FAIL |', label, 'GLB no cargable:', exc)
        return False
    passed = ok_size and meshes >= 4
    print(('PASS' if passed else 'FAIL'), '|', label, f'GLB {len(data)}B, {meshes} mallas')
    return passed


def run_client_dxf() -> bool:
    print('--- Cliente DXF (tsx test_lift) ---')
    r = subprocess.run(
        ['npx', 'tsx', 'tools/test_lift.ts'],
        cwd=ROOT,
        capture_output=True,
        text=True,
        shell=True,
    )
    if r.returncode != 0:
        print('FAIL | liftDxf cliente:', r.stderr or r.stdout)
        return False
    for line in r.stdout.splitlines():
        if line.startswith('Muros') or line.startswith('Mallas'):
            print('  ', line)
    walls_line = next((l for l in r.stdout.splitlines() if l.startswith('Muros')), '')
    ok = 'Muros    :' in walls_line and not walls_line.strip().endswith(': 0')
    print(('PASS' if ok else 'FAIL'), '| Cliente DXF levanta muros')
    return ok


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--server', default=os.environ.get('VITE_CONVERT_URL', 'http://localhost:5000'))
    args = parser.parse_args()
    server = args.server
    fails = 0

    # Health
    try:
        with urllib.request.urlopen(f'{server.rstrip("/")}/health', timeout=5) as resp:
            health = json.loads(resp.read())
        print('PASS | /health', health)
        if not health.get('ok'):
            fails += 1
    except urllib.error.URLError as exc:
        print('FAIL | Servidor no disponible en', server, '-', exc)
        print('  Inicia: python python/server.py')
        return 1

    if not run_client_dxf():
        fails += 1

    for kind, sample in SAMPLES.items():
        if not sample.exists():
            print('FAIL | Sample no encontrado:', sample)
            fails += 1
            continue
        print(f'--- API convert ({kind}) ---')
        try:
            data = post_convert(server, sample)
        except Exception as exc:
            print('FAIL |', kind, 'convert:', exc)
            fails += 1
            continue
        if not data.get('ok'):
            print('FAIL |', kind, 'respuesta:', data)
            fails += 1
            continue
        stats = data.get('stats') or {}
        print('PASS |', kind, 'stats:', {k: stats.get(k) for k in ('walls', 'columns', 'mepRuns') if k in stats})
        if stats.get('walls', 0) <= 0:
            print('FAIL |', kind, 'walls=0')
            fails += 1
        rel = data.get('file')
        if not rel:
            print('FAIL |', kind, 'sin file en respuesta')
            fails += 1
            continue
        glb = fetch_glb(server, rel)
        if not validate_glb(glb, kind.upper()):
            fails += 1
        if kind == 'pdf' and data.get('pages'):
            page = data['pages'][0]
            with urllib.request.urlopen(f'{server.rstrip("/")}{page}', timeout=30) as resp:
                png = resp.read()
            ok_png = len(png) > 1000 and resp.headers.get('Content-Type', '').startswith('image/')
            print(('PASS' if ok_png else 'FAIL'), '| PDF preview PNG', len(png), 'bytes')
            if not ok_png:
                fails += 1

    print('---')
    print('RESULTADO E2E:', 'OK' if fails == 0 else f'FALLARON {fails} CHECK(S)')
    return 0 if fails == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
