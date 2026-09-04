"""Gate de calidad del conversor (sin dependencias extra).

Genera un DXF y un PDF vectorial sintéticos en un directorio temporal, los
convierte a GLB con el mismo motor de cad2glb, valida los resultados y sale
con código 0 (todo OK) o 1 (fallo). Los agentes del proyecto lo ejecutan antes
de dar una tarea por terminada:  python python/selfcheck.py
"""
import math
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cad2glb  # noqa: E402


def _make_dxf(path: str) -> None:
    import ezdxf
    doc = ezdxf.new('R2010', setup=True)
    doc.header['$INSUNITS'] = 4  # milimetros
    msp = doc.modelspace()
    layers = {'MUROS': (7,), 'ELECTRICAS': (2,), 'SANITARIAS': (5,), 'COLUMNAS': (1,)}
    for name in layers:
        doc.layers.add(name, color=layers[name][0])

    def wall(x1, y1, x2, y2, t=300):
        d = math.hypot(x2 - x1, y2 - y1)
        ux, uy = (x2 - x1) / d, (y2 - y1) / d
        ox, oy = -uy, ux
        msp.add_line((x1 + ox * t, y1 + oy * t), (x2 + ox * t, y2 + oy * t), dxfattribs={'layer': 'MUROS'})
        msp.add_line((x1 - ox * t, y1 - oy * t), (x2 - ox * t, y2 - oy * t), dxfattribs={'layer': 'MUROS'})

    wall(0, 0, 12000, 0)
    wall(12000, 0, 12000, 8000)
    wall(12000, 8000, 0, 8000)
    wall(0, 8000, 0, 0)
    wall(6000, 2000, 6000, 6000)
    msp.add_line((2000, 4000), (10000, 4000), dxfattribs={'layer': 'ELECTRICAS'})
    msp.add_line((6000, 1000), (6000, 1800), dxfattribs={'layer': 'SANITARIAS'})
    msp.add_circle((1000, 1000), 250, dxfattribs={'layer': 'COLUMNAS'})
    msp.add_circle((11000, 7000), 250, dxfattribs={'layer': 'COLUMNAS'})
    doc.saveas(path)


def _make_pdf(path: str) -> None:
    import fitz
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)
    wall_c = (0.30, 0.30, 0.34)

    def wall(p1, p2, t=3.2):
        x1, y1 = p1
        x2, y2 = p2
        d = math.hypot(x2 - x1, y2 - y1)
        ux, uy = (x2 - x1) / d, (y2 - y1) / d
        ox, oy = -uy, ux
        page.draw_line((x1 + ox * t, y1 + oy * t), (x2 + ox * t, y2 + oy * t), color=wall_c, width=1.1)
        page.draw_line((x1 - ox * t, y1 - oy * t), (x2 - ox * t, y2 - oy * t), color=wall_c, width=1.1)

    wall((100, 100), (500, 100))
    wall((500, 100), (500, 620))
    wall((500, 620), (100, 620))
    wall((100, 620), (100, 100))
    wall((300, 200), (300, 520))
    page.draw_line((120, 300), (480, 300), color=(1.0, 0.55, 0.10), width=1.5)  # elect
    page.draw_line((300, 110), (300, 290), color=(0.10, 0.45, 0.90), width=1.5)  # san
    for cx, cy in ((110, 110), (490, 610)):
        page.draw_rect((cx - 7, cy - 7, cx + 7, cy + 7), color=None, fill=(0.35, 0.35, 0.4))
    doc.save(path)
    doc.close()


def main() -> int:
    fails = 0
    with tempfile.TemporaryDirectory(prefix='tesla_selfcheck_') as tmp:
        # DXF
        dxf = os.path.join(tmp, 'plano.dxf')
        glb = os.path.join(tmp, 'plano.glb')
        _make_dxf(dxf)
        stats = cad2glb.dxf_to_glb(dxf, glb)
        ok_glb = os.path.exists(glb) and os.path.getsize(glb) > 500
        import trimesh
        scene = trimesh.load(glb) if ok_glb else None
        ok_meshes = scene is not None and len(getattr(scene, 'geometry', {})) >= 4
        checks = [
            ('DXF walls>0', stats.get('walls', 0) > 0),
            ('DXF mepRuns>0', stats.get('mepRuns', 0) > 0),
            ('DXF columns>0', stats.get('columns', 0) > 0),
            ('DXF GLB existe y >500B', ok_glb),
            ('DXF GLB carga y tiene geometria', ok_meshes),
        ]
        for name, passed in checks:
            print(('PASS' if passed else 'FAIL'), '|', name)
            if not passed:
                fails += 1

        # PDF
        pdf = os.path.join(tmp, 'plano.pdf')
        pdf_glb = os.path.join(tmp, 'plano_pdf.glb')
        _make_pdf(pdf)
        pstats = cad2glb.pdf_to_glb(pdf, pdf_glb)
        ok_pdf = pstats is not None and os.path.exists(pdf_glb) and os.path.getsize(pdf_glb) > 500
        pchecks = [
            ('PDF to_glb != None', pstats is not None),
            ('PDF walls>0', bool(pstats and pstats.get('walls', 0) > 0)),
            ('PDF mepRuns>0', bool(pstats and pstats.get('mepRuns', 0) > 0)),
            ('PDF GLB existe y >500B', ok_pdf),
        ]
        for name, passed in pchecks:
            print(('PASS' if passed else 'FAIL'), '|', name)
            if not passed:
                fails += 1

    print('---')
    print('RESULTADO:', 'OK' if fails == 0 else f'FALLARON {fails} CHECK(S)')
    return 0 if fails == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
