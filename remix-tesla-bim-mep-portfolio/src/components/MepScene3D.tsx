import React, { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, ContactShadows, useGLTF, Lightformer, MeshReflectorMaterial, Grid, Sparkles, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

export type LayerKey = 'electrical' | 'sanitary' | 'hvac' | 'structure' | 'clashes';

export interface LayerState {
  electrical: boolean;
  sanitary: boolean;
  hvac: boolean;
  structure: boolean;
  clashes: boolean;
}

export type ViewPreset = 'iso' | 'top' | 'front';
export type ComparerMode = 'error' | 'solucion' | null;
export type RenderQuality = 'alto' | 'medio' | 'bajo';

interface MepScene3DProps {
  autoRotate: boolean;
  preset: ViewPreset | null;
  activeLayers: LayerState;
  assembly?: number | null;
  clipPlanes?: THREE.Plane[];
  uploadedScene?: THREE.Object3D | null;
  comparerMode?: ComparerMode;
  quality?: RenderQuality;
}

// ---------------------------------------------------------------------------
// PBR library – physically-based, discipline-coded
// ---------------------------------------------------------------------------
const PBR = {
  electrical: new THREE.MeshPhysicalMaterial({
    color: 0xffb800, metalness: 0.85, roughness: 0.18,
    clearcoat: 0.5, clearcoatRoughness: 0.1,
    transparent: true, opacity: 0.72,
  }),
  electricalSolid: new THREE.MeshPhysicalMaterial({
    color: 0xffa500, metalness: 0.9, roughness: 0.12,
    clearcoat: 0.8,
  }),
  conduit: new THREE.MeshPhysicalMaterial({
    color: 0xd4a000, metalness: 0.9, roughness: 0.1, clearcoat: 1,
  }),
  sanitary: new THREE.MeshPhysicalMaterial({
    color: 0x00a8e8, metalness: 0.65, roughness: 0.12,
    clearcoat: 0.9, clearcoatRoughness: 0.05,
    transparent: true, opacity: 0.68,
  }),
  aci: new THREE.MeshPhysicalMaterial({
    color: 0xe63946, metalness: 0.6, roughness: 0.15,
    clearcoat: 0.8, transparent: true, opacity: 0.72,
  }),
  flange: new THREE.MeshPhysicalMaterial({
    color: 0x445566, metalness: 0.95, roughness: 0.08, clearcoat: 1,
  }),
  valve: new THREE.MeshPhysicalMaterial({
    color: 0xffb800, metalness: 0.95, roughness: 0.08, clearcoat: 1,
  }),
  hvac: new THREE.MeshPhysicalMaterial({
    color: 0xb0b8c8, metalness: 0.88, roughness: 0.18,
    transparent: true, opacity: 0.55, side: THREE.DoubleSide,
  }),
  hvacAngle: new THREE.MeshPhysicalMaterial({
    color: 0x7a8899, metalness: 0.92, roughness: 0.1,
  }),
  structure: new THREE.MeshPhysicalMaterial({
    color: 0x1e293b, roughness: 0.85,
    transparent: true, opacity: 0.18, side: THREE.DoubleSide,
  }),
  concrete: new THREE.MeshStandardMaterial({
    color: 0x2a3344, roughness: 0.95, metalness: 0.0,
    transparent: true, opacity: 0.22,
  }),
  plcPanel: new THREE.MeshPhysicalMaterial({
    color: 0x1a2a3a, metalness: 0.9, roughness: 0.12, clearcoat: 0.7,
  }),
  plcDoor: new THREE.MeshPhysicalMaterial({
    color: 0x223344, metalness: 0.85, roughness: 0.15, clearcoat: 0.5,
  }),
  plcScreen: new THREE.MeshBasicMaterial({ color: 0x00e5ff, toneMapped: false }),
  ground: new THREE.MeshStandardMaterial({ color: 0x080d12, roughness: 1, metalness: 0 }),
  clashCore: new THREE.MeshBasicMaterial({ color: 0xff2444, transparent: true, opacity: 0.92, toneMapped: false }),
  clashWire: new THREE.MeshBasicMaterial({ color: 0xff2233, wireframe: true, toneMapped: false }),
  neonCyan: new THREE.MeshBasicMaterial({ color: 0x00e5ff, toneMapped: false }),
  neonGold: new THREE.MeshBasicMaterial({ color: 0xffb800, toneMapped: false }),
  diffuser: new THREE.MeshStandardMaterial({ color: 0xd8e0e8, roughness: 0.35, metalness: 0.5 }),
  support: new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.4, metalness: 0.8 }),
  boltHex: new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.2, metalness: 0.95 }),
  frame: new THREE.MeshStandardMaterial({
    color: 0x4e5a69, roughness: 0.38, metalness: 0.85,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xa8d2ea, metalness: 0.05, roughness: 0.08,
    transparent: true, opacity: 0.09, side: THREE.DoubleSide,
    clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.3,
  }),
  wall: new THREE.MeshStandardMaterial({
    color: 0x525c6e, roughness: 0.92, metalness: 0.05, side: THREE.DoubleSide,
  }),
  axisLine: new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35, toneMapped: false }),
  axisDot: new THREE.MeshBasicMaterial({ color: 0xffb800, transparent: true, opacity: 0.85, toneMapped: false }),
  doorLeaf: new THREE.MeshStandardMaterial({ color: 0x6b7690, roughness: 0.5, metalness: 0.6 }),
} as const;

type LayerMaterial = THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;

