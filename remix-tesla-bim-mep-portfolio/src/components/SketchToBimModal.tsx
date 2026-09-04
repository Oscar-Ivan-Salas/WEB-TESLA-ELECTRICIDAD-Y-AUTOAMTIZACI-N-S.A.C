import React, { useEffect, useRef, useState } from 'react';
import { X, UploadCloud, RefreshCw, CheckCircle2, TrendingUp, FileCode2, Camera, ImagePlus } from 'lucide-react';

interface SketchToBimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
}

const SCAN_STEPS = [
  'Aplicando Architectural Volumetry Analysis y Spatial Aesthetic Integration...',
  'Generando Conceptual Rendering Overlay con Isometric MEP Routing (LOD 400)...',
  'Verificando Clash-Free Distribution Pattern e Infrastructure Topology (ISO 19650)...',
  'Mapeando BMS Heatmap Overlay, Security Sensor Topology e IoT Digital Twin Concept.',
];

const SAMPLE_METRICS = [
  { name: 'Red Eléctrica (bandejas + circuitos)', qty: '312 m', cost: 'S/ 86,400' },
  { name: 'Red Sanitaria / Agua Fría', qty: '248 m', cost: 'S/ 74,200' },
  { name: 'Red ACI / Desagüe', qty: '176 m', cost: 'S/ 52,800' },
  { name: 'Distribución HVAC + Difusores', qty: '18 eq.', cost: 'S/ 128,500' },
];

export const SketchToBimModal: React.FC<SketchToBimModalProps> = ({ isOpen, onClose, onOpenContact }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'idle' | 'scanning' | 'result'>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (mode !== 'scanning') return;
    setStep(0);
    setProgress(0);
    const prog = setInterval(() => setProgress((p) => Math.min(100, p + 3)), 45);
    const stepsTimer = setInterval(() => setStep((s) => Math.min(SCAN_STEPS.length - 1, s + 1)), 520);
    const done = setTimeout(() => {
      clearInterval(prog);
      clearInterval(stepsTimer);
      setProgress(100);
      setTimeout(() => setMode('result'), 380);
    }, 2600);
    return () => {
      clearInterval(prog);
      clearInterval(stepsTimer);
      clearTimeout(done);
    };
  }, [mode]);

  const handleFiles = (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setMode('scanning');
  };

  const reset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setMode('idle');
    setStep(0);
    setProgress(0);
  };

  const handleContact = () => {
    onClose();
    onOpenContact();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-[#0B0F17] border border-[#1E293B] shadow-2xl rounded-xs max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#FFB800]/10 border border-[#FFB800] flex items-center justify-center">
              <ImagePlus className="w-4 h-4 text-[#FFB800]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">SKETCH → BIM PRE-ESTIMADOR</h3>
              <span className="font-code text-[10px] text-[#9CA3AF] uppercase tracking-wider">
                AI Geometry Scanner • Metrados estimados en S/.
              </span>
            </div>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="p-1.5 bg-[#1F2937] text-[#dde3ea] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {mode === 'idle' && (
            <>
              <div
                className={`relative border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  dragOver ? 'border-[#FFB800] bg-[#FFB800]/10' : 'border-[#1E293B] bg-[#111827] hover:border-[#FFB800]/60'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
              >
                <UploadCloud className="w-12 h-12 text-[#FFB800]/70 mb-3" />
                <span className="font-display font-bold text-white text-sm">Arrastra aquí una foto de tu boceto a mano alzada</span>
                <span className="font-code text-[11px] text-[#9CA3AF] mt-1">o toca para elegir una imagen (JPG / PNG / HEIC)</span>
                <span className="mt-3 font-code text-[10px] text-[#E63946] uppercase tracking-wider font-bold">Pre-estimación gratuita</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
              <div className="p-3 bg-[#111827] border-l-2 border-[#00E5FF] text-[11px] font-body text-[#9CA3AF] flex gap-2">
                <Camera className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                <span>
                  Sube un boceto y nuestro motor genera un pre-estimado de metrados MEP con costos en Soles. Luego podrás solicitar la conversión oficial a modelo Revit LOD 400.
                </span>
              </div>
            </>
          )}

          {mode === 'scanning' && (
            <div className="space-y-4">
              {imageUrl && (
                <div className="relative h-40 bg-black border border-[#1E293B] overflow-hidden">
                  <img src={imageUrl} alt="Boceto" className="w-full h-full object-contain opacity-80" />
                  <div
                    className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFB800] to-transparent shadow-[0_0_12px_#FFB800]"
                    style={{ top: `${progress}%`, transition: 'top 0.05s linear' }}
                  />
                </div>
              )}
              <div className="space-y-2">
                {SCAN_STEPS.map((s, i) => (
                  <div key={s} className={`flex items-center gap-2 font-code text-[11px] transition-colors ${i <= step ? 'text-[#FFB800]' : 'text-[#4B5563]'}`}>
                    <RefreshCw className={`w-3 h-3 ${i === step ? 'animate-spin text-[#FFB800]' : i < step ? 'text-[#00E5FF]' : ''}`} />
                    <span>{s}</span>
                    {i < step && <CheckCircle2 className="w-3 h-3 text-[#00E5FF] ml-auto" />}
                  </div>
                ))}
              </div>
              <div className="h-1.5 bg-[#1F2937] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FFB800] to-[#00E5FF] transition-[width] duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between font-code text-[10px] text-[#9CA3AF]">
                <span>ESCANEANDO GEOMETRÍA...</span>
                <span className="text-[#FFB800]">{Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {mode === 'result' && (
            <div className="space-y-4">
              {imageUrl && (
                <img src={imageUrl} alt="Boceto" className="w-full h-28 object-contain bg-black border border-[#1E293B]" />
              )}

              <div className="flex items-center gap-2 font-code text-[11px] text-[#00E5FF] font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                Pre-estimación de metrados MEP · Confianza AI 87%
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_METRICS.map((m) => (
                  <div key={m.name} className="bg-[#0B0F17] border border-[#1F2937] p-3 space-y-1">
                    <span className="font-code text-[10px] text-[#9CA3AF] uppercase block">{m.name}</span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-display font-black text-[#FFB800] text-lg">{m.qty}</span>
                      <span className="font-code text-sm text-white font-bold">{m.cost}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-[#111827] border border-[#FFB800]/40 p-3">
                <span className="font-code text-[11px] text-[#9CA3AF] uppercase">Inversión estimada red MEP</span>
                <span className="font-display text-2xl font-black text-[#E63946]">S/ 341,900</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleContact}
                  className="flex-1 bg-[#E63946] hover:bg-[#C1121F] text-black font-display font-bold text-xs uppercase tracking-wider py-3 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <FileCode2 className="w-4 h-4" />
                  Solicitar conversión a Revit LOD 400
                </button>
                <button
                  onClick={reset}
                  className="px-4 bg-[#161F2E] hover:bg-[#1F2937] text-[#dde3ea] border border-[#1E293B] font-code text-xs py-3 transition-all"
                >
                  Nuevo boceto
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};