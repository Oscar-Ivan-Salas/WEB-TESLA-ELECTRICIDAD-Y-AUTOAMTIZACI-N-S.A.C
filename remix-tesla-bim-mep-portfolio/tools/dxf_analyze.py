"""Analyze a DXF floor plan to calibrate the 2D->3D lift heuristics.

Prints: units, entity counts, layers, wall-pair candidates (parallel double
lines), extents and a suggested fit for the 3D viewer.

Usage:
    python tools/dxf_analyze.py path/to/plano.dxf
"""
import sys
import math

import ezdxf

UNITS = {
    0: ("unitless", 0.001),
    1: ("pulgadas", 0.0254),
    2: ("pies", 0.3048),
    3: ("yardas", 0.9144),
    4: ("milimetros", 0.001),
    5: ("centimetros", 0.01),
    6: ("metros", 1.0),
}

WALL_MIN = 0.06
WALL_MAX = 0.60


def main(path: str) -> None:
    doc = ezdxf.readfile(path)
    msp = doc.modelspace()

    ins = doc.header.get("$INSUNITS", 0)
    name, factor = UNITS.get(ins, ("?", 0.001))
    print(f"== ARCHIVO: {path}")
    print(f"Unidades: {name} (factor x{factor})")

    from collections import Counter
    types = Counter(e.dxftype() for e in msp)
    print(f"Entidades: {dict(types)}")

    layers = Counter(e.dxf.layer for e in msp)
    print("\nCapas:")
    for layer, n in sorted(layers.items(), key=lambda kv: -kv[1]):
        print(f"  {layer:<20} {n}")

    segs = []
    for e in msp:
        if e.dxftype() == "LINE":
            s, t = e.dxf.start, e.dxf.end
            segs.append((s.x * factor, s.y * factor, t.x * factor, t.y * factor))
        elif e.dxftype() == "LWPOLYLINE":
            pts = list(e.get_points("xy"))
            for i in range(len(pts) - 1):
                a, b = pts[i], pts[i + 1]
                segs.append((a[0] * factor, a[1] * factor, b[0] * factor, b[1] * factor))
            if e.closed and len(pts) > 2:
                a, b = pts[-1], pts[0]
                segs.append((a[0] * factor, a[1] * factor, b[0] * factor, b[1] * factor))

    def seg_info(s):
        dx, dy = s[2] - s[0], s[3] - s[1]
        length = math.hypot(dx, dy)
        return dx, dy, length

    segs = [s for s in segs if seg_info(s)[2] > 0.05]

    paired = 0
    thickness_hist = Counter()
    used = set()
    for i in range(len(segs)):
        if i in used:
            continue
        dxa, dya, la = seg_info(segs[i])
        nxa, nya = -dya / la, dxa / la
        for j in range(i + 1, len(segs)):
            if j in used:
                continue
            dxb, dyb, lb = seg_info(segs[j])
            dot = (dxa / la) * (dxb / lb) + (dya / la) * (dyb / lb)
            if abs(dot) < 0.996:
                continue
            dist = abs(nxa * (segs[j][0] - segs[i][0]) + nya * (segs[j][1] - segs[i][1]))
            if not (WALL_MIN <= dist <= WALL_MAX):
                continue
            proj_a = (segs[j][0] - segs[i][0]) * (dxa / la) + (segs[j][1] - segs[i][1]) * (dya / la)
            proj_b = (segs[j][2] - segs[i][0]) * (dxa / la) + (segs[j][3] - segs[i][1]) * (dya / la)
            lo, hi = min(proj_a, proj_b), max(proj_a, proj_b)
            overlap = max(0.0, min(la, hi) - max(0.0, lo)) / min(la, lb)
            if overlap > 0.5:
                paired += 1
                used.add(i)
                used.add(j)
                thickness_hist[round(dist, 3)] += 1
                break

    print(f"\nPares de lineas (candidatos a muro): {paired}")
    if thickness_hist:
        top = thickness_hist.most_common(6)
        print("Histograma de espesor de muro (m):")
        for t, n in top:
            print(f"  {t:.3f} m  ->  {n} muros")

    all_x = [s[0] for s in segs] + [s[2] for s in segs]
    all_y = [s[1] for s in segs] + [s[3] for s in segs]
    if all_x:
        minx, maxx = min(all_x), max(all_x)
        miny, maxy = min(all_y), max(all_y)
        w, h = maxx - minx, maxy - miny
        print(f"\nExtents (m): {w:.2f} x {h:.2f}")
        print(f"Area envolvente: {w * h:.1f} m2")
        fit = max(w, h)
        print(f"Sugerencia de ajuste visor: {'escala 1:1' if fit <= 8 else f'escala {8 / fit:.3f} (para encajar en ~8m)'}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python tools/dxf_analyze.py plano.dxf")
        sys.exit(1)
    main(sys.argv[1])