const classify = (name: string): { layer?: LayerKey; material?: LayerMaterial } => {
  const n = name.toLowerCase();
  if (n.includes('elec') || n.includes('bandeja') || n.includes('tray') || n.includes('conduit') || n.includes('vfd') || n.includes('plc') || n.includes('panel')) {
    return { layer: 'electrical', material: PBR.electrical };
  }
  if (n.includes('aci') || n.includes('fire')) return { layer: 'sanitary', material: PBR.aci };
  if (n.includes('san') || n.includes('tub') || n.includes('pipe') || n.includes('valve') || n.includes('flange')) {
    return { layer: 'sanitary', material: PBR.sanitary };
  }
  if (n.includes('hvac') || n.includes('duct') || n.includes('diff') || n.includes('ahu')) return { layer: 'hvac', material: PBR.hvac };
  if (n.includes('struct') || n.includes('slab') || n.includes('col') || n.includes('beam') || n.includes('viga') || n.includes('muro') || n.includes('wall') || n.includes('glass') || n.includes('frame') || n.includes('door') || n.includes('eje') || n.includes('axis') || n.includes('grid')) return { layer: 'structure', material: PBR.structure };
  if (n.includes('clash')) return { layer: 'clashes', material: PBR.clashCore };
  return {};
};

const applyPBRByMeshName = (root: THREE.Object3D, { replaceMaterials = true }: { replaceMaterials?: boolean } = {}) => {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const { layer, material } = classify(child.name);
    if (material && replaceMaterials) child.material = material;
    if (layer) child.userData.layer = layer;
  });
};

