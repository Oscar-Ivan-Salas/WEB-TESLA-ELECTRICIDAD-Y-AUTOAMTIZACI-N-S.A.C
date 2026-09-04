"""CAD → GLB converter (server side).

Reads DWG/DXF/IFC/GLB/GLTF and produces a .glb ready for the Tesla MEP
viewer. Mesh names are chosen so the viewer auto-classifies materials and
layers (see MepScene3D.tsx classify()).
"""
import math
import re
import os
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

WALL_H = 2.7
SLAB_MARGIN = 0.6
FIT_EXTENT = 8.0

UNIT_FACTORS = {
    0: 0.001,  # unitless -> mm assumption
    1: 0.0254,
    2: 0.3048,
    3: 0.9144,
    4: 0.001,  # millimeters
    5: 0.01,   # centimeters
    6: 1.0,    # meters
}
UNIT_NAMES = {
    0: 'unitless (asumido mm)',
    1: 'pulgadas',
    2: 'pies',
    3: 'yardas',
    4: 'milimetros',
    5: 'centimetros',
    6: 'metros',
}

IGNORE_RE = re.compile(r'(EJES|AXIS|GRID|DIM|ACOTE|COTA|TEXT|TEXTO|REF)', re.I)
ELEC_RE = re.compile(r'(ELEC|ELECTR|BANDEJA|TRAY|CONDUIT|PANEL|TABLERO|ALUMB|LUMIN|POWER|PLU|CONTROL)', re.I)
SAN_RE = re.compile(r'(SANIT|AGUA|DESAG|ABAST|WATER|PLUV|TUBER|PIPE|SS-|SAP)', re.I)
ACI_RE = re.compile(r'(ACI|CONTRA|FIRE|SPRINK|ROCI|EXTINT|SUPRES|BOMBER)', re.I)
HVAC_RE = re.compile(r'(HVAC|DUCT|CLIMA|VENT|AIRE|SUPPLY|RETURN|EXTRAC|VAV|AHU)', re.I)
WALL_RE = re.compile(r'(MURO|WALL|PARED|MAMP|TABIQ|COLUMNA|COLUMN|ESTRUCT|STRUCT|VIGA|BEAM|LOSA|SLAB)', re.I)

COLORS = {
    'wall': 0x7a8698,
    'structure': 0x8f9aac,
    'slab': 0x3d4a5c,
    'door': 0x9aa5b5,
    'electrical': 0xffb800,
    'sanitary': 0x00a8e8,
    'aci': 0xe63946,
    'hvac': 0xb0b8c8,
    'generic': 0x8fa8c8,
}

RUN_H = {'electrical': 0.85, 'sanitary': 0.35, 'aci': 0.95, 'hvac': 0.5}


def classify_layer(layer: str) -> str:
    n = layer.upper()
    if IGNORE_RE.search(n):
        return 'ignore'
    if ELEC_RE.search(n):
        return 'electrical'
    if SAN_RE.search(n):
        return 'sanitary'
    if ACI_RE.search(n):
        return 'aci'
    if HVAC_RE.search(n):
        return 'hvac'
    if WALL_RE.search(n):
        return 'wall'
    return 'other'


class Seg:
    __slots__ = ('x1', 'y1', 'x2', 'y2', 'len', 'ang', 'layer', 'cls', 'used')

    def __init__(self, x1, y1, x2, y2, layer, cls):
        self.x1, self.y1, self.x2, self.y2 = x1, y1, x2, y2
        self.len = math.hypot(x2 - x1, y2 - y1)
        self.ang = math.atan2(y2 - y1, x2 - x1)
        self.layer = layer
        self.cls = cls
        self.used = False


def _mat(hexcolor, opacity=1.0, metal=0.05, rough=0.9):
    r = ((hexcolor >> 16) & 255) / 255.0
    g = ((hexcolor >> 8) & 255) / 255.0
    b = (hexcolor & 255) / 255.0
    return PBRMaterial(
        baseColorFactor=[r, g, b, opacity],
        metallicFactor=metal,
        roughnessFactor=rough,
    )


def _seg_dist(a: Seg, b: Seg) -> float:
    nx = -(a.y2 - a.y1) / a.len
    ny = (a.x2 - a.x1) / a.len
    return abs(nx * (b.x1 - a.x1) + ny * (b.y1 - a.y1))


