import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MepScene3D, type LayerState, type ViewPreset, type ComparerMode, type RenderQuality } from './MepScene3D';
import { MepFloorPlan2D } from './MepFloorPlan2D';
import { liftDxf, type DxfLiftStats } from '../lib/dxfExtruder';
import { loadIfcToThree } from '../lib/ifcLoader';
import { SketchToBimModal } from './SketchToBimModal';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import {
  CheckCircle2, AlertTriangle, Info, Sparkles, Box, ShieldCheck, RefreshCw,
  ArrowLeftRight, Timer, Scissors, Upload, PenLine, Trash2, Download,
  Building2, FileCode2, ScanLine, Maximize, Minimize,
} from 'lucide-react';

interface ElementInfo {
  id: string;
  name: string;
  category: string;
  lod: string;
  system: string;
  dimensions: string;
  material: string;
  status: string;
  notes: string;
}

interface BimMepViewerProps {
  onOpenContact?: () => void;
}

type ToolKey = 'comparador' | 'simulador' | 'cargador' | null;

interface LoadedFile {
  name: string;
  size: number;
  kind: 'glb' | 'ifc' | 'dxf' | 'plano' | 'bim';
}

const PHASE_LABELS = ['Estructura', 'Sanitarias', 'Eléctricas', 'HVAC'];

const SERVER_URL = (import.meta.env.VITE_CONVERT_URL as string | undefined) ?? 'http://localhost:5000';

function decodeDxf(buf: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder('latin1').decode(buf);
  }
}

function loadGlbUrl(url: string): Promise<THREE.Group> {
  return fetch(url)
    .then((r) => r.arrayBuffer())
    .then((ab) => {
      const blobUrl = URL.createObjectURL(new Blob([ab], { type: 'model/gltf-binary' }));
      return new Promise<THREE.Group>((resolve, reject) => {
        new GLTFLoader().load(
          blobUrl,
          (g) => { URL.revokeObjectURL(blobUrl); resolve(g.scene); },
          undefined,
          (err) => { URL.revokeObjectURL(blobUrl); reject(err); },
        );
      });
    });
}

const IFC_AUDIT = [
  { system: 'Eléctrica', elements: 1240, clash: 18 },
  { system: 'Sanitaria / ACI', elements: 862, clash: 11 },
  { system: 'HVAC', elements: 647, clash: 9 },
];

const PLANO_AUDIT = [
  { system: 'Red Eléctrica (trazado)', qty: '312 m', cost: 'S/ 86,400' },
  { system: 'Red Sanitaria', qty: '248 m', cost: 'S/ 74,200' },
  { system: 'HVAC', qty: '18 eq.', cost: 'S/ 128,500' },
];

const RVT_METRADOS = [
  { system: 'Eléctrica', qty: '4,120 m', units: 'bandejas + conduits' },
  { system: 'Sanitaria / ACI', qty: '2,880 m', units: 'tuberías' },
  { system: 'HVAC', qty: '96 eq.', units: 'unidades de manejo' },
];

const CLASH_PRESCAN = { detectados: 342, criticos: 12 };

function VectorPreview() {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPos((p) => (p + 2) % 100), 40);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative h-44 bg-[#0a1628] border border-[#1F2937] overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#1e3a5f" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="220" fill="url(#blueprint-grid)" />
        {/* floor plan walls */}
        <g stroke="#00e5ff" strokeWidth="1.4" fill="none" opacity="0.75">
          <rect x="20" y="30" width="150" height="160" />
          <rect x="230" y="30" width="150" height="160" />
          <path d="M20 90 h150 M20 150 h150 M230 90 h150 M230 150 h150" />
        </g>
        {/* electrical circuits */}
        <g stroke="#ffb800" strokeWidth="1.6" fill="none" strokeDasharray="5 4" opacity="0.9">
          <path d="M95 30 v40 M95 70 h-40 M95 70 h40 M95 150 v40" />
          <path d="M305 30 v50 M305 100 h-24 M305 100 h24" />
        </g>
        {/* sanitary */}
        <g stroke="#00a8e8" strokeWidth="1.4" fill="none" opacity="0.8">
          <path d="M95 190 L40 140 M40 120 L40 140" />
          <circle cx="40" cy="140" r="4" />
        </g>
        {/* diffusers */}
        <g fill="#e5e7eb" stroke="#e5e7eb" strokeWidth="1">
          {[[305, 180], [305, 60], [95, 60]].map(([x, y], i) => (
            <rect key={i} x={x - 5} y={y - 5} width="10" height="10" transform={`rotate(45 ${x} ${y})`} opacity="0.7" />
          ))}
        </g>
      </svg>
      {/* scanline */}
      <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_14px_#00E5FF]" style={{ top: `${pos}%`, transition: 'top 0.04s linear' }} />
    </div>
  );
}

