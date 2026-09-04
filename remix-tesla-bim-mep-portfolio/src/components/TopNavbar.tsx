import React, { useState } from 'react';
import { Menu, X, Cpu, Layers, FileSpreadsheet, ShieldCheck, Calculator, Send } from 'lucide-react';

interface TopNavbarProps {
  onOpenContact: () => void;
  onOpenDeliverables: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenContact, onOpenDeliverables }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-[#1E293B] shadow-xl px-4 md:px-12 h-16 flex justify-between items-center">
      {/* Brand */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
        <img
          src="/logo-tesla.png"
          alt="Logo TESLA Electricidad y Automatización S.A.C."
          className="h-11 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,184,0,0.25)]"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-display text-sm md:text-base font-black tracking-tight text-[#FFB800] uppercase">
            TESLA <span className="hidden sm:inline text-xs text-[#dde3ea]/90 font-semibold tracking-normal">ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.</span>
          </span>
          <span className="font-code text-[10px] text-[#FFB800] tracking-widest uppercase">
            MEP COORDINATION DIVISION • ISO 19650
          </span>
        </div>
      </div>

      {/* Desktop Links */}
      <div className="hidden lg:flex items-center gap-8 font-code text-xs uppercase tracking-wider">
        <button
          onClick={() => scrollToSection('hero')}
          className="text-[#FFB800] font-bold border-b-2 border-[#FFB800] pb-0.5 transition-colors"
        >
          Inicio
        </button>
        <button
          onClick={() => scrollToSection('viewer-3d')}
          className="text-[#bac9cc] hover:text-[#FFB800] transition-colors flex items-center gap-1.5"
        >
          <Cpu className="w-3.5 h-3.5 text-[#FFB800]" />
          Visor 3D MEP
        </button>
        <button
          onClick={() => scrollToSection('especialidades')}
          className="text-[#bac9cc] hover:text-[#FFB800] transition-colors flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-[#FFB800]" />
          Especialidades
        </button>
        <button
          onClick={() => scrollToSection('calculadora')}
          className="text-[#bac9cc] hover:text-[#FFB800] transition-colors flex items-center gap-1.5"
        >
          <Calculator className="w-3.5 h-3.5 text-[#FFB800]" />
          Calculadora ROI
        </button>
        <button
          onClick={() => scrollToSection('proyectos')}
          className="text-[#bac9cc] hover:text-[#FFB800] transition-colors"
        >
          Proyectos
        </button>
        <button
          onClick={onOpenDeliverables}
          className="text-[#bac9cc] hover:text-[#FFB800] transition-colors flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFB800]" />
          Entregables
        </button>
      </div>

      {/* Action Badges & Quote CTA */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-[#111827] border border-[#E63946]/40 px-2.5 py-1 rounded-xs">
          <span className="bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/50 px-2 py-0.5 text-[10px] font-code font-bold uppercase tracking-widest leading-none">
            NORMA ISO 19650 | LOD 400
          </span>
        </div>

        <button
          onClick={onOpenContact}
          className="bg-[#E63946] hover:bg-[#C1121F] text-white font-display font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_0_14px_rgba(230,57,70,0.4)]"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Solicitar</span> Cotización
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-1.5 bg-[#161f2e] border border-slate-700 text-[#dde3ea] hover:text-[#FFB800]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#0B0F17] border-b border-[#1E293B] p-6 flex flex-col gap-4 font-code text-xs uppercase tracking-wider shadow-2xl lg:hidden">
          <button
            onClick={() => scrollToSection('hero')}
            className="text-left text-[#FFB800] py-2 border-b border-[#1E293B]"
          >
            • Inicio
          </button>
          <button
            onClick={() => scrollToSection('viewer-3d')}
            className="text-left text-[#dde3ea] hover:text-[#FFB800] py-2 border-b border-[#1E293B]"
          >
            • Visor 3D Modelo Federado
          </button>
          <button
            onClick={() => scrollToSection('especialidades')}
            className="text-left text-[#dde3ea] hover:text-[#FFB800] py-2 border-b border-[#1E293B]"
          >
            • Especialidades MEP
          </button>
          <button
            onClick={() => scrollToSection('calculadora')}
            className="text-left text-[#dde3ea] hover:text-[#FFB800] py-2 border-b border-[#1E293B]"
          >
            • Calculadora de Optimización ROI
          </button>
          <button
            onClick={() => scrollToSection('proyectos')}
            className="text-left text-[#dde3ea] hover:text-[#FFB800] py-2 border-b border-[#1E293B]"
          >
            • Portafolio de Proyectos
          </button>
          <button
            onClick={() => {
              setMobileOpen(false);
              onOpenDeliverables();
            }}
            className="text-left text-[#dde3ea] hover:text-[#FFB800] py-2 border-b border-[#1E293B]"
          >
            • Paquete de Entregables (BIM 5D)
          </button>
          <button
            onClick={() => {
              setMobileOpen(false);
              onOpenContact();
            }}
            className="mt-2 bg-[#E63946] hover:bg-[#d92c39] text-white font-display font-bold py-3 text-center uppercase tracking-wider shadow-[0_0_12px_rgba(230,57,70,0.4)]"
          >
            Solicitar Coordinación / Clash Report
          </button>
        </div>
      )}
    </nav>
  );
};