def _overlap(a: Seg, b: Seg) -> float:
    ax = (a.x2 - a.x1) / a.len
    ay = (a.y2 - a.y1) / a.len
    p1 = (b.x1 - a.x1) * ax + (b.y1 - a.y1) * ay
    p2 = (b.x2 - a.x1) * ax + (b.y2 - a.y1) * ay
    lo = max(0.0, min(p1, p2))
    hi = min(a.len, max(p1, p2))
    return max(0.0, hi - lo) / min(a.len, b.len)


def _add_box(meshes, name, cx, cy, cz_center, ex, ey, ez, ang, color_key, opacity=1.0, metal=0.05, rough=0.9):
    T = np.eye(4)
    R = trimesh.transformations.rotation_matrix(-ang, [0, 1, 0])
    Tr = trimesh.transformations.translation_matrix([cx, cz_center, cy])
    mesh = trimesh.creation.box(extents=[ex, ey, ez], transform=Tr @ R)
    mesh.visual = trimesh.visual.TextureVisuals(material=_mat(COLORS[color_key], opacity, metal, rough))
    mesh.metadata['name'] = name
    meshes.append(mesh)


def _add_seg_box(meshes, name, x1, y1, x2, y2, height, thickness, color_key):
    """Thin box following a segment between two plan points (for arcs)."""
    d = math.hypot(x2 - x1, y2 - y1)
    if d < 1e-4:
        return
    ang = math.atan2(y2 - y1, x2 - x1)
    _add_box(meshes, name, (x1 + x2) / 2, (y1 + y2) / 2, height / 2, d, height, thickness, ang, color_key, opacity=0.8)


def lift_segments(segs, circles, arcs):
    """Lift 2D plan primitives (already in meters) into 3D meshes.

    Pairs of near-parallel lines become wall boxes, single long lines become
    thin walls, colored MEP lines become overhead runs, circles become columns
    and door-swing arcs become door markers. Returns (meshes, partial stats).
    """
    wall_segs = [s for s in segs if s.cls == 'wall']
    run_segs = [s for s in segs if s.cls in ('electrical', 'sanitary', 'aci', 'hvac')]

    meshes = []
    warnings = []
    wall_count = 0

    # pair parallel lines -> walls
    for i, a in enumerate(wall_segs):
        if a.used:
            continue
        for b in wall_segs[i + 1:]:
            if b.used:
                continue
            ux = (a.x2 - a.x1) / a.len
            uy = (a.y2 - a.y1) / a.len
            dot = abs(ux * ((b.x2 - b.x1) / b.len) + uy * ((b.y2 - b.y1) / b.len))
            d = _seg_dist(a, b)
            ov = _overlap(a, b)
            if dot > 0.996 and 0.06 <= d <= 0.6 and ov > 0.5:
                cx = (a.x1 + a.x2 + b.x1 + b.x2) / 4
                cy = (a.y1 + a.y2 + b.y1 + b.y2) / 4
                _add_box(meshes, 'wall', cx, cy, WALL_H / 2 - 0.02, min(a.len, b.len) * 0.98, WALL_H, d, a.ang, 'wall', opacity=1.0)
                a.used = True
                b.used = True
                wall_count += 1
                break

    # single wall lines
    for s in wall_segs:
        if s.used:
            continue
        if s.len > 0.8:
            _add_box(meshes, 'wall', (s.x1 + s.x2) / 2, (s.y1 + s.y2) / 2, WALL_H / 2 - 0.02, s.len, WALL_H, 0.15, s.ang, 'wall')
            s.used = True
            wall_count += 1

    mep_runs = 0
    for s in run_segs:
        if s.len < 0.3:
            continue
        box = 0.4 if s.cls == 'hvac' else 0.1
        op = 0.65 if s.cls != 'hvac' else 0.5
        _add_box(meshes, 'mep-' + s.cls, (s.x1 + s.x2) / 2, (s.y1 + s.y2) / 2, RUN_H[s.cls], s.len, box, box, s.ang, s.cls, opacity=op, metal=0.85, rough=0.2)
        mep_runs += 1

    column_count = 0
    for c in circles:
        if c['r'] < 0.06 or c['r'] > 0.7:
            continue
        cyl = trimesh.creation.cylinder(radius=c['r'], height=WALL_H, sections=20)
        T = trimesh.transformations.translation_matrix([c['x'], WALL_H / 2 - 0.02, c['y']])
        cyl.apply_transform(T)
        cyl.visual = trimesh.visual.TextureVisuals(material=_mat(COLORS['structure'], 1.0, 0.12, 0.85))
        cyl.metadata['name'] = 'col'
        meshes.append(cyl)
        column_count += 1

    door_count = 0
    for a in arcs:
        if not (0.5 <= a['r'] <= 1.6):
            continue
        sweep = math.degrees(abs(a['a2'] - a['a1']))
        if sweep < 60 or sweep > 130:
            continue
        steps = 12
        pts = []
        for k in range(steps + 1):
            ang = a['a1'] + (a['a2'] - a['a1']) * k / steps
            pts.append((a['x'] + math.cos(ang) * a['r'], a['y'] + math.sin(ang) * a['r']))
        for k in range(steps):
            _add_seg_box(meshes, 'door', pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], 0.04, 0.02, 'door')
        door_count += 1

    if wall_count == 0:
        warnings.append('No se detectaron muros por pares de líneas; el plano puede no contener geometría de muros.')

    return meshes, {
        'walls': wall_count,
        'columns': column_count,
        'mepRuns': mep_runs,
        'doors': door_count,
        'warnings': warnings,
    }


