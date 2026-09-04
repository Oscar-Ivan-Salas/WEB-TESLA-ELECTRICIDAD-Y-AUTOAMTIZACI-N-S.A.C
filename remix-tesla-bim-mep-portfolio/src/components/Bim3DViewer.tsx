import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CheckCircle2, AlertTriangle, Info, Sparkles, Box, ShieldCheck, RefreshCw } from 'lucide-react';

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

export const Bim3DViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeLayers, setActiveLayers] = useState({
    electrical: true,
    sanitary: true,
    hvac: true,
    structure: true,
    clashes: true,
  });

  const [selectedElement, setSelectedElement] = useState<ElementInfo>({
    id: 'MEP-ELEC-TRAY-302',
    name: 'Bandeja Porta-Cables Principal',
    category: 'Eléctrica / BMS',
    lod: 'LOD 350',
    system: 'Alimentación Secundaria 380V / 220V',
    dimensions: '300mm x 100mm (L: 12.5m)',
    material: 'Acero Galvanizado Pesado',
    status: 'Coordinado - Sin Interferencias',
    notes: 'Ruteo optimizado con derivaciones para tableros de automatización PLC.'
  });

  // Three.js refs to manipulate live object visibility
  const groupsRef = useRef<{
    elec?: THREE.Group;
    san?: THREE.Group;
    hvac?: THREE.Group;
    struct?: THREE.Group;
    clashes?: THREE.Group;
    mainGroup?: THREE.Group;
    camera?: THREE.PerspectiveCamera;
  }>({});

  // Mirror autoRotate to a ref so the WebGL scene is created only once
  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070D12);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(4, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // OrbitControls: drag to rotate, scroll to zoom, right-drag to pan (P6)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.5;
    controls.maxDistance = 14;
    controls.target.set(0, 0, 0);

    // Registry of GPU resources for safe disposal on unmount (P18)
    const disposables: Array<{ dispose: () => void }> = [renderer, controls];

    const disposeScene = () => {
      scene.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      disposables.forEach((d) => d.dispose());
    };

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00e5ff, 1.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffd700, 1.0);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x00e5ff, 2, 10);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Groups
    const structGroup = new THREE.Group();
    const elecGroup = new THREE.Group();
    const sanGroup = new THREE.Group();
    const hvacGroup = new THREE.Group();
    const clashesGroup = new THREE.Group();

    mainGroup.add(structGroup);
    mainGroup.add(elecGroup);
    mainGroup.add(sanGroup);
    mainGroup.add(hvacGroup);
    mainGroup.add(clashesGroup);

    groupsRef.current = {
      struct: structGroup,
      elec: elecGroup,
      san: sanGroup,
      hvac: hvacGroup,
      clashes: clashesGroup,
      mainGroup,
      camera
    };

    // 1. STRUCTURE (Dark Gray #1E293B at 15% opacity for pases and internal network visibility)
    const structMat = new THREE.MeshPhongMaterial({
      color: 0x1E293B,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });

    const slabGeo = new THREE.BoxGeometry(5.2, 0.12, 5.2);
    const slab = new THREE.Mesh(slabGeo, structMat);
    slab.position.y = -1;
    structGroup.add(slab);

    const topSlab = new THREE.Mesh(slabGeo, structMat);
    topSlab.position.y = 1.6;
    structGroup.add(topSlab);

    // Columns & Wall References
    const colGeo = new THREE.BoxGeometry(0.35, 2.6, 0.35);
    [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([x, z]) => {
      const col = new THREE.Mesh(colGeo, structMat);
      col.position.set(x, 0.3, z);
      structGroup.add(col);

      const colWire = new THREE.LineSegments(
        new THREE.WireframeGeometry(colGeo),
        new THREE.LineBasicMaterial({ color: 0x374151, transparent: true, opacity: 0.4 })
      );
      colWire.position.set(x, 0.3, z);
      structGroup.add(colWire);
    });

    // 2. ELECTRICAL / VFD (Gold #FFB800 at 50% opacity)
    const elecMat = new THREE.MeshPhongMaterial({
      color: 0xFFB800,
      emissive: 0x664a00,
      shininess: 90,
      transparent: true,
      opacity: 0.50
    });

    // Main perforated cable tray
    const trayGeo = new THREE.BoxGeometry(4.2, 0.1, 0.45);
    const mainTray = new THREE.Mesh(trayGeo, elecMat);
    mainTray.position.set(0, 0.85, -0.6);
    elecGroup.add(mainTray);

    // Perforations on cable tray: efficient instanced mesh (P7)
    const PERF_COUNT = 22;
    const perfGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 6);
    const perfMat = new THREE.MeshBasicMaterial({ color: 0x070D12, transparent: true, opacity: 0.9 });
    const perfInstances = new THREE.InstancedMesh(perfGeo, perfMat, PERF_COUNT);
    const perfDummy = new THREE.Object3D();
    for (let i = 0; i < PERF_COUNT; i++) {
      const px = -2.0 + i * 0.19;
      perfDummy.position.set(px, 0.80, -0.6 + (i % 2 === 0 ? -0.09 : 0.09));
      perfDummy.rotation.z = Math.PI / 2;
      perfDummy.updateMatrix();
      perfInstances.setMatrixAt(i, perfDummy.matrix);
    }
    elecGroup.add(perfInstances);

    // Conduit Pipe
    const conduitGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.0, 12);
    const conduit = new THREE.Mesh(conduitGeo, elecMat);
    conduit.rotation.z = Math.PI / 2;
    conduit.position.set(0, 0.65, -0.6);
    elecGroup.add(conduit);

    // VFD / Automation Cabinet
    const vfdPanelGeo = new THREE.BoxGeometry(0.65, 1.1, 0.35);
    const vfdPanel = new THREE.Mesh(vfdPanelGeo, elecMat);
    vfdPanel.position.set(-1.8, 0.25, -1.8);
    elecGroup.add(vfdPanel);

    // 3. SANITARY & ACI (Technical Blue #00A8E8 at 50% opacity & Fire Red #E63946 at 50% opacity)
    const sanBlueMat = new THREE.MeshPhysicalMaterial({
      color: 0x00A8E8,
      emissive: 0x003355,
      roughness: 0.15,
      metalness: 0.35,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      transmission: 0.2,
      transparent: true,
      opacity: 0.50,
      side: THREE.DoubleSide
    });

    const aciRedMat = new THREE.MeshPhysicalMaterial({
      color: 0xE63946,
      emissive: 0x550000,
      roughness: 0.2,
      metalness: 0.3,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      transparent: true,
      opacity: 0.50,
      side: THREE.DoubleSide
    });

    // Hydraulic Pressure Pipe
    const mainPipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.5, 16);
    const mainPipe = new THREE.Mesh(mainPipeGeo, sanBlueMat);
    mainPipe.rotation.z = Math.PI / 2;
    mainPipe.position.set(0, -0.2, 0.8);
    sanGroup.add(mainPipe);

    // 90° Elbow fitting
    const elbowGeo = new THREE.TorusGeometry(0.12, 0.08, 12, 24, Math.PI / 2);
    const elbow = new THREE.Mesh(elbowGeo, sanBlueMat);
    elbow.position.set(2.2, -0.2, 0.8);
    sanGroup.add(elbow);

    // 45° Elbow fitting (P8)
    const elbow45Geo = new THREE.TorusGeometry(0.1, 0.07, 10, 20, Math.PI / 4);
    const elbow45 = new THREE.Mesh(elbow45Geo, aciRedMat);
    elbow45.position.set(-2.2, -0.2, 0.8);
    sanGroup.add(elbow45);

    // Gate Valve with gold hand-wheel (P8)
    const valveMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFB800,
      roughness: 0.25,
      metalness: 0.9,
      clearcoat: 0.5
    });
    const valveBodyGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12);
    const valveHandleGeo = new THREE.TorusGeometry(0.16, 0.025, 8, 16);
    const valveBody = new THREE.Mesh(valveBodyGeo, valveMat);
    valveBody.rotation.z = Math.PI / 2;
    valveBody.position.set(1.4, -0.2, 0.8);
    sanGroup.add(valveBody);
    const valveHandle = new THREE.Mesh(valveHandleGeo, valveMat);
    valveHandle.rotation.y = Math.PI / 4;
    valveHandle.position.set(1.4, 0.05, 0.8);
    sanGroup.add(valveHandle);

    // Fire Protection Pipe (ACI - Red #E63946)
    const aciPipe = new THREE.Mesh(mainPipeGeo, aciRedMat);
    aciPipe.rotation.z = Math.PI / 2;
    aciPipe.position.set(0, 0.85, 0.8); // Intersects with electrical branch!
    sanGroup.add(aciPipe);

    // 4. HVAC / MECHANICAL (Ducts and Diffusers)
    const ductGeo = new THREE.BoxGeometry(0.85, 0.55, 3.8);
    const hvacMat = new THREE.MeshPhysicalMaterial({
      color: 0x9CA3AF,
      roughness: 0.25,
      metalness: 0.75,
      clearcoat: 0.4,
      transparent: true,
      opacity: 0.40,
      transmission: 0.35,
      ior: 1.4,
      side: THREE.DoubleSide
    });
    const duct = new THREE.Mesh(ductGeo, hvacMat);
    duct.position.set(-0.5, 0.3, 0);
    hvacGroup.add(duct);

    // Duct transition / reduction fitting (P9)
    const reducerGeo = new THREE.BoxGeometry(0.55, 0.35, 0.5);
    const reducer = new THREE.Mesh(reducerGeo, hvacMat);
    reducer.position.set(-1.8, 0.3, 0);
    hvacGroup.add(reducer);

    // Ceiling diffusers (4-way, P9)
    const diffuserMat = new THREE.MeshStandardMaterial({
      color: 0xE5E7EB,
      roughness: 0.4,
      metalness: 0.3
    });
    const diffuserGeo = new THREE.BoxGeometry(0.35, 0.04, 0.35);
    [[1.4, 1.28, 0.9], [1.4, 1.28, -0.9]].forEach(([x, y, z]) => {
      const diffuser = new THREE.Mesh(diffuserGeo, diffuserMat);
      diffuser.position.set(x, y, z);
      hvacGroup.add(diffuser);
      const vent = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.BoxGeometry(0.32, 0.01, 0.32)),
        new THREE.LineBasicMaterial({ color: 0x374151 })
      );
      vent.position.set(x, y - 0.02, z);
      hvacGroup.add(vent);
    });

    // 5. CLASH MARKER (Pulsing Red Halo at Clash point)
    const clashGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const clashMat = new THREE.MeshBasicMaterial({ color: 0xE63946, wireframe: true });
    const clashMarker = new THREE.Mesh(clashGeo, clashMat);
    clashMarker.position.set(0, 0.85, -0.6); // Collision of ACI/Sanitary vs Cable Tray
    clashesGroup.add(clashMarker);

    // Inner core glow sphere for clash
    const clashCoreGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const clashCoreMat = new THREE.MeshBasicMaterial({ color: 0xE63946, transparent: true, opacity: 0.8 });
    const clashCore = new THREE.Mesh(clashCoreGeo, clashCoreMat);
    clashCore.position.set(0, 0.85, -0.6);
    clashesGroup.add(clashCore);

    // Animation Loop
    let reqId: number;
    let angle = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (autoRotateRef.current && mainGroup) {
        mainGroup.rotation.y += 0.005;
      }

      // Pulse clash markers
      angle += 0.05;
      const scale = 1 + Math.sin(angle) * 0.25;
      clashMarker.scale.set(scale, scale, scale);
      clashCore.scale.set(scale, scale, scale);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      disposeScene();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle Layer Visibilities
  useEffect(() => {
    const { struct, elec, san, hvac, clashes } = groupsRef.current;
    if (struct) struct.visible = activeLayers.structure;
    if (elec) elec.visible = activeLayers.electrical;
    if (san) san.visible = activeLayers.sanitary;
    if (hvac) hvac.visible = activeLayers.hvac;
    if (clashes) clashes.visible = activeLayers.clashes;
  }, [activeLayers]);

  // Viewport Presets
  const setPresetView = (preset: 'iso' | 'top' | 'front') => {
    const camera = groupsRef.current.camera;
    const mainGroup = groupsRef.current.mainGroup;
    if (!camera) return;
    // Reset accumulated auto-rotation so presets align to world axes
    if (mainGroup) mainGroup.rotation.y = 0;
    if (preset === 'iso') {
      camera.position.set(4, 3, 5);
    } else if (preset === 'top') {
      camera.position.set(0, 6, 0.1);
    } else if (preset === 'front') {
      camera.position.set(0, 0.5, 6);
    }
    camera.lookAt(0, 0, 0);
  };

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const presetElementsList: ElementInfo[] = [
    {
      id: 'MEP-ELEC-TRAY-302',
      name: 'Bandeja Porta-Cables Principal',
      category: 'Eléctrica / BMS',
      lod: 'LOD 350',
      system: 'Alimentación Secundaria 380V / 220V',
      dimensions: '300mm x 100mm (L: 12.5m)',
      material: 'Acero Galvanizado Pesado',
      status: 'Coordinado - Sin Interferencias',
      notes: 'Ruteo optimizado con derivaciones para tableros de automatización PLC.'
    },
    {
      id: 'MEP-HVAC-DUCT-108',
      name: 'Ducto Extracción Mecánica HVAC',
      category: 'Climatización & HVAC',
      lod: 'LOD 350',
      system: 'Sistema de Inyección / Extracción de Aire',
      dimensions: '800mm x 500mm',
      material: 'Chapa Galvanizada ISO 19650',
      status: 'Interferencia Resuelta (#CLASH-104)',
      notes: 'Desplazamiento vertical +150mm realizado en fase digital. Cero re-trabajo en obra.'
    },
    {
      id: 'MEP-SAN-PIPE-204',
      name: 'Tubería Red Sanitaria ACI / Agua Fría',
      category: 'Redes Sanitarias',
      lod: 'LOD 350',
      system: 'Agua Potable e Industrial',
      dimensions: 'Ø 3" (75mm)',
      material: 'CPVC Industrial SCH 80',
      status: 'Coordinado',
      notes: 'Cálculo de pendientes al 2.0% e integración con pase en viga estructural.'
    },
    {
      id: 'MEP-AUTO-PANEL-01',
      name: 'Tablero Control PLC & BMS Energy',
      category: 'Tableros de Automatización',
      lod: 'LOD 400',
      system: 'Automatización Industrial',
      dimensions: '800x1200x400mm',
      material: 'Gabinete NEMA 4X Stainless Steel',
      status: 'Aprobado ISO 19650',
      notes: 'Integrado con protocolo Modbus TCP/IP para monitoreo remoto en tiempo real.'
    }
  ];

  return (
    <section id="viewer-3d" className="py-16 md:py-24 px-4 md:px-12 bg-[#090f14]/80 relative border-y border-[#1E293B]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1F2937] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] font-code text-xs uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Módulo Interactivo 3D WebGL • Visor Navisworks / Revit
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#F9FAFB]">
              Visor 3D MEP <span className="text-[#FFB800]">LOD 400</span>
            </h2>
            <p className="font-body text-[#9CA3AF] text-base max-w-2xl mt-2">
              Interacción directa con el modelo digital federado. Detecta y resuelve interferencias entre especialidades antes de construir en obra.
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

        {/* 3D Viewport and Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main 3D Canvas Box */}
          <div className="lg:col-span-8 space-y-3">
            <div className="glass-panel relative p-1 active-glow rounded-xs overflow-hidden">
              
              {/* Top Bar inside Viewport */}
              <div className="bg-[#0B0F17] border-b border-[#1F2937] px-4 py-2 flex flex-wrap justify-between items-center gap-2 font-code text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse"></span>
                  <span className="text-[#F9FAFB] font-semibold uppercase">MODELO FEDERADO MULTI-ESPECIALIDAD LOD 400</span>
                </div>
                <div className="text-[#9CA3AF] text-[11px] flex items-center gap-3">
                  <span>COORD_REF: -12.043, -77.028</span>
                  <span className="text-[#E63946] border border-[#E63946]/40 px-1.5 py-0.5 font-bold">CLASH DETECTION ACTIVE</span>
                </div>
              </div>

              {/* WebGL Canvas Container */}
              <div
                ref={containerRef}
                className="w-full h-[380px] md:h-[460px] bg-[#0B0F17] cursor-grab active:cursor-grabbing relative overflow-hidden"
              >
                {/* Floating Clash Alert Overlay Card */}
                {activeLayers.clashes && (
                  <div className="absolute top-4 left-4 right-4 sm:right-auto max-w-md bg-[#111827]/95 border-2 border-[#E63946] p-3.5 shadow-[0_0_20px_rgba(230,57,70,0.5)] z-20 backdrop-blur-md animate-pulse">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-code text-[11px] font-black text-[#E63946] uppercase tracking-wider block">
                          [ALERTA DE INTERFERENCIA: Cruce Crítico de Red Sanitaria vs. Trayectoria Eléctrica - Resuelto en Digital]
                        </span>
                        <p className="font-body text-[11px] text-[#F9FAFB]">
                          Detalle: Tubería ACI de 3" colisionaba con bandeja porta-cables principal. Re-ruteada a +180mm en modelo federado.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Viewport Floating Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-between items-center gap-2 pointer-events-auto">
                
                {/* Camera Rotation & Presets */}
                <div className="flex flex-wrap items-center gap-2 bg-[#111827]/90 backdrop-blur-md p-1.5 border border-[#1F2937] text-xs font-code">
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`px-2.5 py-1.5 flex items-center gap-1.5 transition-all ${
                      autoRotate
                        ? 'bg-[#FFB800] text-[#0B0F17] font-bold'
                        : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                    GIRAR 3D
                  </button>

                  <div className="h-4 w-px bg-[#1F2937]"></div>

                  <button
                    onClick={() => setPresetView('iso')}
                    className="px-2 py-1 bg-[#1F2937] text-[#9CA3AF] hover:text-[#FFB800] transition-all"
                  >
                    ISO
                  </button>
                  <button
                    onClick={() => setPresetView('top')}
                    className="px-2 py-1 bg-[#1F2937] text-[#9CA3AF] hover:text-[#FFB800] transition-all"
                  >
                    PLANTA
                  </button>
                  <button
                    onClick={() => setPresetView('front')}
                    className="px-2 py-1 bg-[#1F2937] text-[#9CA3AF] hover:text-[#FFB800] transition-all"
                  >
                    CORTE
                  </button>
                </div>

                {/* Layer Toggles strictly labeled */}
                <div className="flex flex-wrap items-center gap-1.5 bg-[#111827]/90 backdrop-blur-md p-1.5 border border-[#1F2937] text-[11px] font-code">
                  <span className="text-[#9CA3AF] px-1 hidden sm:inline">CAPAS:</span>
                  
                  <button
                    onClick={() => toggleLayer('electrical')}
                    className={`px-2 py-1 flex items-center gap-1 border transition-all ${
                      activeLayers.electrical
                        ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800] font-bold'
                        : 'bg-[#1F2937] border-[#1F2937] text-[#9CA3AF]'
                    }`}
                  >
                    Eléctricas
                  </button>

                  <button
                    onClick={() => toggleLayer('sanitary')}
                    className={`px-2 py-1 flex items-center gap-1 border transition-all ${
                      activeLayers.sanitary
                        ? 'bg-[#00A8E8]/20 border-[#00A8E8] text-[#00A8E8] font-bold'
                        : 'bg-[#1F2937] border-[#1F2937] text-[#9CA3AF]'
                    }`}
                  >
                    Sanitarias
                  </button>

                  <button
                    onClick={() => toggleLayer('hvac')}
                    className={`px-2 py-1 flex items-center gap-1 border transition-all ${
                      activeLayers.hvac
                        ? 'bg-[#9CA3AF]/20 border-[#9CA3AF] text-[#F9FAFB] font-bold'
                        : 'bg-[#1F2937] border-[#1F2937] text-[#9CA3AF]'
                    }`}
                  >
                    HVAC
                  </button>

                  <button
                    onClick={() => toggleLayer('structure')}
                    className={`px-2 py-1 flex items-center gap-1 border transition-all ${
                      activeLayers.structure
                        ? 'bg-[#1F2937] border-slate-500 text-[#F9FAFB] font-bold'
                        : 'bg-[#1F2937] border-[#1F2937] text-[#9CA3AF]'
                    }`}
                  >
                    Estructura
                  </button>

                  <button
                    onClick={() => toggleLayer('clashes')}
                    className={`px-2 py-1 flex items-center gap-1 border transition-all ${
                      activeLayers.clashes
                        ? 'bg-[#E63946]/20 border-[#E63946] text-[#E63946] font-bold'
                        : 'bg-[#1F2937] border-[#1F2937] text-[#9CA3AF]'
                    }`}
                  >
                    Cruces
                  </button>
                </div>

              </div>

            </div>

            {/* Quick Element Selector bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-code text-xs">
              {presetElementsList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedElement(item)}
                  className={`p-2.5 text-left border transition-all ${
                    selectedElement.id === item.id
                      ? 'bg-[#FFB800]/10 border-[#FFB800] text-white active-glow'
                      : 'bg-[#111827] border-[#1F2937] text-[#9CA3AF] hover:border-[#374151]'
                  }`}
                >
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
                  <span className="font-code text-xs text-[#FFB800] uppercase font-bold tracking-wider">
                    INSPECTOR DE ELEMENTO BIM
                  </span>
                </div>
                <span className="bg-[#E63946]/20 text-[#E63946] text-[10px] font-code px-2 py-0.5 font-bold border border-[#E63946]/40">
                  {selectedElement.lod}
                </span>
              </div>

              <div>
                <span className="font-code text-[10px] text-[#9CA3AF] uppercase block">IDENTIFICADOR IFC</span>
                <div className="font-code text-sm font-bold text-[#FFB800]">{selectedElement.id}</div>
                <h3 className="font-display text-lg font-bold text-white mt-1">{selectedElement.name}</h3>
              </div>

              <div className="space-y-2.5 text-xs font-code bg-[#0B0F17] p-3 border border-[#1F2937]">
                <div className="flex justify-between border-b border-[#1F2937]/60 pb-1.5">
                  <span className="text-[#9CA3AF]">Especialidad:</span>
                  <span className="text-white font-semibold">{selectedElement.category}</span>
                </div>
                <div className="flex justify-between border-b border-[#1F2937]/60 pb-1.5">
                  <span className="text-[#9CA3AF]">Sistema MEP:</span>
                  <span className="text-[#FFB800] font-semibold">{selectedElement.system}</span>
                </div>
                <div className="flex justify-between border-b border-[#1F2937]/60 pb-1.5">
                  <span className="text-[#9CA3AF]">Dimensiones:</span>
                  <span className="text-white font-semibold">{selectedElement.dimensions}</span>
                </div>
                <div className="flex justify-between border-b border-[#1F2937]/60 pb-1.5">
                  <span className="text-[#9CA3AF]">Materialidad:</span>
                  <span className="text-[#9CA3AF] font-semibold">{selectedElement.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Estado Coordinación:</span>
                  <span className="text-[#FFB800] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB800]" />
                    Coordinado
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#111827] border-l-2 border-[#FFB800] space-y-1">
                <span className="font-code text-[10px] text-[#FFB800] uppercase font-bold flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Nota Técnica ISO 19650
                </span>
                <p className="font-body text-xs text-[#9CA3AF] leading-relaxed">
                  {selectedElement.notes}
                </p>
              </div>

            </div>

            <div className="pt-4 border-t border-[#1F2937] space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-code text-[#9CA3AF]">
                <ShieldCheck className="w-4 h-4 text-[#FFB800]" />
                <span>Verificado por Protocolo Navisworks / Solibri</span>
              </div>
              <button
                onClick={() => {
                  const element = document.getElementById('calculadora');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-[#1a2026] hover:bg-[#00E5FF] hover:text-[#070D12] text-[#00E5FF] border border-[#00E5FF] font-display font-bold text-xs uppercase tracking-wider py-2.5 transition-all text-center block"
              >
                Calcular Ahorro en Obra para este Proyecto →
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