// ---------------------------------------------------------------------------
// Clash marker – neon pulsing sphere
// ---------------------------------------------------------------------------
function ClashMarker({ position, label = 'CLASH', sublabel = 'DETECTADO' }: { position: [number, number, number]; label?: string; sublabel?: string }) {
  const haloRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const s = 1 + Math.sin(clock.elapsedTime * 5) * 0.3;
    if (haloRef.current) haloRef.current.scale.setScalar(s);
    if (coreRef.current) { coreRef.current.scale.setScalar(s * 0.7); }
  });
  return (
    <group name="clash-marker" userData={{ layer: 'clashes' }}>
      <mesh ref={haloRef} name="clash-halo" position={position}>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshBasicMaterial attach="material" color="#ff2233" wireframe toneMapped={false} />
      </mesh>
      <mesh ref={coreRef} name="clash-core" position={position}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial attach="material" color="#ff0022" transparent opacity={0.95} toneMapped={false} />
      </mesh>
      <Html position={[position[0], position[1] + 0.42, position[2]]} center distanceFactor={11} zIndexRange={[30, 0]} className="pointer-events-none">
        <div className="px-2 py-0.5 bg-[#E63946]/90 text-white font-code text-[9px] leading-none whitespace-nowrap border border-[#E63946] shadow-[0_0_12px_rgba(230,57,70,0.8)]">
          <span className="font-bold tracking-widest">{label}</span>
          <span className="ml-1 opacity-80">{sublabel}</span>
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Pipe flange (brida) – disk + 6 bolts
// ---------------------------------------------------------------------------
function Flange({ position, rot }: { position: [number, number, number]; rot?: [number, number, number] }) {
  const boltAngles = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2);
  const r = rot ?? [0, 0, Math.PI / 2];
  return (
    <group position={position} rotation={r}>
      <mesh name="flange-disk">
        <cylinderGeometry args={[0.155, 0.155, 0.035, 24]} />
        <primitive attach="material" object={PBR.flange} />
      </mesh>
      {boltAngles.map((a, i) => (
        <mesh key={i} name="bolt" position={[Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12]}>
          <cylinderGeometry args={[0.012, 0.012, 0.055, 6]} />
          <primitive attach="material" object={PBR.boltHex} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Industrial hanger / pipe support
// ---------------------------------------------------------------------------
function PipeHanger({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh name="hanger-rod">
        <cylinderGeometry args={[0.008, 0.008, 0.5, 6]} />
        <primitive attach="material" object={PBR.support} />
      </mesh>
      <mesh name="hanger-shoe" position={[0, -0.25, 0]}>
        <boxGeometry args={[0.12, 0.022, 0.2]} />
        <primitive attach="material" object={PBR.support} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// HVAC Diffuser (ceiling grille)
// ---------------------------------------------------------------------------
function HvacDiffuser({ position }: { position: [number, number, number] }) {
  const fins = Array.from({ length: 5 }, (_, i) => -0.07 + i * 0.035);
  return (
    <group position={position} name="difusor" userData={{ layer: 'hvac' }}>
      <mesh name="diff-frame">
        <boxGeometry args={[0.36, 0.025, 0.36]} />
        <primitive attach="material" object={PBR.diffuser} />
      </mesh>
      {fins.map((f, i) => (
        <mesh key={i} name={`diff-fin-${i}`} position={[f, 0.012, 0]}>
          <boxGeometry args={[0.008, 0.04, 0.32]} />
          <primitive attach="material" object={PBR.diffuser} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// PLC / BMS Tablero (control panel)
// ---------------------------------------------------------------------------
function PlcPanel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} name="plc-panel" userData={{ layer: 'electrical' }}>
      {/* Cabinet body */}
      <mesh name="panel-body">
        <boxGeometry args={[0.72, 1.15, 0.38]} />
        <primitive attach="material" object={PBR.plcPanel} />
      </mesh>
      {/* Front door */}
      <mesh name="panel-door" position={[0, 0, 0.2]}>
        <boxGeometry args={[0.68, 1.1, 0.022]} />
        <primitive attach="material" object={PBR.plcDoor} />
      </mesh>
      {/* LED screen */}
      <mesh name="panel-screen" position={[0, 0.28, 0.212]}>
        <boxGeometry args={[0.26, 0.14, 0.005]} />
        <primitive attach="material" object={PBR.plcScreen} />
      </mesh>
      {/* Status LEDs */}
      {[[-0.1, 0.08, 0.212], [0, 0.08, 0.212], [0.1, 0.08, 0.212]].map(([x, y, z], i) => (
        <mesh key={i} name={`led-${i}`} position={[x, y, z]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial attach="material" color={i === 0 ? '#00ff44' : i === 1 ? '#ffb800' : '#e63946'} toneMapped={false} />
        </mesh>
      ))}
      {/* Din rail rows */}
      {[-0.25, -0.15, -0.05].map((y, i) => (
        <mesh key={i} name={`rail-${i}`} position={[0, y, 0.21]}>
          <boxGeometry args={[0.6, 0.012, 0.01]} />
          <primitive attach="material" object={PBR.electricalSolid} />
        </mesh>
      ))}
      {/* Cable glands bottom */}
      {[-0.22, -0.08, 0.08, 0.22].map((x, i) => (
        <mesh key={i} name={`gland-${i}`} position={[x, -0.59, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.04, 12]} />
          <primitive attach="material" object={PBR.support} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Industrial cable tray Legrand-style (bandeja perforada con alas y guardas)
// ---------------------------------------------------------------------------
// CableTray optimizado: 3 meshes fijos en vez de N*2 huecos + N ribs (evitaba 64+ draw calls por bandeja)
function CableTray({ length = 4.0, position, rotation }: {
  length?: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation ?? [0, 0, 0]} name="bandeja-perforada" userData={{ layer: 'electrical' }}>
      {/* Base plate – textura de perforaciones simulada por color oscuro del material */}
      <mesh name="bandeja-base">
        <boxGeometry args={[length, 0.025, 0.42]} />
        <primitive attach="material" object={PBR.electrical} />
      </mesh>
      {/* Left wall */}
      <mesh name="bandeja-wall-L" position={[0, 0.055, 0.21]}>
        <boxGeometry args={[length, 0.09, 0.012]} />
        <primitive attach="material" object={PBR.electrical} />
      </mesh>
      {/* Right wall */}
      <mesh name="bandeja-wall-R" position={[0, 0.055, -0.21]}>
        <boxGeometry args={[length, 0.09, 0.012]} />
        <primitive attach="material" object={PBR.electrical} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Industrial pipe run with flanges every 1m
// ---------------------------------------------------------------------------
// PipeRun optimizado: eliminados tornillos individuales (30 meshes extra por tubería → 2 meshes)
function PipeRun({ length = 4.5, position, rotation, mat, radius = 0.082 }: {
  length?: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  mat: THREE.MeshPhysicalMaterial;
  radius?: number;
}) {
  return (
    <group position={position} rotation={rotation ?? [0, 0, Math.PI / 2]}>
      <mesh name="pipe-body">
        <cylinderGeometry args={[radius, radius, length, 16, 1, true]} />
        <primitive attach="material" object={mat} />
      </mesh>
      <mesh name="pipe-inner" rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[radius * 0.93, radius * 0.93, length, 12, 1, true]} />
        <meshBasicMaterial attach="material" color="#040810" side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// HVAC rectangular duct with angle brackets
// ---------------------------------------------------------------------------
function HvacDuct({ length = 3.8, width = 0.85, height = 0.52, position, rotation }: {
  length?: number; width?: number; height?: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const brackets = Array.from({ length: Math.floor(length / 1.2) }, (_, i) => -length / 2 + 0.6 + i * 1.2);
  return (
    <group position={position} rotation={rotation ?? [0, 0, 0]} name="ducto-hvac" userData={{ layer: 'hvac' }}>
      {/* Duct body */}
      <mesh name="ducto-body">
        <boxGeometry args={[length, height, width]} />
        <primitive attach="material" object={PBR.hvac} />
      </mesh>
      {/* Sheet metal seams */}
      {brackets.map((bx, i) => (
        <mesh key={i} name={`angle-${i}`} position={[bx, 0, 0]}>
          <boxGeometry args={[0.018, height + 0.02, width + 0.02]} />
          <primitive attach="material" object={PBR.hvacAngle} />
        </mesh>
      ))}
      {/* Corner seam lines */}
      {[[0, height / 2, 0], [0, -height / 2, 0]].map(([x, y, z], i) => (
        <mesh key={i} name={`seam-${i}`} position={[x, y, z]}>
          <boxGeometry args={[length, 0.006, 0.003]} />
          <primitive attach="material" object={PBR.hvacAngle} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Curtain wall – glass + steel frame (perimeter enclosure)
// ---------------------------------------------------------------------------
function CurtainWall({ length, height = 2.6, position, rotationY = 0 }: {
  length: number; height?: number;
  position: [number, number, number];
  rotationY?: number;
}) {
  const posts = [0, length];
  const mullionCount = Math.max(1, Math.round(length / 1.1) - 1);
  const mullions = Array.from({ length: mullionCount }, (_, i) => (i + 1) * (length / (mullionCount + 1)));
  return (
    <group name="muro-cortina" position={position} rotation={[0, rotationY, 0]} userData={{ layer: 'structure' }}>
      {/* Corner posts */}
      {posts.map((p, i) => (
        <mesh key={`post-${i}`} name={`muro-post-${i}`} position={[-length / 2 + p, height / 2, 0]}>
          <boxGeometry args={[0.2, height, 0.3]} />
          <primitive attach="material" object={PBR.frame} />
        </mesh>
      ))}
      {/* Sill + head beams */}
      <mesh name="muro-beam-sill" position={[0, 0.07, 0]}>
        <boxGeometry args={[length, 0.14, 0.3]} />
        <primitive attach="material" object={PBR.frame} />
      </mesh>
      <mesh name="muro-beam-head" position={[0, height - 0.07, 0]}>
        <boxGeometry args={[length, 0.14, 0.3]} />
        <primitive attach="material" object={PBR.frame} />
      </mesh>
      {/* Glass panels */}
      <mesh name="muro-glass" position={[0, height / 2, 0]}>
        <boxGeometry args={[length, height - 0.3, 0.05]} />
        <primitive attach="material" object={PBR.glass} />
      </mesh>
      {/* Vertical mullions */}
      {mullions.map((m, i) => (
        <mesh key={`mul-${i}`} name={`muro-mullion-${i}`} position={[-length / 2 + m, height / 2, 0]}>
          <boxGeometry args={[0.05, height, 0.3]} />
          <primitive attach="material" object={PBR.frame} />
        </mesh>
      ))}
      {/* Horizontal transom mid-height */}
      <mesh name="muro-transom" position={[0, height * 0.55, 0]}>
        <boxGeometry args={[length, 0.05, 0.3]} />
        <primitive attach="material" object={PBR.frame} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Interior partition wall with door opening + lintel
// ---------------------------------------------------------------------------
function InteriorWall({ x0, x1, z, height = 2.5, doorX = 0, doorWidth = 1.0 }: {
  x0: number; x1: number; z: number; height?: number;
  doorX?: number; doorWidth?: number;
}) {
  const segments: Array<[number, number]> = [
    [x0, doorX - doorWidth / 2],
    [doorX + doorWidth / 2, x1],
  ].filter(([a, b]) => b > a) as Array<[number, number]>;

  return (
    <group name="muro-interior" position={[0, 0, z]} userData={{ layer: 'structure' }}>
      {segments.map(([a, b], i) => (
        <mesh key={`seg-${i}`} name={`muro-part-${i}`} position={[(a + b) / 2, height / 2, 0]}>
          <boxGeometry args={[b - a, height, 0.12]} />
          <primitive attach="material" object={PBR.wall} />
        </mesh>
      ))}
      {/* Lintel over door */}
      <mesh name="muro-lintel" position={[doorX, height - 0.12, 0]}>
        <boxGeometry args={[doorWidth + 0.2, 0.24, 0.12]} />
        <primitive attach="material" object={PBR.wall} />
      </mesh>
      {/* Door leaf slightly ajar */}
      <group name="muro-door" position={[doorX, 0, 0]}>
        <mesh name="door-leaf" position={[doorWidth / 2 - 0.06, 1.0, 0]} rotation={[0, 0.55, 0]}>
          <boxGeometry args={[0.9, 2.0, 0.05]} />
          <primitive attach="material" object={PBR.doorLeaf} />
        </mesh>
        <mesh name="door-frame" position={[0, 1.0, 0]}>
          <boxGeometry args={[doorWidth + 0.1, 2.1, 0.1]} />
          <primitive attach="material" object={PBR.frame} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Structural axis grid – emissive axis lines + grid intersections
// ---------------------------------------------------------------------------
function StructuralAxisGrid() {
  const xs = [-2.1, 0, 2.1];
  const zs = [-2.1, 0, 2.1];
  const labelsX = ['EJE 1', 'EJE 2', 'EJE 3'];
  const labelsZ = ['EJE A', 'EJE B', 'EJE C'];
  const y = -1.02;
  return (
    <group name="grilla-ejes" userData={{ layer: 'structure' }}>
      {xs.map((x, i) => (
        <mesh key={`ax-${i}`} name={`eje-x-${i}`} position={[x, y, 0]}>
          <boxGeometry args={[0.012, 0.006, 5.6]} />
          <primitive attach="material" object={PBR.axisLine} />
        </mesh>
      ))}
      {zs.map((z, i) => (
        <mesh key={`az-${i}`} name={`eje-z-${i}`} position={[0, y, z]}>
          <boxGeometry args={[5.9, 0.006, 0.012]} />
          <primitive attach="material" object={PBR.axisLine} />
        </mesh>
      ))}
      {xs.map((x, i) =>
        zs.map((z, j) => (
          <mesh key={`dot-${i}-${j}`} name={`eje-dot-${i}-${j}`} position={[x, y - 0.012, z]}>
            <cylinderGeometry args={[0.05, 0.05, 0.012, 16]} />
            <primitive attach="material" object={PBR.axisDot} />
          </mesh>
        )),
      )}
      {xs.map((x, i) => (
        <Html key={`hl-${i}`} position={[x, -1.0, 2.78]} center distanceFactor={10} className="pointer-events-none">
          <span className="font-code text-[8px] text-[#00E5FF]/80 bg-[#04080e]/60 px-1 py-px border border-[#00E5FF]/30 whitespace-nowrap">{labelsX[i]}</span>
        </Html>
      ))}
      {zs.map((z, i) => (
        <Html key={`hz-${i}`} position={[-3.08, -1.0, z]} center distanceFactor={10} className="pointer-events-none">
          <span className="font-code text-[8px] text-[#00E5FF]/80 bg-[#04080e]/60 px-1 py-px border border-[#00E5FF]/30 whitespace-nowrap">{labelsZ[i]}</span>
        </Html>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// High-fidelity procedural MEP scene (v2 – industrial grade)
// ---------------------------------------------------------------------------
function FallbackMepModel() {
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    if (groupRef.current) applyPBRByMeshName(groupRef.current);
  }, []);

  return (
    <group ref={groupRef} scale={[1.05, 1.05, 1.05]}>

      {/* ── STRUCTURE: 2 losas + 4 vigas + 4 columnas circulares ── */}
      <group name="estructura" userData={{ layer: 'structure' }}>
        {/* Lower slab */}
        <mesh name="slab-inferior" position={[0, -1.05, 0]}>
          <boxGeometry args={[6.0, 0.14, 5.5]} />
          <primitive attach="material" object={PBR.concrete} />
        </mesh>
        {/* Upper slab */}
        <mesh name="slab-superior" position={[0, 1.72, 0]}>
          <boxGeometry args={[6.0, 0.14, 5.5]} />
          <primitive attach="material" object={PBR.concrete} />
        </mesh>

        {/* Vigas (beams) */}
        {[
          { pos: [-2.0, 0.35, 0] as [number, number, number], size: [0.28, 0.55, 5.4] },
          { pos: [2.0, 0.35, 0] as [number, number, number], size: [0.28, 0.55, 5.4] },
          { pos: [0, 0.35, -2.0] as [number, number, number], size: [5.8, 0.42, 0.28] },
          { pos: [0, 0.35, 2.0] as [number, number, number], size: [5.8, 0.42, 0.28] },
        ].map(({ pos, size }, i) => (
          <mesh key={i} name={`viga-${i}`} position={pos}>
            <boxGeometry args={size as [number, number, number]} />
            <primitive attach="material" object={PBR.structure} />
          </mesh>
        ))}

        {/* Circular columns */}
        {[[-2.1, 0.33, -2.1], [2.1, 0.33, -2.1], [-2.1, 0.33, 2.1], [2.1, 0.33, 2.1]].map(([x, y, z], i) => (
          <mesh key={i} name={`columna-${i}`} position={[x, y, z]}>
            <cylinderGeometry args={[0.22, 0.22, 2.78, 20]} />
            <primitive attach="material" object={PBR.structure} />
          </mesh>
        ))}

        {/* Perimeter curtain walls (glass + steel frame) */}
        <CurtainWall length={6.0} position={[0, 0.39, -2.75]} />
        <CurtainWall length={6.0} position={[0, 0.39, 2.75]} rotationY={Math.PI} />
        <CurtainWall length={5.5} position={[3.0, 0.39, 0]} rotationY={Math.PI / 2} />
        <CurtainWall length={5.5} position={[-3.0, 0.39, 0]} rotationY={-Math.PI / 2} />

        {/* Interior partition with door – separates machine room */}
        <InteriorWall x0={-3.0} x1={1.3} z={1.15} doorX={-0.6} doorWidth={1.0} />

        {/* Structural axis grid on floor */}
        <StructuralAxisGrid />
      </group>

      {/* ── ELECTRICAL ── */}
      <group name="electrica" userData={{ layer: 'electrical' }}>
        {/* Main cable tray run – horizontal at high level */}
        <CableTray length={4.8} position={[0, 0.98, -0.62]} />

        {/* Secondary perpendicular tray */}
        <CableTray length={3.2} position={[1.2, 0.72, 0]} rotation={[0, Math.PI / 2, 0]} />

        {/* Conduit drop to panel */}
        <mesh name="conduit-elec-v" position={[-1.72, 0.1, -1.72]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 1.8, 12]} />
          <primitive attach="material" object={PBR.conduit} />
        </mesh>

        {/* PLC/BMS Panel */}
        <PlcPanel position={[-1.82, 0.05, -1.82]} />

        {/* Cable tray support hangers */}
        {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
          <PipeHanger key={i} x={x} y={1.3} z={-0.62} />
        ))}
      </group>

      {/* ── SANITARY / ACI ── */}
      <group name="sanitaria" userData={{ layer: 'sanitary' }}>
        {/* Main water supply (Ø3") */}
        <PipeRun
          length={5.2} position={[0, -0.22, 0.88]}
          rotation={[0, 0, Math.PI / 2]} mat={PBR.sanitary} radius={0.082}
        />

        {/* 90° elbow right */}
        <mesh name="codo-90-san" position={[2.5, -0.22, 0.88]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.13, 0.082, 20, 32, Math.PI / 2]} />
          <primitive attach="material" object={PBR.sanitary} />
        </mesh>
        {/* Vertical drop from elbow */}
        <mesh name="pipe-drop-san" position={[2.5, -0.58, 1.0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.082, 0.082, 0.72, 20]} />
          <primitive attach="material" object={PBR.sanitary} />
        </mesh>

        {/* Ball valve */}
        <group name="valvula-bola" position={[0.9, -0.22, 0.88]}>
          <mesh name="valve-body" rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.22, 16]} />
            <primitive attach="material" object={PBR.valve} />
          </mesh>
          <mesh name="valve-sphere">
            <sphereGeometry args={[0.095, 16, 12]} />
            <primitive attach="material" object={PBR.valve} />
          </mesh>
          <mesh name="valve-handle" position={[0, 0.18, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.28, 0.022, 0.038]} />
            <primitive attach="material" object={PBR.valve} />
          </mesh>
        </group>

        {/* ACI fire suppression pipe (Ø3" red) */}
        <PipeRun
          length={5.2} position={[0, 0.96, 0.88]}
          rotation={[0, 0, Math.PI / 2]} mat={PBR.aci} radius={0.082}
        />

        {/* ACI sprinkler heads */}
        {[-1.6, 0, 1.6].map((x, i) => (
          <group key={i} name={`sprinkler-${i}`} userData={{ layer: 'sanitary' }}>
            <mesh name="spr-drop" position={[x, 0.82, 0.88]}>
              <cylinderGeometry args={[0.018, 0.018, 0.28, 10]} />
              <primitive attach="material" object={PBR.aci} />
            </mesh>
            <mesh name="spr-head" position={[x, 0.68, 0.88]}>
              <sphereGeometry args={[0.038, 12, 10]} />
              <primitive attach="material" object={PBR.aci} />
            </mesh>
          </group>
        ))}

        {/* Pipe support hangers */}
        {[-1.8, 0, 1.8].map((x, i) => (
          <PipeHanger key={i} x={x} y={0.22} z={0.88} />
        ))}
      </group>

      {/* ── HVAC ── */}
      <group name="hvac" userData={{ layer: 'hvac' }}>
        {/* Primary supply duct */}
        <HvacDuct length={4.2} width={0.82} height={0.50} position={[-0.3, 0.32, 0.02]} />

        {/* Reducer transition */}
        <mesh name="ducto-reductor" position={[-2.5, 0.32, 0.02]}>
          <boxGeometry args={[0.55, 0.36, 0.5]} />
          <primitive attach="material" object={PBR.hvac} />
        </mesh>

        {/* Secondary duct perpendicular */}
        <HvacDuct length={2.8} width={0.5} height={0.36} position={[1.9, 0.32, -0.8]} rotation={[0, Math.PI / 2, 0]} />

        {/* Ceiling diffusers */}
        {[[0.8, 1.68, 1.0], [0.8, 1.68, -1.0], [-0.8, 1.68, 1.0]].map(([x, y, z], i) => (
          <HvacDiffuser key={i} position={[x, y, z]} />
        ))}

        {/* AHU unit (air handler) */}
        <group name="ahu-unit" position={[-2.62, 0.12, 0.02]} userData={{ layer: 'hvac' }}>
          <mesh name="ahu-body">
            <boxGeometry args={[0.72, 0.72, 0.9]} />
            <primitive attach="material" object={PBR.hvac} />
          </mesh>
          <mesh name="ahu-fan-grille" position={[0, 0, 0.46]}>
            <cylinderGeometry args={[0.26, 0.26, 0.02, 24]} />
            <primitive attach="material" object={PBR.hvacAngle} />
          </mesh>
          {/* Fan blades suggestion */}
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} name={`blade-${i}`} position={[0, 0, 0.46]}
              rotation={[0, 0, (i / 8) * Math.PI * 2]}>
              <boxGeometry args={[0.012, 0.22, 0.005]} />
              <primitive attach="material" object={PBR.hvacAngle} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ── CLASH MARKERS ── */}
      <group name="clash" userData={{ layer: 'clashes' }}>
        {/* Critical clash: ACI pipe vs electrical tray */}
        <ClashMarker position={[0, 0.97, 0.28]} label="CLASH-01" sublabel="ACI vs TRAY" />
        {/* Warning clash: HVAC vs sanitary pipe */}
        <ClashMarker position={[0, 0.12, 0.05]} label="CLASH-02" sublabel="HVAC vs SAN" />
      </group>

      {/* ── DECORATIVE NEON FLOOR GRID ── */}
      <mesh name="grid-floor" position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 6, 14, 12]} />
        <meshBasicMaterial attach="material" color="#00e5ff" wireframe transparent opacity={0.06} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// GLB model with PBR pass
// ---------------------------------------------------------------------------
function GlbModel() {
  const { scene } = useGLTF('/models/mep_lod400.glb');
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => { if (cloned) applyPBRByMeshName(cloned); }, [cloned]);
  return <primitive object={cloned} />;
}

async function glbExists(): Promise<boolean> {
  try {
    const res = await fetch('/models/mep_lod400.glb');
    const type = res.headers.get('content-type') ?? '';
    res.body?.cancel();
    return res.ok && !type.includes('text/html');
  } catch { return false; }
}

class GlbBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function MepModel() {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    glbExists().then((ok) => alive && setAvailable(ok));
    return () => { alive = false; };
  }, []);
  if (available === true) {
    return (
      <GlbBoundary fallback={<FallbackMepModel />}>
        <Suspense fallback={<FallbackMepModel />}>
          <GlbModel />
        </Suspense>
      </GlbBoundary>
    );
  }
  return <FallbackMepModel />;
}

// ---------------------------------------------------------------------------
// Comparer: Error tradicional vs Solución TESLA
// ---------------------------------------------------------------------------
function ClashComparisonModel({ mode }: { mode: Exclude<ComparerMode, null> }) {
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => { if (groupRef.current) applyPBRByMeshName(groupRef.current); }, []);

  return (
    <group ref={groupRef}>
      {/* Structure */}
      <group name="estructura" userData={{ layer: 'structure' }}>
        <mesh name="slab-inferior" position={[0, -1.05, 0]}>
          <boxGeometry args={[5.4, 0.14, 5.0]} />
          <primitive attach="material" object={PBR.concrete} />
        </mesh>
        <mesh name="slab-superior" position={[0, 1.72, 0]}>
          <boxGeometry args={[5.4, 0.14, 5.0]} />
          <primitive attach="material" object={PBR.concrete} />
        </mesh>
        <mesh name="columna-clash" position={[-1.5, 0.33, -1.5]}>
          <cylinderGeometry args={[0.22, 0.22, 2.78, 20]} />
          <primitive attach="material" object={PBR.structure} />
        </mesh>
        <mesh name="columna-b" position={[2.1, 0.33, 2.1]}>
          <cylinderGeometry args={[0.22, 0.22, 2.78, 20]} />
          <primitive attach="material" object={PBR.structure} />
        </mesh>
      </group>

      {mode === 'error' ? (
        <group>
          {/* Tray cutting through column */}
          <CableTray length={3.8} position={[-1.5, 0.46, -1.5]} rotation={[0, Math.PI / 4, 0]} />
          <group name="clash" userData={{ layer: 'clashes' }}>
            <ClashMarker position={[-1.5, 0.46, -1.5]} />
          </group>
          <mesh name="clash-bbox" position={[-1.5, 0.46, -1.5]}>
            <boxGeometry args={[0.72, 0.62, 0.72]} />
            <meshBasicMaterial attach="material" color="#ff2233" wireframe toneMapped={false} transparent opacity={0.9} />
          </mesh>
        </group>
      ) : (
        <group>
          {/* Clean routed tray around column */}
          <CableTray length={1.6} position={[-2.9, 0.46, -1.5]} />
          <mesh name="riser-up" position={[-2.15, 0.95, -1.5]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.85, 0.025, 0.42]} />
            <primitive attach="material" object={PBR.electrical} />
          </mesh>
          <CableTray length={1.9} position={[-0.8, 1.38, -1.5]} />
          <mesh name="riser-down" position={[0.1, 0.9, -1.5]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.75, 0.025, 0.42]} />
            <primitive attach="material" object={PBR.electrical} />
          </mesh>
          <CableTray length={1.5} position={[1.0, 0.46, -1.5]} />
          {/* Pase de losa */}
          <group name="clash" userData={{ layer: 'clashes' }}>
            <mesh name="pase-losa" position={[-2.15, 1.70, -1.5]}>
              <torusGeometry args={[0.3, 0.05, 16, 32]} />
              <meshBasicMaterial attach="material" color="#00e5ff" toneMapped={false} />
            </mesh>
            <ClashMarker position={[-2.15, 1.25, -1.5]} />
          </group>
        </group>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Uploaded model
// ---------------------------------------------------------------------------
function UploadedModel({ scene }: { scene: THREE.Object3D }) {
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => {
    if (cloned && !cloned.userData.dxf) applyPBRByMeshName(cloned, { replaceMaterials: false });
  }, [cloned]);
  return <primitive object={cloned} />;
}

// ---------------------------------------------------------------------------
// Layer + clip controllers
// ---------------------------------------------------------------------------
const THRESHOLDS: Array<{ min: number; layer: LayerKey }> = [
  { min: 0, layer: 'structure' },
  { min: 25, layer: 'sanitary' },
  { min: 50, layer: 'electrical' },
  { min: 75, layer: 'hvac' },
];

function LayerController({ rootRef, layers, assembly }: {
  rootRef: React.RefObject<THREE.Group | null>;
  layers: LayerState;
  assembly?: number | null;
}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.traverse((child) => {
      const layer = child.userData?.layer as LayerKey | undefined;
      if (!layer || !(layer in layers)) return;
      let visible = layers[layer];
      if (assembly != null && layer !== 'clashes') {
        const phase = THRESHOLDS.find((p) => p.layer === layer);
        if (phase) visible = visible && assembly >= phase.min;
      }
      child.visible = visible;
    });
  }, [layers, rootRef, assembly]);
  return null;
}

function ClipController({ rootRef, clipPlanes }: {
  rootRef: React.RefObject<THREE.Group | null>;
  clipPlanes: THREE.Plane[];
}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const planes = clipPlanes.length ? clipPlanes : null;
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        (m as THREE.Material).clippingPlanes = planes;
        (m as THREE.Material).clipIntersection = false;
      });
    });
  }, [clipPlanes, rootRef]);
  return null;
}

// ---------------------------------------------------------------------------
// Camera presets
// ---------------------------------------------------------------------------
function CameraRig({ preset }: { preset: ViewPreset | null }) {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    if (!preset) return;
    const targets: Record<ViewPreset, [number, number, number]> = {
      iso: [5, 3.5, 5.5],
      top: [0, 7, 0.1],
      front: [0, 0.5, 7],
    };
    const [x, y, z] = targets[preset];
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }, [preset, camera]);
  return null;
}

// Frame the camera to the bounds of an uploaded model (DXF / IFC / GLB)
function FramingRig({ scene }: { scene: THREE.Object3D | null }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => (s as { controls?: unknown }).controls as { target?: THREE.Vector3; update?: () => void } | null);
  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 1);
    const dist = maxDim * 1.6 + 2;
    camera.position.set(center.x + dist * 0.68, center.y + dist * 0.52, center.z + dist * 0.82);
    camera.near = Math.max(dist / 50, 0.05);
    camera.far = Math.max(dist * 10, 120);
    camera.updateProjectionMatrix();
    camera.lookAt(center.x, center.y + size.y * 0.4, center.z);
    if (controls?.target) {
      controls.target.copy(center);
      controls.update?.();
    }
  }, [scene, camera, controls]);
  return null;
}

// ---------------------------------------------------------------------------
// Environment with HDRI industrial lighting
// ---------------------------------------------------------------------------
class EnvErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function LocalEnvironment() {
  return (
    <Environment frames={1} resolution={512}>
      {/* Top key light – warm industrial sodium */}
      <Lightformer intensity={3.8} position={[0, 6, -8]} scale={[16, 16, 1]} color="#ffd580" />
      {/* Gold rim from the right */}
      <Lightformer intensity={2.2} position={[8, 3, 2]} rotation-y={-Math.PI / 2} scale={[18, 3, 1]} color="#ffb800" />
      {/* Left fill – cool cyan electrical glow */}
      <Lightformer intensity={2.2} position={[-7, 1, -1]} rotation-y={Math.PI / 2} scale={[24, 1.5, 1]} color="#00e5ff" />
      {/* Right fill – neutral */}
      <Lightformer intensity={1.4} position={[7, 1, 0]} rotation-y={-Math.PI / 2} scale={[24, 1.5, 1]} color="#ffffff" />
      {/* Floor bounce – subtle red ACI */}
      <Lightformer intensity={0.9} position={[0, -2, 0]} scale={[10, 1, 10]} color="#e63946" />
    </Environment>
  );
}

function IndustrialEnvironment() {
  return (
    <EnvErrorBoundary fallback={<LocalEnvironment />}>
      <Suspense fallback={<LocalEnvironment />}>
        <Environment preset="warehouse" />
      </Suspense>
    </EnvErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Main scene
// ---------------------------------------------------------------------------
export const MepScene3D: React.FC<MepScene3DProps> = ({
  autoRotate,
  preset,
  activeLayers,
  assembly = null,
  clipPlanes = [],
  uploadedScene = null,
  comparerMode = null,
  quality = 'medio',
}) => {
  const rootRef = useRef<THREE.Group>(null);

  return (
    <Canvas
      shadows={quality === 'alto'}
      dpr={quality === 'alto' ? [1, 1.25] : [1, 1]}
      camera={{ position: [5.2, 3.6, 5.8], fov: 50, near: 0.1, far: 160 }}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2
      }}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; }}
    >
      <color attach="background" args={['#04080e']} />
      <fog attach="fog" args={['#04080e', 18, 44]} />

      {/* Lights — cinematic industrial rig (optimizado) */}
      <ambientLight intensity={0.5} color="#c8d8ff" />
      <directionalLight position={[6, 12, 8]} intensity={2.0} color="#ffe8b0" castShadow={quality === 'alto'}
        shadow-mapSize={quality === 'alto' ? [1024, 1024] : [512, 512]} shadow-camera-far={32} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} />
      <directionalLight position={[-7, -3, -7]} intensity={0.7} color="#00e5ff" />
      <pointLight position={[0, 2.6, 0]} intensity={2.2} distance={14} color="#00e5ff" />
      <pointLight position={[-2.2, 0.2, -2.2]} intensity={1.8} distance={8} color="#ffb800" />
      <pointLight position={[2.2, 0.2, 1.1]} intensity={1.5} distance={8} color="#e63946" />

      <Stage environment={null} adjustCamera={false} intensity={0.55} shadows={false}>
        <group ref={rootRef}>
          {uploadedScene ? (
            <UploadedModel scene={uploadedScene} />
          ) : comparerMode ? (
            <ClashComparisonModel mode={comparerMode} />
          ) : (
            <Suspense fallback={<FallbackMepModel />}>
              <MepModel />
            </Suspense>
          )}
        </group>
      </Stage>

      {/* Ground plane: mate floor hiper-liviano */}
      <mesh position={[0, -1.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0a101b" roughness={0.8} metalness={0.3} />
      </mesh>

      {quality === 'alto' && (
        <ContactShadows position={[0, -1.115, 0]} opacity={0.5} scale={14} blur={2.0} far={4} frames={1} resolution={512} />
      )}

      {/* Grid solo en calidad alto — evita shader fullscreen en modo medio/bajo */}
      {quality === 'alto' && (
        <Grid
          position={[0, -1.128, 0]}
          infiniteGrid
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#15233a"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#ffb800"
          fadeDistance={18}
          fadeStrength={1.5}
        />
      )}

      {/* Sparkles solo en calidad alto */}
      {quality === 'alto' && (
        <Sparkles count={25} scale={[12, 6, 10]} position={[0, 1.7, 0]} size={1.2} speed={0.2} opacity={0.2} color="#ffd580" />
      )}

      <OrbitControls
        makeDefault enableDamping dampingFactor={0.08}
        autoRotate={autoRotate} autoRotateSpeed={0.8}
        enablePan={false} minDistance={2.8} maxDistance={22}
      />

      <LayerController rootRef={rootRef} layers={activeLayers} assembly={assembly} />
      <ClipController rootRef={rootRef} clipPlanes={clipPlanes} />
      <CameraRig preset={preset} />
      <FramingRig scene={uploadedScene} />
      {/* Environment: HDRI solo en alto; Lightformers en medio; nada en bajo → evita FBO permanente en VRAM */}
      {quality === 'alto' ? <IndustrialEnvironment /> : null}

      {/* Bloom solo en calidad alto — 7 passes de GPU eliminados en bajo/medio */}
      {quality === 'alto' && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.65} intensity={0.7} luminanceSmoothing={0.85} mipmapBlur={false} />
        </EffectComposer>
      )}
    </Canvas>
  );
};