def export_meshes(meshes, out, unit_name, layers):
    """Add a slab, center + fit the model to FIT_EXTENT and export .glb."""
    if meshes:
        stack = np.vstack([m.bounds for m in meshes])
        mn = stack.min(axis=0)
        mx = stack.max(axis=0)
        area_m2 = int(round((mx[0] - mn[0]) * (mx[2] - mn[2])))
        sx = (mn[0] + mx[0]) / 2
        sz = (mn[2] + mx[2]) / 2
        _add_box(meshes, 'slab', sx, sz, -0.08, mx[0] - mn[0] + SLAB_MARGIN * 2, 0.12, mx[2] - mn[2] + SLAB_MARGIN * 2, 0.0, 'slab', opacity=1.0, rough=0.95)
    else:
        area_m2 = 0

    stack = np.vstack([m.bounds for m in meshes])
    mn = stack.min(axis=0)
    mx = stack.max(axis=0)
    extent = max(mx[0] - mn[0], mx[2] - mn[2])
    fit_scaled = False
    if extent > FIT_EXTENT:
        f = FIT_EXTENT / extent
        for m in meshes:
            m.apply_transform(np.diag([f, f, f, 1.0]))
        fit_scaled = True

    stack = np.vstack([m.bounds for m in meshes])
    mn = stack.min(axis=0)
    mx = stack.max(axis=0)
    center = (mn + mx) / 2
    for m in meshes:
        m.apply_translation([-center[0], 0.0, -center[2]])

    scene = trimesh.Scene()
    for i, m in enumerate(meshes):
        scene.add_geometry(m, geom_name=m.metadata.get('name', f'm{i}'))
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    scene.export(out)

    return {
        'areaM2': area_m2,
        'extentM': round(extent, 1),
        'unit': unit_name,
        'layers': layers,
        'fitScaled': fit_scaled,
    }


