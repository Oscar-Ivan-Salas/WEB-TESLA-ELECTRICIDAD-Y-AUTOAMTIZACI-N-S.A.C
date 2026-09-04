import * as THREE from 'three';
import DxfParser, {
  type IDxf,
  type IEntity,
  type ILineEntity,
  type ILwpolylineEntity,
  type ICircleEntity,
  type IArcEntity,
} from 'dxf-parser';

export interface DxfLiftStats {
  walls: number;
  columns: number;
  mepRuns: number;
  doors: number;
  areaM2: number;
  unit: string;
  layers: string[];
  warnings: string[];
  fitScaled: boolean;
}

export interface DxfLiftResult {
  group: THREE.Group;
  stats: DxfLiftStats;
}

type LayerClass = 'wall' | 'structure' | 'electrical' | 'sanitary' | 'aci' | 'hvac' | 'ignore' | 'other';

interface Seg {
  x1: number; y1: number; x2: number; y2: number;
  len: number; ang: number; layer: string; cls: LayerClass; used: boolean;
}

const UNITS: Record<number, { factor: number; name: string }> = {
  0: { factor: 0.001, name: 'unitless (asumido mm)' },
  1: { factor: 0.0254, name: 'pulgadas' },
  2: { factor: 0.3048, name: 'pies' },
  3: { factor: 0.9144, name: 'yardas' },
  4: { factor: 0.001, name: 'milimetros' },
  5: { factor: 0.01, name: 'centimetros' },
  6: { factor: 1, name: 'metros' },
};

function classifyLayer(layer: string): LayerClass {
  const n = layer.toUpperCase();
  if (/(EJES|AXIS|GRID|DIM|ACOTE|COTA|TEXT|TEXTO|COTAS|REF)/.test(n)) return 'ignore';
  if (/(ELEC|ELECTR|BANDEJA|TRAY|CONDUIT|PANEL|TABLERO|ALUMB|LUMIN|POWER|PLU|CONTROL)/.test(n)) return 'electrical';
  if (/(SANIT|AGUA|DESAG|ABAST|WATER|PLUV|TUBER|PIPE|SS-|SAP)/.test(n)) return 'sanitary';
  if (/(ACI|CONTRA|FIRE|SPRINK|ROCI|EXTINT|SUPRES|BOMBER)/.test(n)) return 'aci';
  if (/(HVAC|DUCT|CLIMA|VENT|AIRE|SUPPLY|RETURN|EXTRAC|VAV|AHU)/.test(n)) return 'hvac';
  if (/(MURO|WALL|PARED|MAMP|TABIQ|COLUMNA|COLUMN|ESTRUCT|STRUCT|VIGA|BEAM|LOSA|SLAB)/.test(n)) return 'wall';
  return 'other';
}

