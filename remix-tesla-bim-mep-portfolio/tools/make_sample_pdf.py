"""Genera tools/sample_plano.pdf — plano vectorial de prueba (muros, columnas,
redes MEP a color y arco de puerta) para validar el levantamiento PDF -> 3D.
Uso:  python tools/make_sample_pdf.py
"""
import math
import os

import fitz

WALL = (0.30, 0.30, 0.34)
ELEC = (1.0, 0.55, 0.10)
SAN = (0.10, 0.45, 0.90)
HVAC = (0.10, 0.60, 0.25)
ACI = (0.85, 0.15, 0.15)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'sample_plano.pdf')


def main():
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)

    def wall(p1, p2, t=3.2):
        x1, y1 = p1
        x2, y2 = p2
        d = math.hypot(x2 - x1, y2 - y1)
        ux = (x2 - x1) / d
        uy = (y2 - y1) / d
        ox, oy = -uy, ux
        page.draw_line((x1 + ox * t, y1 + oy * t), (x2 + ox * t, y2 + oy * t), color=WALL, width=1.1)
        page.draw_line((x1 - ox * t, y1 - oy * t), (x2 - ox * t, y2 - oy * t), color=WALL, width=1.1)

    # perímetro exterior
    wall((100, 100), (500, 100))
    wall((500, 100), (500, 620))
    wall((500, 620), (100, 620))
    wall((100, 620), (100, 100))

    # muros interiores
    wall((300, 200), (300, 520))
    wall((110, 380), (290, 380))

    # columnas (cuadrados rellenos en esquinas)
    for cx, cy in ((110, 110), (490, 110), (110, 610), (490, 610)):
        page.draw_rect((cx - 7, cy - 7, cx + 7, cy + 7), color=None, fill=(0.35, 0.35, 0.4))

    # redes MEP a color
    page.draw_line((120, 300), (480, 300), color=ELEC, width=1.5)
    page.draw_line((300, 110), (300, 290), color=SAN, width=1.5)
    page.draw_line((110, 460), (290, 460), color=HVAC, width=1.5)
    page.draw_line((400, 600), (480, 600), color=ACI, width=1.5)

    # puerta: arco de giro (polilínea) + hoja
    arc_pts = [
        (300 + 45 * math.cos(math.radians(a)), 520 - 45 * math.sin(math.radians(a)))
        for a in range(90, 181, 10)
    ]
    page.draw_polyline(arc_pts, color=(0.2, 0.2, 0.25), width=0.8)
    page.draw_line((300, 520), (300, 565), color=(0.2, 0.2, 0.25), width=0.8)

    doc.save(OUT)
    doc.close()
    print(f'OK: {OUT}')


if __name__ == '__main__':
    main()