# ---------------------------------------------------------------------------
# DXF (ASCII / binary) → GLB
# ---------------------------------------------------------------------------
def dxf_to_glb(src: str, out: str):
    import ezdxf
    doc = ezdxf.readfile(src)
    msp = doc.modelspace()

    unit_code = doc.header.get('$INSUNITS', 4)
    scale = UNIT_FACTORS.get(unit_code, 0.001)
    unit_name = UNIT_NAMES.get(unit_code, 'desconocido')

    segs = []
    circles = []
    arcs = []
    layers = set()

    def add_seg(e, cls, x1, y1, x2, y2):
        s = Seg(x1 * scale, y1 * scale, x2 * scale, y2 * scale, e.dxf.layer, cls)
        if s.len >= 0.05:
            segs.append(s)

    for e in msp:
        try:
            layer = e.dxf.layer
        except Exception:
            continue
        if not layer:
            layer = '0'
        layers.add(layer)
        cls = classify_layer(layer)
        if cls == 'ignore':
            continue
        if e.dxftype() == 'LINE':
            add_seg(e, cls, e.dxf.start.x, e.dxf.start.y, e.dxf.end.x, e.dxf.end.y)
        elif e.dxftype() == 'LWPOLYLINE':
            pts = [(p[0], p[1]) for p in e.get_points()]
            closed = e.closed
            if len(pts) >= 2:
                for i in range(len(pts) - 1):
                    add_seg(e, cls, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1])
                if closed and len(pts) > 2:
                    add_seg(e, cls, pts[-1][0], pts[-1][1], pts[0][0], pts[0][1])
            if closed and cls == 'wall' and len(pts) == 4:
                xs = [p[0] * scale for p in pts]
                ys = [p[1] * scale for p in pts]
                w = max(xs) - min(xs)
                h = max(ys) - min(ys)
                if 0.12 < w < 1.2 and 0.12 < h < 1.2:
                    circles.append({'x': (min(xs) + max(xs)) / 2, 'y': (min(ys) + max(ys)) / 2, 'r': min(w, h) / 2})
        elif e.dxftype() == 'CIRCLE':
            c = e.dxf.center
            circles.append({'x': c.x * scale, 'y': c.y * scale, 'r': e.dxf.radius * scale})
        elif e.dxftype() == 'ARC':
            c = e.dxf.center
            arcs.append({
                'x': c.x * scale, 'y': c.y * scale, 'r': e.dxf.radius * scale,
                'a1': math.radians(e.dxf.start_angle), 'a2': math.radians(e.dxf.end_angle),
            })

    # dedupe
    deduped = []
    for s in segs:
        dup = any(math.hypot(s.x1 - d.x1, s.y1 - d.y1) < 0.02 and math.hypot(s.x2 - d.x2, s.y2 - d.y2) < 0.02 for d in deduped)
        if not dup:
            deduped.append(s)
    segs = deduped

    meshes, lift_stats = lift_segments(segs, circles, arcs)
    out_stats = export_meshes(meshes, out, unit_name, sorted(layers)[:40])
    return {**lift_stats, **out_stats}


# ---------------------------------------------------------------------------
# PDF (vector) → GLB
# ---------------------------------------------------------------------------
# 1 PDF point = 1/72 in. We assume a typical plot scale of 1:100 so the real
# dimensions land in the same thresholds used by the DXF lifting algorithm.
PT_TO_M = (0.0254 / 72.0) * 100.0


def classify_pdf_color(color):
    """Map a PDF stroke color (0-1 RGB) to a MEP class, like DXF layer names."""
    if not color:
        return 'wall'
    r, g, b = (float(x) for x in color)
    mx = max(r, g, b)
    mn = min(r, g, b)
    sat = (mx - mn) / mx if mx > 0 else 0.0
    if sat < 0.18:
        return 'wall'
    if r > 0.55 and b < 0.5 and g < r:
        return 'aci' if (r > 0.7 and g < 0.45) else 'electrical'
    if b > 0.5 and r < 0.6:
        return 'sanitary'
    if g > 0.4 and r < 0.55 and b < 0.55:
        return 'hvac'
    if r > 0.4 and g > 0.35 and b < 0.3:
        return 'electrical'
    return 'wall'


def _bezier_samples(p1, p2, p3, p4, n=18):
    pts = []
    for k in range(n + 1):
        t = k / n
        u = 1 - t
        pts.append((
            u**3 * p1.x + 3 * u**2 * t * p2.x + 3 * u * t**2 * p3.x + t**3 * p4.x,
            u**3 * p1.y + 3 * u**2 * t * p2.y + 3 * u * t**2 * p3.y + t**3 * p4.y,
        ))
    return pts


def _fit_circle(pts):
    cx = sum(p[0] for p in pts) / len(pts)
    cy = sum(p[1] for p in pts) / len(pts)
    rs = [math.hypot(p[0] - cx, p[1] - cy) for p in pts]
    r = sum(rs) / len(rs)
    resid = (sum(abs(v - r) for v in rs) / len(rs)) / r if r > 0 else 1.0
    return cx, cy, r, resid