function buildMaterials() {
  return {
    wall: new THREE.MeshStandardMaterial({ color: 0x7a8698, roughness: 0.92, metalness: 0.05 }),
    structure: new THREE.MeshStandardMaterial({ color: 0x8f9aac, roughness: 0.85, metalness: 0.12 }),
    slab: new THREE.MeshStandardMaterial({ color: 0x3d4a5c, roughness: 0.95 }),
    door: new THREE.MeshBasicMaterial({ color: 0x9aa5b5, transparent: true, opacity: 0.7 }),
    electrical: new THREE.MeshPhysicalMaterial({ color: 0xffb800, metalness: 0.85, roughness: 0.2, transparent: true, opacity: 0.65 }),
    sanitary: new THREE.MeshPhysicalMaterial({ color: 0x00a8e8, metalness: 0.6, roughness: 0.15, transparent: true, opacity: 0.65 }),
    aci: new THREE.MeshPhysicalMaterial({ color: 0xe63946, metalness: 0.6, roughness: 0.15, transparent: true, opacity: 0.7 }),
    hvac: new THREE.MeshPhysicalMaterial({ color: 0xb0b8c8, metalness: 0.85, roughness: 0.2, transparent: true, opacity: 0.5 }),
  };
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function dotLine(a: Seg, b: Seg) {
  const ax = (a.x2 - a.x1) / a.len;
  const ay = (a.y2 - a.y1) / a.len;
  const bx = (b.x2 - b.x1) / b.len;
  const by = (b.y2 - b.y1) / b.len;
  return ax * bx + ay * by;
}

function lineDistance(a: Seg, b: Seg) {
  const nx = -(a.y2 - a.y1) / a.len;
  const ny = (a.x2 - a.x1) / a.len;
  return Math.abs(nx * (b.x1 - a.x1) + ny * (b.y1 - a.y1));
}

function overlapFrac(a: Seg, b: Seg) {
  const ax = (a.x2 - a.x1) / a.len;
  const ay = (a.y2 - a.y1) / a.len;
  const projA = (b.x1 - a.x1) * ax + (b.y1 - a.y1) * ay;
  const projB = (b.x2 - a.x1) * ax + (b.y2 - a.y1) * ay;
  const lo = Math.max(0, Math.min(projA, projB));
  const hi = Math.min(a.len, Math.max(projA, projB));
  const overlap = Math.max(0, hi - lo);
  return overlap / Math.min(a.len, b.len);
}

function addSegment(list: Seg[], x1: number, y1: number, x2: number, y2: number, layer: string, cls: LayerClass) {
  const len = dist(x1, y1, x2, y2);
  if (len < 0.05) return;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  list.push({ x1, y1, x2, y2, len, ang, layer, cls, used: false });
}

export function liftDxf(dxfText: string): DxfLiftResult {
  const parser = new DxfParser();
  const doc: IDxf | null = parser.parseSync(dxfText);
  const warnings: string[] = [];

  if (!doc) {
    throw new Error('No se pudo parsear el DXF (archivo vacío o corrupto).');
  }

  const ins = doc.header?.['$INSUNITS'];
  const unitInfo = (typeof ins === 'number' && UNITS[ins]) ? UNITS[ins] : UNITS[4];
  const scale = unitInfo.factor;
  const unitName = unitInfo.name;

  const segs: Seg[] = [];
  const circles: { x: number; y: number; r: number; layer: string }[] = [];
  const rectCols: { x: number; y: number; size: number; layer: string }[] = [];
  const arcs: { x: number; y: number; r: number; a1: number; a2: number; layer: string }[] = [];
  const layerSet = new Set<string>();

  const pushSeg = (s: IEntity, x1: number, y1: number, x2: number, y2: number) => {
    const cls = classifyLayer(s.layer);
    if (cls === 'ignore') return;
    addSegment(segs, x1 * scale, y1 * scale, x2 * scale, y2 * scale, s.layer, cls);
    layerSet.add(s.layer);
  };

  for (const e of doc.entities) {
    if (e.inPaperSpace) continue;
    layerSet.add(e.layer);
    const cls = classifyLayer(e.layer);
    if (cls === 'ignore') continue;

    if (e.type === 'LINE') {
      const v = (e as ILineEntity).vertices;
      if (v && v.length >= 2) pushSeg(e, v[0].x, v[0].y, v[1].x, v[1].y);
    } else if (e.type === 'LWPOLYLINE') {
      const pl = e as ILwpolylineEntity;
      const v = pl.vertices ?? [];
      const closed = pl.shape === true;
      for (let i = 0; i < v.length - 1; i++) pushSeg(e, v[i].x, v[i].y, v[i + 1].x, v[i + 1].y);
      if (closed && v.length > 2) pushSeg(e, v[v.length - 1].x, v[v.length - 1].y, v[0].x, v[0].y);
      if (closed && cls === 'wall' && v.length === 4) {
        const xs = v.map((p) => p.x * scale);
        const ys = v.map((p) => p.y * scale);
        const w = Math.max(...xs) - Math.min(...xs);
        const h = Math.max(...ys) - Math.min(...ys);
        if (w > 0.12 && w < 1.2 && h > 0.12 && h < 1.2) {
          rectCols.push({ x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2, size: Math.min(w, h), layer: e.layer });
        }
      }
    } else if (e.type === 'CIRCLE') {
      const c = e as ICircleEntity;
      circles.push({ x: c.center.x * scale, y: c.center.y * scale, r: c.radius * scale, layer: e.layer });
    } else if (e.type === 'ARC') {
      const a = e as IArcEntity;
      arcs.push({ x: a.center.x * scale, y: a.center.y * scale, r: a.radius * scale, a1: a.startAngle, a2: a.endAngle, layer: e.layer });
    }
  }

  // Dedupe near-identical segments
  const deduped: Seg[] = [];
  for (const s of segs) {
    let dup = false;
    for (const d of deduped) {
      if (dist(s.x1, s.y1, d.x1, d.y1) < 0.02 && dist(s.x2, s.y2, d.x2, d.y2) < 0.02) { dup = true; break; }
    }
    if (!dup) deduped.push(s);
  }
  segs.length = 0;
  segs.push(...deduped);

  const wallSegs = segs.filter((s) => s.cls === 'wall');
  const runSegs = segs.filter((s) => s.cls === 'electrical' || s.cls === 'sanitary' || s.cls === 'aci' || s.cls === 'hvac');
  const otherSegs = segs.filter((s) => s.cls === 'other');

  const MAT = buildMaterials();

  const group = new THREE.Group();
  group.name = 'dxf-levantamiento';
  group.userData.dxf = true;

  let wallCount = 0;
  let mepRuns = 0;

  // ---- Walls: pair parallel double-lines -> extruded boxes ----
  const WALL_H = 2.7;
  const addWall = (cx: number, cy: number, dirAng: number, length: number, thickness: number, layer: string) => {
    const mat = classifyLayer(layer) === 'wall' ? MAT.wall : MAT.structure;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, WALL_H, thickness), mat);
    mesh.position.set(cx, WALL_H / 2 - 0.02, cy);
    mesh.rotation.z = dirAng;
    mesh.name = 'dxf-muro';
    mesh.userData.layer = 'structure';
    group.add(mesh);
    wallCount++;
  };

  for (let i = 0; i < wallSegs.length; i++) {
    const a = wallSegs[i];
    if (a.used) continue;
    for (let j = i + 1; j < wallSegs.length; j++) {
      const b = wallSegs[j];
      if (b.used) continue;
      const par = Math.abs(dotLine(a, b));
      const d = lineDistance(a, b);
      const ov = overlapFrac(a, b);
      if (par > 0.996 && d >= 0.06 && d <= 0.6 && ov > 0.5) {
        const midAx = (a.x1 + a.x2) / 2;
        const midAy = (a.y1 + a.y2) / 2;
        const midBx = (b.x1 + b.x2) / 2;
        const midBy = (b.y1 + b.y2) / 2;
        const cx = (midAx + midBx) / 2;
        const cy = (midAy + midBy) / 2;
        const len = Math.min(a.len, b.len) * 0.98;
        addWall(cx, cy, a.ang, len, d, a.layer);
        a.used = true;
        b.used = true;
        break;
      }
    }
  }

  // Unpaired long wall segments -> thin walls
  for (const s of wallSegs) {
    if (s.used) continue;
    if (s.len > 0.8) {
      addWall((s.x1 + s.x2) / 2, (s.y1 + s.y2) / 2, s.ang, s.len, 0.15, s.layer);
      s.used = true;
    }
  }

  // ---- MEP runs: thin boxes lifted at discipline height ----
  const RUN_H: Record<string, number> = { electrical: 0.85, sanitary: 0.35, aci: 0.95, hvac: 0.5 };
  for (const s of runSegs) {
    if (s.len < 0.3) continue;
    const box = s.cls === 'hvac' ? 0.4 : 0.1;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(s.len, box, box), MAT[s.cls as 'electrical' | 'sanitary' | 'aci' | 'hvac']);
    mesh.position.set((s.x1 + s.x2) / 2, RUN_H[s.cls], (s.y1 + s.y2) / 2);
    mesh.rotation.z = s.ang;
    mesh.name = 'dxf-mep-' + s.cls;
    mesh.userData.layer = s.cls === 'aci' ? 'sanitary' : s.cls;
    group.add(mesh);
    mepRuns++;
  }

  // ---- Columns: circles + closed square polylines ----
  let columnCount = 0;
  for (const c of circles) {
    if (c.r < 0.06 || c.r > 0.7) continue;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(c.r, c.r, WALL_H, 20), MAT.structure);
    mesh.position.set(c.x, WALL_H / 2 - 0.02, c.y);
    mesh.name = 'dxf-columna';
    mesh.userData.layer = 'structure';
    group.add(mesh);
    columnCount++;
  }
  for (const r of rectCols) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(r.size, WALL_H, r.size), MAT.structure);
    mesh.position.set(r.x, WALL_H / 2 - 0.02, r.y);
    mesh.name = 'dxf-columna';
    mesh.userData.layer = 'structure';
    group.add(mesh);
    columnCount++;
  }

  // ---- Door swings: arc outlines on the floor ----
  let doorCount = 0;
  for (const a of arcs) {
    if (a.r < 0.5 || a.r > 1.6) continue;
    const sweep = Math.abs(THREE.MathUtils.radToDeg(a.a2 - a.a1));
    if (sweep < 60 || sweep > 130) continue;
    const pts: THREE.Vector3[] = [];
    const steps = 12;
    for (let k = 0; k <= steps; k++) {
      const ang = a.a1 + ((a.a2 - a.a1) * k) / steps;
      pts.push(new THREE.Vector3(a.x + Math.cos(ang) * a.r, 0.03, a.y + Math.sin(ang) * a.r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, MAT.door);
    line.name = 'dxf-puerta';
    line.userData.layer = 'structure';
    group.add(line);
    doorCount++;
  }

  // ---- Slab under everything ----
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  group.children.forEach((m) => {
    const b = new THREE.Box3().setFromObject(m);
    minX = Math.min(minX, b.min.x); maxX = Math.max(maxX, b.max.x);
    minY = Math.min(minY, b.min.z); maxY = Math.max(maxY, b.max.z);
  });

  if (group.children.length > 0) {
    const margin = 0.6;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(maxX - minX + margin * 2, 0.12, maxY - minY + margin * 2), MAT.slab);
    slab.position.set(cx, -0.08, cy);
    slab.name = 'dxf-losa';
    slab.userData.layer = 'structure';
    group.add(slab);

    // Fit large plans first (scale about origin), then center to compensate
    const b2 = new THREE.Box3().setFromObject(group);
    const extent = Math.max(b2.max.x - b2.min.x, b2.max.z - b2.min.z);
    let fitScaled = false;
    if (extent > 8) {
      const f = 8 / extent;
      group.scale.setScalar(f);
      fitScaled = true;
    }

    const b3 = new THREE.Box3().setFromObject(group);
    const c3 = b3.getCenter(new THREE.Vector3());
    group.position.x = -c3.x;
    group.position.z = -c3.z;

    const areaM2 = (maxX - minX) * (maxY - minY);
    if (wallCount === 0) warnings.push('No se detectaron muros por pares de líneas; se levantaron muros de línea simple o el plano no contiene geometría de muros.');

    return {
      group,
      stats: {
        walls: wallCount,
        columns: columnCount,
        mepRuns,
        doors: doorCount,
        areaM2: Math.round(areaM2),
        unit: unitName,
        layers: Array.from(layerSet).slice(0, 40),
        warnings,
        fitScaled,
      },
    };
  }

  throw new Error('El DXF no contiene geometría útil (líneas, polilíneas o círculos) en el espacio modelo.');
}

export default liftDxf;