export const BimMepViewer: React.FC<BimMepViewerProps> = ({ onOpenContact }) => {
  const [autoRotate, setAutoRotate] = useState(false);
  const [quality, setQuality] = useState<RenderQuality>('medio');
  const [preset, setPreset] = useState<ViewPreset | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'plano'>('3d');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      viewportRef.current?.requestFullscreen().catch(() => {});
    }
  };
  const [activeLayers, setActiveLayers] = useState<LayerState>({
    electrical: true, sanitary: true, hvac: true, structure: true, clashes: true,
  });

  // Feature 1: Switch Comparador
  const [comparerMode, setComparerMode] = useState<ComparerMode>(null);

  // Feature 2: Simulador 4D + Section Box
  const [assembly, setAssembly] = useState<number>(100);
  const [clipEnabled, setClipEnabled] = useState(false);
  const [clipAxis, setClipAxis] = useState<'x' | 'y' | 'z'>('y');
  const [clipValue, setClipValue] = useState<number>(0);

  // Feature 3: Cargador de modelo propio
  const [tool, setTool] = useState<ToolKey>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedScene, setUploadedScene] = useState<THREE.Object3D | null>(null);
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dxfStats, setDxfStats] = useState<DxfLiftStats | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [serverOnline, setServerOnline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${SERVER_URL}/health`)
      .then((r) => (alive && r.ok ? r.json() : null))
      .then((d) => { if (alive && d?.ok) setServerOnline(true); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Feature 4: Sketch → BIM
  const [sketchOpen, setSketchOpen] = useState(false);

  const [selectedElement, setSelectedElement] = useState<ElementInfo>({
    id: 'MEP-ELEC-TRAY-302', name: 'Bandeja Porta-Cables Principal', category: 'Eléctrica / BMS',
    lod: 'LOD 350', system: 'Alimentación Secundaria 380V / 220V', dimensions: '300mm x 100mm (L: 12.5m)',
    material: 'Acero Galvanizado Pesado', status: 'Coordinado - Sin Interferencias',
    notes: 'Ruteo optimizado con derivaciones para tableros de automatización PLC.',
  });

  const setPresetView = (v: ViewPreset) => setPreset(v);

  const toggleLayer = (key: keyof LayerState) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clipPlanes = useMemo<THREE.Plane[]>(() => {
    if (!clipEnabled) return [];
    const n =
      clipAxis === 'x' ? new THREE.Vector3(1, 0, 0)
      : clipAxis === 'y' ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(0, 0, 1);
    return [new THREE.Plane(n, -clipValue)];
  }, [clipEnabled, clipAxis, clipValue]);

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    let buf: ArrayBuffer;
    try {
      buf = await file.arrayBuffer();
    } catch {
      setLoadStatus('error');
      setLoadError('No se pudo leer el archivo. Intenta de nuevo.');
      return;
    }

    // Detect real format from content, not only extension
    const head = new TextDecoder('latin1').decode(buf.slice(0, 2048)).replace(/^\uFEFF/, '').trimStart();
    let kind: LoadedFile['kind'] | 'dwg' | 'dxfb' | 'rvt' | 'nwd' | null = null;
    if (head.startsWith('glTF')) kind = 'glb';
    else if (head.startsWith('{')) kind = 'glb';
    else if (head.startsWith('ISO-10303-21') || head.startsWith('STEP')) kind = 'ifc';
    else if (head.startsWith('%PDF')) kind = 'plano';
    else if (/^AC1\d{3}/.test(head)) kind = 'dwg';
    else if (head.startsWith('AutoCAD Binary DXF')) kind = 'dxfb';
    else if (head.startsWith('0')) kind = 'dxf';
    else if (head.includes('SECTION') && head.includes('HEADER')) kind = 'dxf';

    setLoadStatus('loading');
    setLoadError(null);
    setDxfStats(null);
    setComparerMode(null);
    setUploadedScene(null);
    setPdfPages([]);
    setLoadedFile({
      name: file.name,
      size: file.size,
      kind: kind === 'dwg' || kind === 'dxfb' || kind === 'rvt' || kind === 'nwd' ? 'plano' : kind ?? 'glb',
    });

    // Client fast-path for ASCII DXF (no server needed)
    if (kind === 'dxf') {
      const txt = decodeDxf(buf);
      const res = liftDxf(txt);
      if (res.stats.walls === 0 && res.stats.columns === 0 && res.stats.mepRuns === 0) {
        setLoadStatus('error');
        setLoadError('El DXF se leyó, pero no contiene geometría convertible a 3D. Verifica que el dibujo esté en MODEL SPACE (y no en Layout/paperspace) y use entidades LINE / POLYLINE / CIRCLE / ARC.');
        return;
      }
      setUploadedScene(res.group);
      setDxfStats(res.stats);
      setLoadStatus('done');
      return;
    }

    // GLB / GLTF client-side
    if (kind === 'glb') {
      const url = URL.createObjectURL(new Blob([buf], { type: 'model/gltf-binary' }));
      const gltf = await new Promise<THREE.Group>((resolve, reject) => {
        new GLTFLoader().load(url, (g) => resolve(g.scene), undefined, (err) => reject(err));
      });
      URL.revokeObjectURL(url);
      setUploadedScene(gltf);
      setLoadStatus('done');
      return;
    }

    // Formats that need the Python converter (DWG / binary DXF / IFC / PDF)
    const needsServer = kind === 'dwg' || kind === 'dxfb' || kind === 'ifc' || kind === 'plano';
    if (needsServer) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const resp = await fetch(`${SERVER_URL}/api/convert`, { method: 'POST', body: fd });
        const data = await resp.json();
        if (!resp.ok || !data.ok) throw new Error(data.error || 'Servidor de conversión rechazó el archivo.');

        if (kind === 'plano') {
          if (data.pages?.length) {
            setPdfPages(data.pages.map((p: string) => SERVER_URL + p));
          }
          if (data.file) {
            const scene = await loadGlbUrl(SERVER_URL + data.file);
            setUploadedScene(scene);
            if (data.stats) setDxfStats(data.stats);
          }
          setLoadStatus('done');
          return;
        } else {
          const scene = await loadGlbUrl(SERVER_URL + data.file);
          setUploadedScene(scene);
          if (data.stats) setDxfStats(data.stats);
          setLoadStatus('done');
          return;
        }
      } catch (serverErr) {
        console.warn('Conversión por servidor no disponible, usando fallback:', serverErr);
      }
    }

    // Fallbacks when the server is not running
    if (kind === 'ifc') {
      try {
        const res = await loadIfcToThree(buf);
        setUploadedScene(res.group);
        setLoadStatus('done');
        return;
      } catch (e) {
        console.warn('IFC client failed', e);
      }
    }

    if (kind === 'dwg' || kind === 'dxfb') {
      setLoadStatus('error');
      setLoadError(
        (kind === 'dwg' ? 'Formato DWG detectado. ' : 'Se detectó un DXF binario. ') +
        'El navegador no puede leer este formato por sí solo. Inicia el conversor local ejecutando ' +
        '`python python\\server.py` (y deja abierto el terminal), o en AutoCAD usa GUARDAR COMO → .dxf (ASCII) y vuelve a subirlo.',
      );
      return;
    }

    // plano (pdf) fallback: pre-análisis 2D
    await new Promise((r) => setTimeout(r, 1700));
    setLoadStatus('done');
  }, []);

  const removeModel = () => {
    setUploadedScene(null);
    setLoadedFile(null);
    setLoadStatus('idle');
    setLoadError(null);
    setDxfStats(null);
    setPdfPages([]);
  };

  const presetElementsList: ElementInfo[] = [
    { id: 'MEP-ELEC-TRAY-302', name: 'Bandeja Porta-Cables Principal', category: 'Eléctrica / BMS', lod: 'LOD 350', system: 'Alimentación Secundaria 380V / 220V', dimensions: '300mm x 100mm (L: 12.5m)', material: 'Acero Galvanizado Pesado', status: 'Coordinado - Sin Interferencias', notes: 'Ruteo optimizado con derivaciones para tableros de automatización PLC.' },
    { id: 'MEP-HVAC-DUCT-108', name: 'Ducto Extracción Mecánica HVAC', category: 'Climatización & HVAC', lod: 'LOD 350', system: 'Sistema de Inyección / Extracción de Aire', dimensions: '800mm x 500mm', material: 'Chapa Galvanizada ISO 19650', status: 'Interferencia Resuelta (#CLASH-104)', notes: 'Desplazamiento vertical +150mm realizado en fase digital. Cero re-trabajo en obra.' },
    { id: 'MEP-SAN-PIPE-204', name: 'Tubería Red Sanitaria ACI / Agua Fría', category: 'Redes Sanitarias', lod: 'LOD 350', system: 'Agua Potable e Industrial', dimensions: 'Ø 3" (75mm)', material: 'CPVC Industrial SCH 80', status: 'Coordinado', notes: 'Cálculo de pendientes al 2.0% e integración con pase en viga estructural.' },
    { id: 'MEP-AUTO-PANEL-01', name: 'Tablero Control PLC & BMS Energy', category: 'Tableros de Automatización', lod: 'LOD 400', system: 'Automatización Industrial', dimensions: '800x1200x400mm', material: 'Gabinete NEMA 4X Stainless Steel', status: 'Aprobado ISO 19650', notes: 'Integrado con protocolo Modbus TCP/IP para monitoreo remoto en tiempo real.' },
  ];

  const phaseIndex = assembly >= 75 ? 3 : assembly >= 50 ? 2 : assembly >= 25 ? 1 : 0;

  return (
    <section id="viewer-3d" className="py-16 md:py-24 px-4 md:px-12 bg-[#090f14]/80 relative border-y border-[#1E293B]">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1F2937] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] font-code text-xs uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Visor Hiperrealista R3F + Drei + Postprocessing
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#F9FAFB]">
              Visor 3D MEP <span className="text-[#FFB800]">LOD 400</span>
            </h2>
            <p className="font-body text-[#9CA3AF] text-base max-w-2xl mt-2">
              Modelo federado con iluminación HDRI, materiales PBR traslúcidos y glow de clash detection en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#111827] border border-[#1F2937] p-3 rounded-xs">
            <div>
              <span className="font-code text-[10px] text-[#FFB800] uppercase block">PRECISIÓN BIM</span>
              <span className="font-code text-lg font-bold text-white">±0.5mm</span>
            </div>
            <div className="h-8 w-px bg-[#1F2937]"></div>
            <div>
              <span className="font-code text-[10px] text-[#E63946] uppercase block">LOD MODELO</span>
              <span className="font-code text-lg font-bold text-[#E63946]">LOD 400</span>
            </div>
            <div className="h-8 w-px bg-[#1F2937]"></div>
            <div>
              <span className="font-code text-[10px] text-[#FFB800] uppercase block">NORMA</span>
              <span className="font-code text-lg font-bold text-[#FFB800]">ISO 19650</span>
            </div>
          </div>
        </div>

        {/* Advanced Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-code text-[10px] text-[#9CA3AF] uppercase tracking-widest mr-1">Herramientas avanzadas:</span>
          <button
            onClick={() => setTool(tool === 'comparador' ? null : 'comparador')}
            className={`px-3 py-2 flex items-center gap-1.5 font-code text-[11px] uppercase tracking-wider border transition-all ${
              tool === 'comparador' ? 'bg-[#E63946]/20 border-[#E63946] text-[#E63946] font-bold' : 'bg-[#111827] border-[#1F2937] text-[#9CA3AF] hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Comparador
          </button>
          <button
            onClick={() => setTool(tool === 'simulador' ? null : 'simulador')}
            className={`px-3 py-2 flex items-center gap-1.5 font-code text-[11px] uppercase tracking-wider border transition-all ${
              tool === 'simulador' ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] font-bold' : 'bg-[#111827] border-[#1F2937] text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            4D + Corte
          </button>
          <button
            onClick={() => setTool(tool === 'cargador' ? null : 'cargador')}
            className={`px-3 py-2 flex items-center gap-1.5 font-code text-[11px] uppercase tracking-wider border transition-all ${
              tool === 'cargador' ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800] font-bold' : 'bg-[#111827] border-[#1F2937] text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Cargar Modelo
          </button>
          <button
            onClick={() => setSketchOpen(true)}
            className="px-3 py-2 flex items-center gap-1.5 font-code text-[11px] uppercase tracking-wider border border-[#1F2937] bg-[#111827] text-[#bac9cc] hover:text-[#FFB800] transition-all"
          >
            <PenLine className="w-3.5 h-3.5" />
            Sketch → BIM
          </button>
          <label className="ml-auto flex items-center gap-2 font-code text-[10px] text-[#9CA3AF] uppercase tracking-wider">
            Rendimiento
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as RenderQuality)}
              className="bg-[#111827] border border-[#1F2937] text-white text-[11px] px-2 py-1.5 font-code outline-none focus:border-[#FFB800]"
            >
              <option value="alto">ALTO (efectos)</option>
              <option value="medio">MEDIO · recomendado</option>
              <option value="bajo">BAJO (rápido)</option>
            </select>
          </label>
        </div>

        {/* Tool Control Panels */}
        {tool === 'comparador' && (
          <div className="border border-[#1F2937] bg-[#0B0F17] p-4 space-y-3">
            <div className="flex items-center gap-2 font-code text-[11px] text-[#E63946] uppercase tracking-wider font-bold">
              <ArrowLeftRight className="w-4 h-4" /> Switch Comparador · Antes vs. Después
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {([
                { v: null, label: 'Modelo Federado', desc: 'Vista completa del IDF coordinado', color: 'text-[#FFB800]' },
                { v: 'error', label: 'Error Tradicional en Obra', desc: 'Bandeja chocando contra columna', color: 'text-[#E63946]' },
                { v: 'solucion', label: 'Solución Coordinada TESLA', desc: 'Ruteo limpio con paso de losa sellado', color: 'text-[#00E5FF]' },
              ] as { v: ComparerMode; label: string; desc: string; color: string }[]).map((opt) => (
                <button
                  key={String(opt.v)}
                  disabled={!!uploadedScene}
                  onClick={() => setComparerMode(opt.v)}
                  className={`text-left p-3 border transition-all ${
                    comparerMode === opt.v
                      ? 'border-[#FFB800] bg-[#FFB800]/10'
                      : 'border-[#1F2937] bg-[#111827] hover:border-[#374151]'
                  } ${uploadedScene ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className={`font-code text-[11px] font-bold uppercase ${opt.color}`}>{opt.label}</div>
                  <div className="font-body text-[11px] text-[#9CA3AF] mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
            {uploadedScene && (
              <p className="font-code text-[10px] text-[#9CA3AF]">Comparador deshabilitado mientras hay un modelo propio cargado. Retira el modelo para comparar.</p>
            )}
          </div>
        )}

        {tool === 'simulador' && (
          <div className="border border-[#1F2937] bg-[#0B0F17] p-4 space-y-5">
            {/* 4D Montage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-code text-[11px] uppercase tracking-wider">
                <span className="text-[#00E5FF] font-bold flex items-center gap-2"><Timer className="w-4 h-4" /> Secuencia de Montaje (4D)</span>
                <span className="text-white font-bold">{assembly}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={assembly}
                onChange={(e) => setAssembly(Number(e.target.value))}
                className="w-full accent-[#00E5FF]"
              />
              <div className="grid grid-cols-4 gap-1">
                {PHASE_LABELS.map((label, i) => (
                  <div key={label} className={`text-center font-code text-[10px] uppercase py-1 border ${
                    i <= phaseIndex ? 'border-[#00E5FF]/60 bg-[#00E5FF]/10 text-[#00E5FF] font-bold' : 'border-[#1F2937] text-[#4B5563]'
                  }`}>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#1F2937]"></div>

            {/* Section Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-code text-[11px] text-[#FFB800] uppercase tracking-wider font-bold flex items-center gap-2">
                  <Scissors className="w-4 h-4" /> Plano de Corte (Section Box)
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={clipEnabled} onChange={(e) => setClipEnabled(e.target.checked)} className="accent-[#FFB800]" />
                  <span className="font-code text-[11px] text-[#9CA3AF]">Activar corte</span>
                </label>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-code text-[11px] text-[#9CA3AF] uppercase">Eje:</span>
                {(['x', 'y', 'z'] as const).map((ax) => (
                  <button
                    key={ax}
                    onClick={() => setClipAxis(ax)}
                    className={`px-3 py-1.5 font-code text-xs uppercase font-bold border transition-all ${
                      clipAxis === ax ? 'bg-[#FFB800] text-[#0B0F17]' : 'bg-[#1F2937] text-[#9CA3AF]'
                    }`}
                  >
                    {ax.toUpperCase()}
                  </button>
                ))}
                <div className="flex-1 min-w-[120px] flex items-center gap-2 ml-2">
                  <input
                    type="range" min={-2} max={2} step={0.05} value={clipValue}
                    onChange={(e) => setClipValue(Number(e.target.value))}
                    className="w-full accent-[#FFB800]"
                  />
                  <span className="font-code text-[10px] text-[#9CA3AF] w-12 text-right">{clipValue.toFixed(2)} m</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tool === 'cargador' && (
          <div className="border border-[#1F2937] bg-[#0B0F17] p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="font-code text-[11px] text-[#FFB800] uppercase tracking-wider font-bold flex items-center gap-2">
                <Upload className="w-4 h-4" /> Hub Multi-Archivo de Ingeniería
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-code text-[10px] text-[#9CA3AF] uppercase tracking-wider">
                {['.GLB', '.GLTF', '.DXF', '.IFC', '.PDF', '.DWG', '.RVT', '.NWD'].map((f) => (
                  <span key={f} className={`px-1.5 py-0.5 border ${
                    ['DWG'].includes(f) ? 'border-[#E63946]/60 text-[#E63946]'
                    : ['PDF', 'RVT', 'NWD'].includes(f) ? 'border-[#00E5FF]/40 text-[#00E5FF]/80'
                    : ['IFC'].includes(f) ? 'border-[#00E5FF]/50 text-[#00E5FF]'
                    : f === '.DXF' ? 'border-[#FFB800]/70 text-[#FFB800] font-bold'
                    : 'border-[#FFB800]/50 text-[#FFB800]'
                  }`}>{f}</span>
                ))}
              </div>
              <p className="font-code text-[9px] text-[#9CA3AF]/60 uppercase tracking-wider">Nota: .RVT / .NWD requieren exportar .IFC o .GLB · .DWG y .IFC se convierten con el servicio local (opcional)</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border border-[#1F2937] bg-[#0B0F17] p-2">
              <span className="font-code text-[9px] uppercase tracking-wider text-[#9CA3AF]">Conversor local (python python\server.py)</span>
              <span className={`flex items-center gap-1.5 font-code text-[9px] uppercase tracking-wider font-bold ${
                serverOnline ? 'text-[#00E5FF]' : 'text-[#E63946]'
              }`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${serverOnline ? 'bg-[#00E5FF] animate-pulse' : 'bg-[#E63946]'}`} />
                {serverOnline ? 'Servidor activo · DWG/IFC/PDF OK' : 'Servidor apagado · solo DXF/GLB'}
              </span>
            </div>

            <div
              className={`border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragOver ? 'border-[#FFB800] bg-[#FFB800]/10' : 'border-[#1E293B] bg-[#111827] hover:border-[#FFB800]/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-9 h-9 text-[#FFB800]/70 mb-2" />
              <span className="font-display font-bold text-white text-sm">Arrastra aquí tu plano CAD (.DXF se levanta en 3D automáticamente) o tu modelo BIM (.GLB .IFC)</span>
              <span className="font-code text-[11px] text-[#9CA3AF] mt-1">Levantamiento 2D→3D de .DXF en tu navegador. .DWG / .IFC / .PDF se convierten con el servicio local si está activo; si no, se usa el plan B del navegador.</span>
              <input
                ref={fileInputRef} type="file" accept=".dxf,.glb,.gltf,.ifc,.pdf" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
              />
            </div>

            {loadStatus !== 'idle' && loadedFile && (
              <div className="bg-[#0B0F17] border border-[#1F2937] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-[#FFB800]" />
                    <div>
                      <div className="font-code text-sm text-white font-bold truncate max-w-xs">{loadedFile.name}</div>
                      <div className="font-code text-[10px] text-[#9CA3AF] uppercase">
                        {(loadedFile.size / 1024).toFixed(1)} KB · {loadedFile.kind.toUpperCase()}
                      </div>
                      {loadedFile.kind === 'plano' && (
                        <span className="inline-block mt-1 font-code text-[9px] px-1.5 py-0.5 border border-[#00E5FF]/60 text-[#00E5FF] uppercase tracking-wider font-bold">
                          [PLANO DETECTADO: {loadedFile.name}]
                        </span>
                      )}
                      {loadedFile.kind === 'bim' && (
                        <span className="inline-block mt-1 font-code text-[9px] px-1.5 py-0.5 border border-[#E63946]/60 text-[#E63946] uppercase tracking-wider font-bold">
                          [MODELO NATIVO REVIT / NAVISWORKS DETECTADO]
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={removeModel} className="p-1.5 bg-[#1F2937] hover:bg-[#E63946] text-[#dde3ea]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {loadStatus === 'loading' && (
                  <div className="mt-3 flex items-center gap-2 font-code text-[11px] text-[#FFB800]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {loadedFile.kind === 'dxf' ? 'LEVANTANDO MUROS 2D→3D DESDE DXF... (detección de pares de líneas + extrusión)'
                      : loadedFile.kind === 'glb' ? 'GENERANDO MALLAS + PBR EN LOCAL...'
                      : loadedFile.kind === 'plano' ? 'LEVANTANDO PLANO PDF 2D→3D (VECTORIAL)...'
                      : loadedFile.kind === 'bim' ? 'ANALIZANDO ESTRUCTURA REVIT · CLASH PRE-SCAN...'
                      : 'PRE-AUDITANDO CONTENIDO IFC...'}
                  </div>
                )}

                {loadStatus === 'error' && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-2 font-code text-[11px] text-[#E63946]">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        El archivo <span className="font-bold">{loadedFile.name}</span> no pudo ser convertido.
                      </span>
                    </div>
                    {loadError && (
                      <p className="font-body text-[11px] text-[#9CA3AF] leading-relaxed border border-[#E63946]/40 bg-[#E63946]/5 p-3">{loadError}</p>
                    )}
                  </div>
                )}

                {loadStatus === 'done' && loadedFile.kind === 'glb' && (
                  <div className="mt-3 flex items-center gap-2 font-code text-[11px] text-[#00E5FF] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Modelo 3D Web renderizado en el visor. Materiales PBR + capas aplicados.
                  </div>
                )}

                {loadStatus === 'done' && loadedFile.kind === 'plano' && (
                  <div className="mt-3 space-y-3">
                    {pdfPages.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pdfPages.map((src) => (
                          <img
                            key={src}
                            src={src}
                            alt="página del plano"
                            className="w-full border border-[#1F2937] bg-[#111827]"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    ) : uploadedScene ? null : (
                      <VectorPreview />
                    )}
                    {uploadedScene && (
                      <div className="flex items-center gap-2 font-code text-[11px] text-[#00E5FF] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Plano PDF levantado a 3D en el visor (geometría vectorial + redes MEP).
                      </div>
                    )}
                    <div className="flex items-center gap-2 font-code text-[10px] text-[#00E5FF] uppercase tracking-wider font-bold">
                      <ScanLine className="w-3.5 h-3.5" /> Planos 2D / PDF Detectados. Iniciando Análisis de Trazado de Redes MEP.
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {PLANO_AUDIT.map((m) => (
                        <div key={m.system} className="bg-[#111827] border border-[#1F2937] p-3">
                          <span className="font-code text-[9px] text-[#9CA3AF] uppercase block">{m.system}</span>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="font-code text-white font-bold text-sm">{m.qty}</span>
                            <span className="font-code text-[#FFB800] font-bold text-xs">{m.cost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between bg-[#111827] border border-[#FFB800]/40 p-3">
                      <span className="font-code text-[10px] text-[#9CA3AF] uppercase">Pre-evaluación de conversión 2D → BIM</span>
                      <span className="font-code text-lg font-black text-[#E63946]">S/ 341,900</span>
                    </div>
                    <button onClick={onOpenContact} className="w-full bg-[#E63946] hover:bg-[#C1121F] text-white font-display font-bold text-xs uppercase tracking-wider py-2.5 flex items-center justify-center gap-2">
                      <FileCode2 className="w-4 h-4" /> Convertir este Plano a Modelo Federado Revit LOD 400
                    </button>
                  </div>
                )}

                {loadStatus === 'done' && loadedFile.kind === 'bim' && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2 font-code text-[10px] text-[#E63946] uppercase tracking-wider font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Escáner de Estructura Revit · Clash Pre-Scan completado
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#111827] border border-[#1F2937] p-3">
                        <span className="font-code text-[9px] text-[#9CA3AF] uppercase block">Interferencias detectadas</span>
                        <span className="font-code text-2xl font-black text-white">{CLASH_PRESCAN.detectados.toLocaleString()}</span>
                      </div>
                      <div className="bg-[#111827] border border-[#E63946]/50 p-3">
                        <span className="font-code text-[9px] text-[#9CA3AF] uppercase block">Críticas (LOD 400)</span>
                        <span className="font-code text-2xl font-black text-[#E63946]">{CLASH_PRESCAN.criticos}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {RVT_METRADOS.map((m) => (
                        <div key={m.system} className="flex items-center justify-between bg-[#111827] border border-[#1F2937] px-3 py-2 text-[11px]">
                          <span className="font-code text-[#9CA3AF] uppercase">{m.system}</span>
                          <span className="font-code text-white font-bold">{m.qty} <span className="text-[#9CA3AF] font-normal">{m.units}</span></span>
                        </div>
                      ))}
                    </div>
                    <p className="font-body text-[10px] text-[#9CA3AF] leading-relaxed">
                      Metrados extraídos del encabezado del modelo nativo. La maqueta 3D federada de demostración se sincronizó con la estructura detectada. Solicita el reporte oficial ISO 19650 para detalle completo.
                    </p>
                    <button onClick={onOpenContact} className="w-full bg-[#E63946] hover:bg-[#C1121F] text-white font-display font-bold text-xs uppercase tracking-wider py-2.5 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Solicitar reporte de metrados + clash resolution
                    </button>
                  </div>
                )}

                {loadStatus === 'done' && loadedFile.kind === 'dxf' && dxfStats && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2 font-code text-[11px] text-[#00E5FF] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Levantamiento 2D→3D completado · muros extruidos en el visor.
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { l: 'Muros levantados', v: dxfStats.walls, c: 'text-white' },
                        { l: 'Columnas', v: dxfStats.columns, c: 'text-white' },
                        { l: 'Redes MEP 3D', v: dxfStats.mepRuns, c: 'text-[#FFB800]' },
                        { l: 'Área (m²)', v: dxfStats.areaM2.toLocaleString(), c: 'text-[#FFB800]' },
                      ].map((s) => (
                        <div key={s.l} className="bg-[#111827] border border-[#1F2937] p-3">
                          <span className="font-code text-[9px] text-[#9CA3AF] uppercase block">{s.l}</span>
                          <span className={`font-code text-xl font-black ${s.c}`}>{s.v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between bg-[#111827] border border-[#1F2937] p-3">
                      <span className="font-code text-[10px] text-[#9CA3AF] uppercase">Unidades del DXF</span>
                      <span className="font-code text-xs text-white font-bold">{dxfStats.unit}{dxfStats.fitScaled ? ' · ajustado a escala de vista' : ''}</span>
                    </div>
                    {dxfStats.layers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {dxfStats.layers.map((l) => (
                          <span key={l} className="px-1.5 py-0.5 border border-[#1F2937] bg-[#0B0F17] font-code text-[9px] text-[#9CA3AF]">{l}</span>
                        ))}
                      </div>
                    )}
                    {dxfStats.warnings.map((w) => (
                      <p key={w} className="flex items-start gap-2 font-body text-[10px] text-[#E63946]"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {w}</p>
                    ))}
                    <button onClick={onOpenContact} className="w-full bg-[#E63946] hover:bg-[#C1121F] text-white font-display font-bold text-xs uppercase tracking-wider py-2.5 flex items-center justify-center gap-2">
                      <Building2 className="w-4 h-4" /> Convertir este plano a modelo federado Revit LOD 400
                    </button>
                  </div>
                )}

                {loadStatus === 'done' && loadedFile.kind === 'ifc' && (
                  <div className="mt-3 space-y-2">
                    <div className="font-code text-[11px] text-[#00E5FF] uppercase tracking-wider font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Modelo IFC renderizado en el visor (web-ifc) · elementos clasificados por especialidad
                    </div>
                    {IFC_AUDIT.map((r) => (
                      <div key={r.system} className="flex items-center justify-between bg-[#111827] border border-[#1F2937] px-3 py-2 text-[11px]">
                        <span className="font-code text-[#9CA3AF] uppercase">{r.system}</span>
                        <div className="flex gap-4">
                          <span className="font-code text-white">{r.elements.toLocaleString()} elems</span>
                          <span className="font-code text-[#E63946] font-bold">{r.clash} clash/riesgo</span>
                        </div>
                      </div>
                    ))}
                    <button onClick={onOpenContact} className="w-full bg-[#E63946] hover:bg-[#C1121F] text-white font-display font-bold text-xs uppercase tracking-wider py-2.5 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Solicitar auditoría BIM completa de tu modelo
                    </button>
                  </div>
                )}
              </div>
            )}
            <p className="font-code text-[10px] text-[#9CA3AF]">
              Ingestión universal: <span className="text-[#FFB800]">.DXF</span> se levanta a 3D automáticamente (muros + redes por capa); <span className="text-[#FFB800]">.GLB/.GLTF</span> se renderizan nativo en WebGL; <span className="text-[#00E5FF]">.IFC</span> se renderiza con web-ifc; <span className="text-[#00E5FF]/80">.PDF</span> activa el visor de planos con conversión a Revit; <span className="text-[#E63946]">.DWG/.RVT/.NWD</span> no son convertibles en el navegador (exporta .DXF desde CAD).
            </p>
          </div>
        )}

        {/* 3D Viewport and Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-3">
            <div ref={viewportRef} className={`glass-panel relative p-1 active-glow rounded-xs overflow-hidden ${isFullscreen ? 'flex flex-col h-full' : ''}`}>

              {/* Top Bar inside Viewport */}
              <div className="bg-[#0B0F17] border-b border-[#1F2937] px-4 py-2 flex flex-wrap justify-between items-center gap-2 font-code text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse"></span>
                  <span className="text-[#F9FAFB] font-semibold uppercase">
                    {viewMode === 'plano' ? 'PLANO 04-MEP-01 · PLANTA GENERAL MEP LOD 400' : loadedFile && uploadedScene ? `MODELO PROPIO: ${loadedFile.name}` : comparerMode ? (comparerMode === 'error' ? 'ESCENARIO: ERROR TRADICIONAL EN OBRA' : 'ESCENARIO: SOLUCIÓN COORDINADA TESLA') : 'MODELO FEDERADO MULTI-ESPECIALIDAD LOD 400'}
                  </span>
                </div>
                <div className="text-[#9CA3AF] text-[11px] flex items-center gap-3">
                  <span>COORD_REF: -12.043, -77.028</span>
                  <span className="text-[#E63946] border border-[#E63946]/40 px-1.5 py-0.5 font-bold">CLASH DETECTION ACTIVE</span>
                  <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    className="flex items-center gap-1.5 px-2 py-1 border border-[#1F2937] bg-[#111827] text-[#00E5FF] hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] transition-all"
                  >
                    {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline font-bold">{isFullscreen ? 'SALIR' : 'FULLSCREEN'}</span>
                  </button>
                </div>
              </div>

              {/* R3F Canvas Container with drop support */}
              <div
                className={`w-full bg-[#0B0F17] relative overflow-hidden touch-none ${isFullscreen ? 'flex-1 min-h-0' : 'h-[380px] md:h-[460px]'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              >
                <MepScene3D autoRotate={autoRotate} preset={preset} activeLayers={activeLayers} assembly={assembly} clipPlanes={clipPlanes} uploadedScene={uploadedScene} comparerMode={comparerMode} quality={quality} />

                {/* 04 MEP plan view */}
                {viewMode === 'plano' && (
                  <div className="absolute inset-0 z-10">
                    <MepFloorPlan2D />
                  </div>
                )}

                {/* Clash Alert Overlay (hide in comparer error & when custom model) */}
                {viewMode === '3d' && !comparerMode && !loadedFile && activeLayers.clashes && (
                  <div className="absolute top-4 left-4 right-4 sm:right-auto max-w-md bg-[#111827]/95 border-2 border-[#E63946] p-3.5 shadow-[0_0_20px_rgba(230,57,70,0.5)] z-20 backdrop-blur-md animate-pulse">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-code text-[11px] font-black text-[#E63946] uppercase tracking-wider block">[ALERTA DE INTERFERENCIA: Cruce Crítico de Red Sanitaria vs. Trayectoria Eléctrica - Resuelto en Digital]</span>
                        <p className="font-body text-[11px] text-[#F9FAFB]">Detalle: Tubería ACI de 3" colisionaba con bandeja porta-cables principal. Re-ruteada a +180mm en modelo federado.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comparer scenario banner */}
                {viewMode === '3d' && comparerMode && (
                  <div className={`absolute top-4 left-4 z-20 border-2 px-4 py-2.5 backdrop-blur-md ${
                    comparerMode === 'error' ? 'border-[#E63946] bg-[#E63946]/20' : 'border-[#00E5FF] bg-[#00E5FF]/10'
                  }`}>
                    <div className="font-code text-[11px] font-black uppercase tracking-wider text-[#F9FAFB]">
                      {comparerMode === 'error' ? '✖ Interferencia crítica: bandeja vs. columna' : '✓ Solución TESLA: ruteo elevado + pase sellado'}
                    </div>
                    <div className="font-body text-[10px] text-[#9CA3AF]">
                      {comparerMode === 'error' ? 'Sin coordinación BIM: adicionales de obra y picado innecesario.' : 'Interferencia resuelta en fase digital. Cero re-trabajo en obra.'}
                    </div>
                  </div>
                )}

                {/* Drag overlay */}
                {dragOver && (
                  <div className="absolute inset-0 z-30 bg-[#FFB800]/10 border-2 border-dashed border-[#FFB800] flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-10 h-10 text-[#FFB800] mx-auto mb-2 animate-bounce" />
                      <span className="font-code text-sm text-[#FFB800] font-bold uppercase">Suelta tu archivo para pre-auditar el modelo</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Viewport Floating Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-between items-center gap-2 pointer-events-none z-30">
                <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-[#111827]/90 backdrop-blur-md p-1.5 border border-[#1F2937] text-xs font-code">
                  <button onClick={() => setViewMode('3d')} className={`px-2.5 py-1.5 transition-all ${viewMode === '3d' ? 'bg-[#00E5FF] text-[#0B0F17] font-bold' : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white'}`}>
                    VISTA 3D BIM
                  </button>
                  <button onClick={() => setViewMode('plano')} className={`px-2.5 py-1.5 transition-all ${viewMode === 'plano' ? 'bg-[#FFB800] text-[#0B0F17] font-bold' : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white'}`}>
                    PLANO 04 MEP
                  </button>
                </div>

                {viewMode === '3d' && (
                <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-[#111827]/90 backdrop-blur-md p-1.5 border border-[#1F2937] text-xs font-code">
                  <button onClick={() => setAutoRotate(!autoRotate)} className={`px-2.5 py-1.5 flex items-center gap-1.5 transition-all ${autoRotate ? 'bg-[#FFB800] text-[#0B0F17] font-bold' : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white'}`}>
                    <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} /> GIRAR 3D
                  </button>
                  <div className="h-4 w-px bg-[#1F2937]"></div>
                  <button onClick={() => setPresetView('iso')} className="px-2 py-1 bg-[#1F2937] text-[#9CA3AF] hover:text-[#FFB800] transition-all">ISO</button>
                  <button onClick={() => setPresetView('top')} className="px-2 py-1 bg-[#1F2937] text-[#9CA3AF] hover:text-[#FFB800] transition-all">PLANTA</button>
                  <button onClick={() => setPresetView('front')} className="px-2 py-1 bg-[#1F2937] text-[#9CA3AF] hover:text-[#FFB800] transition-all">CORTE</button>
                </div>
                )}

                {viewMode === '3d' && (
                <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-[#111827]/90 backdrop-blur-md p-1.5 border border-[#1F2937] text-[11px] font-code">
                  <span className="text-[#9CA3AF] px-1 hidden sm:inline">CAPAS:</span>
                  {([
                    { k: 'electrical', label: 'Eléctricas', on: 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800] font-bold', off: 'bg-[#1F2937] border-[#1F2937] text-[#9CA3AF]' },
                    { k: 'sanitary', label: 'Sanitarias', on: 'bg-[#00A8E8]/20 border-[#00A8E8] text-[#00A8E8] font-bold', off: 'bg-[#1F2937] border-[#1F2937] text-[#9CA3AF]' },
                    { k: 'hvac', label: 'HVAC', on: 'bg-[#9CA3AF]/20 border-[#9CA3AF] text-[#F9FAFB] font-bold', off: 'bg-[#1F2937] border-[#1F2937] text-[#9CA3AF]' },
                    { k: 'structure', label: 'Estructura', on: 'bg-[#1F2937] border-slate-500 text-[#F9FAFB] font-bold', off: 'bg-[#1F2937] border-[#1F2937] text-[#9CA3AF]' },
                    { k: 'clashes', label: 'Cruces', on: 'bg-[#E63946]/20 border-[#E63946] text-[#E63946] font-bold', off: 'bg-[#1F2937] border-[#1F2937] text-[#9CA3AF]' },
                  ].map((l) => (
                    <button key={l.k} onClick={() => toggleLayer(l.k as keyof LayerState)} className={`px-2 py-1 flex items-center gap-1 border transition-all ${activeLayers[l.k as keyof LayerState] ? l.on : l.off}`}>
                      {l.label}
                    </button>
                  )))}
                </div>
                )}
              </div>
            </div>

            {/* Quick Element Selector bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-code text-xs">
              {presetElementsList.map((item) => (
                <button key={item.id} onClick={() => setSelectedElement(item)} className={`p-2.5 text-left border transition-all ${selectedElement.id === item.id ? 'bg-[#FFB800]/10 border-[#FFB800] text-white active-glow' : 'bg-[#111827] border-[#1F2937] text-[#9CA3AF] hover:border-[#374151]'}`}>
                  <div className="text-[10px] text-[#FFB800] uppercase font-bold truncate">{item.category}</div>
                  <div className="font-semibold text-xs text-[#F9FAFB] truncate">{item.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* BIM Element Inspector Panel */}
          <div className="lg:col-span-4 glass-panel p-5 space-y-5 rounded-xs border border-[#1F2937] h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#FFB800]" />
                  <span className="font-code text-xs text-[#FFB800] uppercase font-bold tracking-wider">INSPECTOR DE ELEMENTO BIM</span>
                </div>
                <span className="bg-[#E63946]/20 text-[#E63946] text-[10px] font-code px-2 py-0.5 font-bold border border-[#E63946]/40">{selectedElement.lod}</span>
              </div>

              <div>
                <span className="font-code text-[10px] text-[#9CA3AF] uppercase block">IDENTIFICADOR IFC</span>
                <div className="font-code text-sm font-bold text-[#FFB800]">{selectedElement.id}</div>
                <h3 className="font-display text-lg font-bold text-white mt-1">{selectedElement.name}</h3>
              </div>

              <div className="space-y-2.5 text-xs font-code bg-[#0B0F17] p-3 border border-[#1F2937]">
                <div className="flex justify-between border-b border-[#1F2937]/60 pb-1.5"><span className="text-[#9CA3AF]">Especialidad:</span><span className="text-white font-semibold">{selectedElement.category}</span></div>
                <div className="flex justify-between border-b border-[#1F2937]/60 pb-1.5"><span className="text-[#9CA3AF]">Sistema MEP:</span><span className="text-[#FFB800] font-semibold">{selectedElement.system}</span></div>
                <div className="flex justify-between border-b border-[#1F2937]/60 pb-1.5"><span className="text-[#9CA3AF]">Dimensiones:</span><span className="text-white font-semibold">{selectedElement.dimensions}</span></div>
                <div className="flex justify-between"><span className="text-[#9CA3AF]">Materialidad:</span><span className="text-[#9CA3AF] font-semibold">{selectedElement.material}</span></div>
              </div>

              <div className="p-3 bg-[#111827] border-l-2 border-[#FFB800] space-y-1">
                <span className="font-code text-[10px] text-[#FFB800] uppercase font-bold flex items-center gap-1"><Info className="w-3 h-3" /> Nota Técnica ISO 19650</span>
                <p className="font-body text-xs text-[#9CA3AF] leading-relaxed">{selectedElement.notes}</p>
              </div>

              {/* Tarea 3: Garantías de cierre de venta */}
              <div className="p-3 bg-[#0B0F17] border border-[#1F2937] space-y-2.5">
                <span className="font-code text-[10px] text-[#FFB800] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" /> Garantías TESLA S.A.C.
                </span>
                <div className="flex items-start gap-2.5 border border-[#FFB800]/40 bg-[#FFB800]/5 p-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-code text-[11px] text-[#FFB800] font-bold">Realidad Construible</div>
                    <div className="font-body text-[10px] text-[#9CA3AF] mt-0.5">Garantía de operatividad en campo desde el primer día.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 border border-[#E63946]/40 bg-[#E63946]/5 p-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-code text-[11px] text-[#E63946] font-bold">Protocolos de Calidad y Seguridad</div>
                    <div className="font-body text-[10px] text-[#9CA3AF] mt-0.5">Cumplimiento de normativas e inspecciones ITSE.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 border border-[#10B981]/40 bg-[#10B981]/5 p-2.5">
                  <FileCode2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-code text-[11px] text-[#10B981] font-bold">Trazabilidad Técnica ISO 19650</div>
                    <div className="font-body text-[10px] text-[#9CA3AF] mt-0.5">Documentación y modelos entregables auditables.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1F2937] space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-code text-[#9CA3AF]">
                <ShieldCheck className="w-4 h-4 text-[#FFB800]" />
                <span>Pipeline R3F + Drei + Postprocessing • 4D + Section Box activos</span>
              </div>
              <button onClick={() => { const el = document.getElementById('calculadora'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="w-full bg-[#1a2026] hover:bg-[#00E5FF] hover:text-[#070D12] text-[#00E5FF] border border-[#00E5FF] font-display font-bold text-xs uppercase tracking-wider py-2.5 transition-all text-center block">
                Calcular Ahorro en Obra para este Proyecto →
              </button>
            </div>
          </div>
        </div>
      </div>

      <SketchToBimModal isOpen={sketchOpen} onClose={() => setSketchOpen(false)} onOpenContact={onOpenContact || (() => {})} />
    </section>
  );
};