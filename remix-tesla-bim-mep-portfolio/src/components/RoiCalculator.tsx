import React, { useState } from 'react';
import { Calculator, Home, Building2, Factory, TrendingUp, AlertOctagon, Check } from 'lucide-react';
import { BIM_METRICS, METRIC_ORDER, BuildingType } from '../data/bimMetrics';

interface RoiCalculatorProps {
  onOpenContact: () => void;
}

const ICONS = { Home, Building2, Factory } as const;

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onOpenContact }) => {
  const [area, setArea] = useState<number>(3500);
  const [buildingType, setBuildingType] = useState<BuildingType>('industrial');

  const currentMult = BIM_METRICS[buildingType];
  const conflictsPrevented = Math.floor(area * currentMult.clashFactor);
  const estimatedSavingsPEN = Math.floor(conflictsPrevented * currentMult.costPerClash);

  const applyPreset = (presetArea: number, type: BuildingType) => {
    setArea(presetArea);
    setBuildingType(type);
  };

  return (
    <section id="calculadora" className="py-20 px-4 md:px-12 bg-[#0B0F17] relative border-b border-[#1F2937]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] font-code text-xs uppercase tracking-widest">
            <Calculator className="w-3.5 h-3.5" />
            Simulador en Soles (S/.) • Retorno de Inversión
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-black text-[#F9FAFB]">
            Calculadora de Ahorro <span className="text-[#FFB800]">BIM MEP</span>
          </h2>
          <p className="font-body text-[#9CA3AF] text-base">
            Estime en tiempo real los adicionales de obra y re-trabajos eliminados antes de ejecutar las instalaciones.
          </p>
        </div>

        {/* Main Glass Panel Box */}
        <div className="glass-panel p-6 md:p-10 rounded-xs grid grid-cols-1 lg:grid-cols-12 gap-8 relative overflow-hidden border border-[#1F2937]">
          
          <div className="absolute top-0 right-0 p-3 font-code text-[10px] text-[#FFB800]/40 uppercase tracking-widest hidden sm:block">
            Norma ISO 19650 • Moneda: PEN (S/.)
          </div>

          {/* Left Column: Input Sliders & Selectors */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Area Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="font-code text-xs text-[#9CA3AF] uppercase font-semibold">
                  ÁREA TOTAL DEL PROYECTO (m²)
                </label>
                <span className="font-code text-xl font-bold text-[#FFB800] bg-[#111827] px-3 py-1 border border-[#FFB800]/40">
                  {area.toLocaleString()} m²
                </span>
              </div>

              <input
                type="range"
                min={200}
                max={10000}
                step={100}
                value={area}
                onChange={(e) => setArea(parseInt(e.target.value))}
                className="custom-slider cursor-pointer w-full"
              />

              <div className="flex justify-between font-code text-[10px] text-[#9CA3AF]">
                <span>200 m²</span>
                <span>2,500 m²</span>
                <span>5,000 m²</span>
                <span>7,500 m²</span>
                <span>10,000 m²</span>
              </div>
            </div>

            {/* Building Type Selector */}
            <div className="space-y-3">
              <label className="font-code text-xs text-[#9CA3AF] uppercase font-semibold block">
                TIPO DE EDIFICACIÓN / PROYECTO
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-code text-xs">
                {METRIC_ORDER.map((id) => {
                  const metric = BIM_METRICS[id];
                  const Icon = ICONS[metric.icon];
                  const active = buildingType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBuildingType(id)}
                      className={`p-3.5 border text-left flex flex-col justify-between gap-2 transition-all ${
                        active
                          ? 'bg-[#111827] border-[#FFB800] text-[#FFB800] shadow-[0_0_12px_rgba(255,184,0,0.2)] font-bold'
                          : 'bg-[#111827] border-[#1F2937] text-[#9CA3AF] hover:border-[#374151]'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <Icon className="w-4 h-4 text-[#FFB800]" />
                        <span className="text-[10px] opacity-70">{metric.clashFactor} /m²</span>
                      </div>
                      <span className="text-xs">{metric.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-[#1F2937] space-y-2">
              <span className="font-code text-[11px] text-[#9CA3AF] block">ESCENARIOS FRECUENTES:</span>
              <div className="flex flex-wrap gap-2 font-code text-xs">
                <button
                  onClick={() => applyPreset(1500, 'residencial')}
                  className="px-2.5 py-1 bg-[#111827] border border-[#1F2937] text-[#9CA3AF] hover:text-[#FFB800] transition-all"
                >
                  Edificio Multifamiliar 1,500m²
                </button>
                <button
                  onClick={() => applyPreset(3500, 'industrial')}
                  className="px-2.5 py-1 bg-[#111827] border border-[#1F2937] text-[#9CA3AF] hover:text-[#FFB800] transition-all"
                >
                  Planta Industrial 3,500m²
                </button>
                <button
                  onClick={() => applyPreset(8000, 'comercial')}
                  className="px-2.5 py-1 bg-[#111827] border border-[#1F2937] text-[#9CA3AF] hover:text-[#FFB800] transition-all"
                >
                  Centro Comercial 8,000m²
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Calculated ROI Results */}
          <div className="lg:col-span-6 bg-[#111827] p-6 md:p-8 flex flex-col justify-between border border-[#1F2937] rounded-xs">
            
            <div className="space-y-6">
              
              <div>
                <span className="font-code text-xs text-[#E63946] uppercase font-bold tracking-wider block mb-1 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-[#E63946]" />
                  INTERFERENCIAS CRÍTICAS EVITADAS
                </span>
                <div className="font-display text-4xl md:text-5xl font-black text-[#FFB800] tracking-tight">
                  {conflictsPrevented.toLocaleString()} <span className="text-base font-code text-[#9CA3AF] font-normal">cruces resueltos en 3D</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1F2937]">
                <span className="font-code text-xs text-[#FFB800] uppercase font-bold tracking-wider block mb-1 flex items-center gap-1.5">
                  AHORRO ESTIMADO EN SOBRECOSTOS DE OBRA
                </span>
                <div className="font-display text-4xl md:text-5xl font-black text-[#E63946] tracking-tight">
                  S/. {estimatedSavingsPEN.toLocaleString()} PEN
                </div>
                <p className="font-body text-xs text-[#9CA3AF] mt-1">
                  Cálculo basado en costo promedio por choque evitado (S/. {currentMult.costPerClash.toLocaleString()} PEN/choque) para la tipología {currentMult.name}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1F2937] font-code text-xs">
                <div>
                  <span className="text-[#9CA3AF] block text-[10px] uppercase">FACTOR DE CRUCES</span>
                  <span className="font-bold text-white text-base">{currentMult.clashFactor} choques/m²</span>
                </div>
                <div>
                  <span className="text-[#9CA3AF] block text-[10px] uppercase">MONEDA DE CÁLCULO</span>
                  <span className="font-bold text-[#FFB800] text-base">Soles Peruanos (S/.)</span>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-[#1F2937] space-y-3">
              <button
                onClick={onOpenContact}
                className="w-full bg-[#E63946] hover:bg-[#C1121F] text-white font-display font-black text-sm uppercase tracking-wider py-4 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(230,57,70,0.4)]"
              >
                <span>Solicitar Cotización de Coordinación para este Proyecto</span>
                <TrendingUp className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] font-code text-[#9CA3AF]">
                <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>Propuesta técnica entregada en menos de 24 horas útiles</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