def pdf_to_glb(src: str, out: str):
    """Lift a vector PDF floor plan to a 3D GLB (same engine as DXF).

    Returns the stats dict, or None if the PDF has no usable vector linework
    (i.e. it is a raster/scan-only document).
    """
    import fitz  # PyMuPDF

    doc = fitz.open(src)
    try:
        for i in range(min(doc.page_count, 8)):
            page = doc.load_page(i)
            segs = []
            circles = []
            arcs = []
            layers = {'PDF'}

            def add_seg(x1, y1, x2, y2, cls):
                s = Seg(x1 * PT_TO_M, y1 * PT_TO_M, x2 * PT_TO_M, y2 * PT_TO_M, 'PDF', cls)
                if s.len >= 0.05:
                    segs.append(s)

            for d in page.get_drawings():
                cls = classify_pdf_color(d.get('color'))
                fill = d.get('fill')
                for it in d.get('items', []):
                    kind = it[0]
                    if kind == 'l':
                        add_seg(it[1].x, it[1].y, it[2].x, it[2].y, cls)
                    elif kind == 're':
                        r = it[1]
                        x0, y0, x1, y1 = r.x0, r.y0, r.x1, r.y1
                        corners = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
                        for k in range(4):
                            ax, ay = corners[k]
                            bx, by = corners[(k + 1) % 4]
                            add_seg(ax, ay, bx, by, cls)
                        if fill is not None:
                            w = x1 - x0
                            h = y1 - y0
                            if 0.12 < w * PT_TO_M < 0.8 and 0.12 < h * PT_TO_M < 0.8:
                                circles.append({
                                    'x': ((x0 + x1) / 2) * PT_TO_M,
                                    'y': ((y0 + y1) / 2) * PT_TO_M,
                                    'r': min(w, h) * PT_TO_M / 2,
                                })
                    elif kind == 'qu':
                        q = it[1]
                        qpts = [q.ul, q.ur, q.lr, q.ll]
                        for k in range(4):
                            add_seg(qpts[k].x, qpts[k].y, qpts[(k + 1) % 4].x, qpts[(k + 1) % 4].y, cls)
                    elif kind == 'c':
                        pts = _bezier_samples(it[1], it[2], it[3], it[4])
                        cx, cy, r, resid = _fit_circle(pts)
                        r_m = r * PT_TO_M
                        start = pts[0]
                        end = pts[-1]
                        closed = math.hypot(end[0] - start[0], end[1] - start[1]) < r * 0.2
                        if resid < 0.05 and r_m > 0.03:
                            if closed and 0.06 <= r_m <= 0.7:
                                circles.append({'x': cx * PT_TO_M, 'y': cy * PT_TO_M, 'r': r_m})
                            elif not closed and 0.4 <= r_m <= 1.8:
                                arcs.append({
                                    'x': cx * PT_TO_M, 'y': cy * PT_TO_M, 'r': r_m,
                                    'a1': math.atan2(start[1] - cy, start[0] - cx),
                                    'a2': math.atan2(end[1] - cy, end[0] - cx),
                                })
                            else:
                                for k in range(len(pts) - 1):
                                    add_seg(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], cls)
                        else:
                            for k in range(len(pts) - 1):
                                add_seg(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], cls)

            if len(segs) < 8:
                continue

            meshes, lift_stats = lift_segments(segs, circles, arcs)
            if not meshes:
                continue
            out_stats = export_meshes(meshes, out, 'puntos PDF (escala asumida 1:100)', sorted(layers))
            return {**lift_stats, **out_stats}
        return None
    finally:
        doc.close()


# ---------------------------------------------------------------------------
# IFC → GLB
# ---------------------------------------------------------------------------
def ifc_type_layer(type_name: str) -> str:
    t = type_name.upper()
    if t in ('IFCWALL', 'IFCWALLSTANDARDCASE', 'IFCSLAB', 'IFCCOLUMN', 'IFCBEAM', 'IFCCOVERING', 'IFCFOOTING'):
        return 'structure'
    if t in ('IFCDUCTSEGMENT', 'IFCDUCTFITTING', 'IFCFLOWTERMINAL', 'IFCAIRTERMINAL', 'IFCDAMPER', 'IFCFLOWCONTROLLER'):
        return 'hvac'
    if t in ('IFCPIPESEGMENT', 'IFCPIPEFITTING', 'IFCPUMP', 'IFCVALVE', 'IFCTANK', 'IFCSANITARYTERMINAL', 'IFCWASTETERMINAL'):
        return 'sanitary'
    if t in ('IFCCABLECARRIERSEGMENT', 'IFCCABLESEGMENT', 'IFCEQUIPMENT', 'IFCELECTRICDISTRIBUTIONPOINT', 'IFCSWITCHINGDEVICE', 'IFCFLOWSEGMENT'):
        return 'electrical'
    return 'generic'


