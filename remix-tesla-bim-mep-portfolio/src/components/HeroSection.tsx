import React from 'react';
import { ShaderBackground } from './ShaderBackground';
import { Calculator, ArrowRight, CheckCircle2, ShieldCheck, Layers, FileCode2, Play } from 'lucide-react';

interface HeroSectionProps {
  onOpenDeliverables: () => void;
  onOpenContact: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDeliverables, onOpenContact }) => {
  const scrollToCalculator = () => {
    const el = document.getElementById('calculadora');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToViewer = () => {
    const el = document.getElementById('viewer-3d');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center pt-24 pb-16 px-4 md:px-12 overflow-hidden border-b border-[#1E293B]">
      
      {/* WebGL Shader Canvas Background */}
      <ShaderBackground className="absolute inset-0 w-full h-full opacity-50 pointer-events-none" />

      {/* Grid overlay for technical blueprint effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,184,0,0.06)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Headline and CTAs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Brand */}
          <div className="flex items-center gap-4">
            <img
              src="/logo-tesla.png"
              alt="Logo TESLA Electricidad y Automatización S.A.C."
              className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_24px_rgba(255,184,0,0.35)]"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-xl md:text-2xl font-black tracking-tight text-[#FFB800] uppercase">
                TESLA
              </span>
              <span className="font-code text-[11px] md:text-xs text-[#dde3ea]/80 uppercase tracking-wider">
                Electricidad y Automatización S.A.C.
              </span>
              <span className="font-code text-[10px] text-[#E63946] uppercase tracking-widest font-bold">
                Coordinación BIM MEP • ISO 19650
              </span>
            </div>
          </div>

          {/* ISO Badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 border border-[#E63946]/50 bg-[#E63946]/15 rounded-xs">
            <span className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse"></span>
            <span className="font-code text-xs text-[#E63946] font-extrabold tracking-wider uppercase">
              NORMA ISO 19650 | LOD 400
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F9FAFB] leading-[1.1] tracking-tight">
            Compatibilizamos tus Planos e Instalaciones en 3D{' '}
            <span className="text-[#FFB800] drop-shadow-[0_0_15px_rgba(255,184,0,0.3)]">
              Antes de Construir
            </span>
          </h1>

          {/* Description */}
          <p className="font-body text-base md:text-xl text-[#9CA3AF] max-w-2xl leading-relaxed">
            Evita adicionales de obra, picar losas o demoler muros. Unimos redes eléctricas, sanitarias y climatización en un modelo digital federado para entregarte planos de montaje sin errores y metrados exactos.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={scrollToCalculator}
              className="bg-[#E63946] hover:bg-[#C1121F] text-white font-display font-black text-sm md:text-base px-6 py-4 active:scale-95 transition-all flex items-center gap-2.5 shadow-[0_0_20px_rgba(230,57,70,0.4)]"
            >
              <span>Simular Ahorro en Soles (S/.)</span>
              <Calculator className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenDeliverables}
              className="border border-[#374151] text-white font-display font-bold text-sm md:text-base px-6 py-4 hover:bg-[#111827] hover:border-[#FFB800] hover:text-[#FFB800] active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Ver Paquete de Entregables (.RVT / .NWD)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToViewer}
              className="hidden sm:flex items-center gap-2 text-xs font-code text-[#FFB800] hover:underline px-3 py-2"
            >
              <Play className="w-3.5 h-3.5 fill-[#FFB800]" />
              Ver Demo 3D Interactivo
            </button>
          </div>

          {/* Key Advantages Pills */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#1E293B]/80 font-code text-xs">
            <div className="flex items-center gap-2 text-[#bac9cc]">
              <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0" />
              <span>Modelado LOD 350 / 400</span>
            </div>
            <div className="flex items-center gap-2 text-[#bac9cc]">
              <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0" />
              <span>0% Cruces No Detectados</span>
            </div>
            <div className="flex items-center gap-2 text-[#bac9cc]">
              <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0" />
              <span>Planos de Pases .RVT</span>
            </div>
            <div className="flex items-center gap-2 text-[#bac9cc]">
              <CheckCircle2 className="w-4 h-4 text-[#E63946] shrink-0" />
              <span>Metrados BIM 5D</span>
            </div>
          </div>

        </div>

        {/* Right Column: Live BIM Telemetry Card */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-xs space-y-5 border border-[#1E293B] relative active-glow">
            
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <span className="font-code text-xs text-[#FFB800] uppercase font-bold tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFB800]" />
                DATOS DE COORDINACIÓN TESLA
              </span>
              <span className="bg-[#FFB800]/20 text-[#FFB800] text-[10px] font-code font-bold px-2 py-0.5 border border-[#FFB800]/40">
                ACTIVO
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0B0F17] p-4 border border-[#1E293B] space-y-1">
                <span className="font-code text-[11px] text-[#849396] uppercase block">PROYECTOS COORDINADOS</span>
                <div className="font-display text-3xl font-black text-white flex items-baseline gap-2">
                  <span>+150</span>
                  <span className="text-xs font-code font-normal text-[#FFB800]">Edificaciones Complejas</span>
                </div>
              </div>

              <div className="bg-[#0B0F17] p-4 border border-[#1E293B] space-y-1">
                <span className="font-code text-[11px] text-[#849396] uppercase block">CRUCES CRÍTICOS DETECTADOS</span>
                <div className="font-display text-3xl font-black text-[#FFB800] flex items-baseline gap-2">
                  <span>14,280</span>
                  <span className="text-xs font-code font-normal text-[#bac9cc]">en fase digital</span>
                </div>
              </div>

              <div className="bg-[#0B0F17] p-4 border border-[#1E293B] space-y-1">
                <span className="font-code text-[11px] text-[#849396] uppercase block">AHORRO TOTAL PROMEDIO OBRA</span>
                <div className="font-display text-3xl font-black text-[#E63946] flex items-baseline gap-2">
                  <span>12.5%</span>
                  <span className="text-xs font-code font-normal text-[#bac9cc]">del presupuesto MEP</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenContact}
              className="w-full bg-[#161f2e] hover:bg-[#FFB800] hover:text-[#0B0F17] text-[#FFB800] border border-[#FFB800] font-display font-bold text-xs uppercase tracking-wider py-3 transition-all text-center block shadow-sm"
            >
              Solicitar Auditoría BIM de su Proyecto
            </button>

          </div>
        </div>

      </div>
    </section>
  );
};
