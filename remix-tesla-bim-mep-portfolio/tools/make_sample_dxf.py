"""Generate a sample MEP floor plan (DXF) to test the 2D->3D lift.

Draws a ~6m x 5.5m building in millimeters with layered walls, columns,
door swings and MEP linework (electrical / sanitary / ACI / HVAC).

Usage:
    python tools/make_sample_dxf.py [output.dxf]
"""
import sys
import math

import ezdxf

UNIT_MM = 4


def make_plan(path: str) -> None:
    doc = ezdxf.new("R2010", setup=True)
    doc.header["$INSUNITS"] = UNIT_MM  # millimeters

    for layer in ["MUROS", "COLUMNAS", "EJES", "TEXTOS", "ELECTRICAS",
                  "SANITARIAS", "ACI", "HVAC", "COTAS"]:
        doc.layers.add(layer)

    msp = doc.modelspace()

    def line(layer, x1, y1, x2, y2):
        msp.add_line((x1, y1), (x2, y2), dxfattribs={"layer": layer})

    def dline(layer, x1, y1, x2, y2, half):
        # double-line wall: two parallel lines half-thickness apart
        dx, dy = x2 - x1, y2 - y1
        length = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / length * half, dx / length * half
        line(layer, x1 + nx, y1 + ny, x2 + nx, y2 + ny)
        line(layer, x1 - nx, y1 - ny, x2 - nx, y2 - ny)

    # ---- Perimeter walls (mm) ----
    # building x: 0..6000, y: 0..5500
    dline("MUROS", 0, 0, 6000, 0, 120)
    dline("MUROS", 0, 5500, 6000, 5500, 120)
    dline("MUROS", 0, 0, 0, 5500, 120)
    dline("MUROS", 6000, 0, 6000, 5500, 120)

    # ---- Interior wall with door opening (y = 1150, gap x 700..1600) ----
    dline("MUROS", 0, 1150, 700, 1150, 75)
    dline("MUROS", 1600, 1150, 3000, 1150, 75)

    # Door swing arc (r=900) at the opening
    msp.add_arc((700, 1150), radius=900, start_angle=90, end_angle=180,
                dxfattribs={"layer": "MUROS"})

    # ---- Columns (r=220) on grid ----
    for x in (500, 3000, 5500):
        for y in (600, 2750, 4900):
            msp.add_circle((x, y), radius=220, dxfattribs={"layer": "COLUMNAS"})

    # ---- Axis grid (dashed, ignored by the lift) ----
    for x in (500, 3000, 5500):
        line("EJES", x, -600, x, 6100)
    for y in (600, 2750, 4900):
        line("EJES", -600, y, 6600, y)

    # ---- MEP runs ----
    line("ELECTRICAS", 2100, -150, 2100, 5600)          # cable tray
    line("SANITARIAS", 500, -150, 500, 5600)            # water main
    line("SANITARIAS", 500, 3000, 5500, 3000)           # branch
    line("ACI", 3000, -150, 3000, 5600)                 # sprinkler main
    dline("HVAC", -150, 1900, 5200, 1900, 200)          # supply duct

    # ---- Text + dimension-ish lines (ignored) ----
    msp.add_text("PLANO DE PRUEBA MEP LOD 400", height=180,
                 dxfattribs={"layer": "TEXTOS"}).set_placement((800, -800))
    line("COTAS", -400, 5900, 6400, 5900)
    line("COTAS", 0, 5650, 0, 6150)
    line("COTAS", 6000, 5650, 6000, 6150)

    doc.saveas(path)
    print(f"DXF de prueba generado: {path}")


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "tools/sample_plano.dxf"
    make_plan(out)
