"""Tesla BIM MEP — conversion API (server side).

Run:  python python/server.py
The Vite app (port 3000) uploads CAD files here; this service converts
them to .glb (or PNG previews for PDF) and returns a URL to download.

Dependencies: pip install flask ezdxf trimesh ifcopenshell pymupdf
"""
import os
import re
import sys
import uuid
import shutil
import subprocess
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cad2glb

BASE = Path(__file__).resolve().parent
OUTPUTS = BASE / 'outputs'
OUTPUTS.mkdir(exist_ok=True)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200 MB


@app.after_request
def cors(resp):
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return resp


def detect_kind(buf: bytes, ext: str) -> str:
    head = buf[:2048].lstrip(b'\xef\xbb\xbf').lstrip()
    if head.startswith(b'glTF'):
        return 'glb'
    if head[:1] == b'{':
        return 'glb'
    if head.startswith(b'ISO-10303-21') or head.startswith(b'STEP'):
        return 'ifc'
    if head.startswith(b'%PDF'):
        return 'pdf'
    if re.match(rb'AC1\d{3}', head):
        return 'dwg'
    if head.startswith(b'AutoCAD Binary DXF'):
        return 'dxfb'
    if head[:1] == b'0':
        return 'dxf'
    if b'SECTION' in head and b'HEADER' in head:
        return 'dxf'
    if ext in ('.glb', '.gltf'):
        return 'glb'
    return 'unknown'


def find_oda_converter() -> str | None:
    candidates = [
        r'C:\Program Files\ODA\ODAFileConverter\ODAFileConverter.exe',
        r'C:\Program Files\ODA\ODAFileConverter\ODAFileConverter2021.exe',
        r'C:\Program Files\ODA\ODAFileConverter\ODAFileConverter2024.exe',
        r'C:\Program Files\ODA\ODAFileConverter\ODAFileConverter2025.exe',
        r'C:\Program Files (x86)\ODA\ODAFileConverter\ODAFileConverter.exe',
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None


def dwg_to_dxf(dwg_path: Path, dxf_path: Path) -> None:
    converter = find_oda_converter()
    if converter is None:
        raise RuntimeError(
            'No se encontró ODA File Converter (gratuito). Descárgalo de https://www.opendesign.com/guestfiles/oda_file_converter '
            'e instálalo, o guarda tu plano como .dxf desde AutoCAD (GUARDAR COMO → tipo .dxf ASCII).'
        )
    work = dwg_path.parent / f'_oda_{uuid.uuid4().hex[:6]}'
    work.mkdir(exist_ok=True)
    out_dir = work / 'out'
    out_dir.mkdir(exist_ok=True)
    cmd = [converter, str(dwg_path.parent), str(out_dir), 'ACAD2018', 'DXF', '0', '1']
    subprocess.run(cmd, timeout=120, check=True)
    dxf_files = list(out_dir.glob('*.dxf'))
    if not dxf_files:
        raise RuntimeError('ODA File Converter no produjo un .dxf.')
    shutil.copy(dxf_files[0], dxf_path)
    shutil.rmtree(work, ignore_errors=True)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'ok': True, 'converter': bool(find_oda_converter())})


@app.route('/api/convert', methods=['POST'])
def convert():
    if 'file' not in request.files:
        return jsonify({'ok': False, 'error': 'No se recibió el archivo.'}), 400
    f = request.files['file']
    name = f.filename or 'archivo'
    ext = os.path.splitext(name)[1].lower()
    token = uuid.uuid4().hex[:8]
    raw = OUTPUTS / f'{token}{ext}'
    f.save(raw)
    buf = raw.read_bytes() if raw.stat().st_size < 2 * 1024 * 1024 else b''
    kind = detect_kind(buf, ext)

    glb = OUTPUTS / f'{token}.glb'

    try:
        if kind in ('dxf', 'dxfb'):
            stats = cad2glb.dxf_to_glb(str(raw), str(glb))
            raw.unlink(missing_ok=True)
            return jsonify({
                'ok': True, 'kind': 'dxf', 'file': f'/outputs/{glb.name}',
                'stats': stats, 'name': name,
            })
        if kind == 'dwg':
            dxf_tmp = OUTPUTS / f'{token}_conv.dxf'
            dwg_to_dxf(raw, dxf_tmp)
            raw.unlink(missing_ok=True)
            stats = cad2glb.dxf_to_glb(str(dxf_tmp), str(glb))
            dxf_tmp.unlink(missing_ok=True)
            return jsonify({
                'ok': True, 'kind': 'dwg', 'file': f'/outputs/{glb.name}',
                'stats': stats, 'name': name,
            })
        if kind == 'ifc':
            stats = cad2glb.ifc_to_glb(str(raw), str(glb))
            raw.unlink(missing_ok=True)
            return jsonify({
                'ok': True, 'kind': 'ifc', 'file': f'/outputs/{glb.name}',
                'stats': stats, 'name': name,
            })
        if kind == 'glb':
            shutil.copy(raw, glb)
            raw.unlink(missing_ok=True)
            return jsonify({'ok': True, 'kind': 'glb', 'file': f'/outputs/{glb.name}', 'name': name})
        if kind == 'pdf':
            pages = []
            try:
                pngs = cad2glb.pdf_to_pngs(str(raw), str(OUTPUTS / f'{token}_pdf'))
                pages = [f'/outputs/{Path(p).parent.name}/{Path(p).name}' for p in pngs]
            except Exception:
                pass
            stats = cad2glb.pdf_to_glb(str(raw), str(glb))
            raw.unlink(missing_ok=True)
            if stats is not None:
                return jsonify({
                    'ok': True, 'kind': 'pdf', 'file': f'/outputs/{glb.name}',
                    'pages': pages, 'stats': stats, 'name': name,
                })
            return jsonify({'ok': True, 'kind': 'pdf', 'pages': pages, 'name': name})
        raw.unlink(missing_ok=True)
        return jsonify({
            'ok': False, 'error':
            'Formato no reconocido o no convertible en el servidor. Sube .dxf, .dwg, .ifc, .glb o .pdf.',
        }), 422
    except Exception as e:  # noqa: BLE001
        raw.unlink(missing_ok=True)
        return jsonify({'ok': False, 'error': str(e)}), 500


@app.route('/outputs/<path:filename>')
def outputs(filename):
    return send_from_directory(OUTPUTS, filename)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'[*] Conversor CAD/IFC listo en http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, threaded=True)