def ifc_to_glb(src: str, out: str):
    import ifcopenshell
    import ifcopenshell.geom
    ifc_file = ifcopenshell.open(src)

    settings = ifcopenshell.geom.settings()
    settings.set(settings.USE_WORLD_COORDS, True)
    settings.set(settings.EXCLUDE_SOLIDS_AND_SURFACES, False)

    counts = {}
    meshes = []
    try:
        iterator = ifcopenshell.geom.iterator(settings, ifc_file, include=None, verbose=False)
    except Exception:
        iterator = None

    if iterator is None:
        raise RuntimeError('No se pudo inicializar la geometría del IFC (web-ifc / ifcopenshell).')

    if iterator.initialize():
        while True:
            shape = iterator.get()
            if shape is None:
                break
            geom = shape.geometry
            verts = np.array(geom.verts, dtype=np.float32).reshape(-1, 3)
            faces = np.array(geom.faces).reshape(-1, 3)
            if verts.size == 0 or faces.size == 0:
                iterator.next()
                continue
            m = trimesh.Trimesh(vertices=verts, faces=faces)
            try:
                m.apply_transform(np.array(shape.transformation.matrix).reshape(4, 4))
            except Exception:
                pass
            type_name = str(getattr(shape, 'type', '')) or 'generic'
            layer = ifc_type_layer(type_name)
            prefix = {'structure': 'struct', 'electrical': 'elec', 'sanitary': 'san', 'hvac': 'hvac'}.get(layer, 'ifc')
            m.metadata['name'] = prefix + '-' + type_name.lower()
            counts[layer] = counts.get(layer, 0) + 1
            meshes.append(m)
            iterator.next()

    if not meshes:
        raise RuntimeError('El IFC no contiene geometría extraíble (sin representaciones sólidas).')

    stack = np.vstack([m.bounds for m in meshes])
    mn = stack.min(axis=0)
    mx = stack.max(axis=0)
    extent = max(mx[0] - mn[0], mx[2] - mn[2], mx[1] - mn[1])
    fit_scaled = False
    if extent > FIT_EXTENT:
        f = FIT_EXTENT / extent
        for m in meshes:
            m.apply_transform(np.diag([f, f, f, 1.0]))
        fit_scaled = True
    stack = np.vstack([m.bounds for m in meshes])
    mn = stack.min(axis=0)
    mx = stack.max(axis=0)
    center = (mn + mx) / 2
    for m in meshes:
        m.apply_translation([-center[0], -center[1], -center[2]])

    scene = trimesh.Scene()
    for i, m in enumerate(meshes):
        scene.add_geometry(m, geom_name=m.metadata.get('name', f'm{i}'))
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    scene.export(out)

    return {
        'walls': counts.get('structure', 0),
        'columns': 0,
        'mepRuns': counts.get('electrical', 0) + counts.get('sanitary', 0) + counts.get('hvac', 0),
        'doors': 0,
        'areaM2': 0,
        'extentM': round(extent, 1),
        'unit': 'metros (IFC)',
        'layers': sorted(set(prefix for prefix, _ in counts.items()))[:40],
        'warnings': [],
        'fitScaled': fit_scaled,
        'meshes': len(meshes),
    }


# ---------------------------------------------------------------------------
# PDF → PNG previews
# ---------------------------------------------------------------------------
def pdf_to_pngs(src: str, out_dir: str, max_pages: int = 6) -> list:
    import fitz  # PyMuPDF
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(src)
    pages = []
    total = min(doc.page_count, max_pages)
    for i in range(total):
        page = doc.load_page(i)
        mat = fitz.Matrix(1.6, 1.6)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        p = os.path.join(out_dir, f'page_{i + 1}.png')
        pix.save(p)
        pages.append(p)
    doc.close()
    return pages
