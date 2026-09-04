import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { liftDxf } from '../src/lib/dxfExtruder';

const here = dirname(fileURLToPath(import.meta.url));
const path = resolve(here, 'sample_plano.dxf');
const text = readFileSync(path, 'utf8');
const { group, stats } = liftDxf(text);

console.log('== LEVANTAMIENTO DXF (tsx) ==');
console.log('Unidades :', stats.unit);
console.log('Muros    :', stats.walls);
console.log('Columnas :', stats.columns);
console.log('Redes MEP:', stats.mepRuns);
console.log('Puertas  :', stats.doors);
console.log('Area m2  :', stats.areaM2);
console.log('FitScale :', stats.fitScaled);
console.log('Warnings :', stats.warnings);
console.log('Capas    :', stats.layers.join(', '));
console.log('Mallas   :', group.children.length, '| nombres:', group.children.map((c) => c.name).join(', '));

import * as THREE from 'three';
const box = new THREE.Box3().setFromObject(group);
const size = box.getSize(new THREE.Vector3());
console.log('BBox     :', size.x.toFixed(2), 'x', size.z.toFixed(2), 'x', size.y.toFixed(2), 'm (centrado)');
console.log('Pos/Scale:', group.position.x.toFixed(2), group.position.z.toFixed(2), '| s =', group.scale.x.toFixed(3));
const gb = new THREE.Box3();
group.children.forEach((c) => {
  gb.setFromObject(c);
  const s = gb.getSize(new THREE.Vector3());
  const p = gb.getCenter(new THREE.Vector3());
  console.log('  ', c.name.padEnd(18), 'size', s.x.toFixed(2), 'x', s.z.toFixed(2), '| center', p.x.toFixed(2), p.z.toFixed(2));
});
