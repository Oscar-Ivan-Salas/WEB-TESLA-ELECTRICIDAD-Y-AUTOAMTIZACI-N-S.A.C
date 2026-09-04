import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Award, Cpu } from 'lucide-react';

interface FooterProps {
  onOpenDeliverables: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDeliverables, onOpenContact }) => {
  return (
    <footer className="bg-[#0B0F17] relative w-full py-12 border-t border-[#1E293B] text-xs font-code">
      <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-lg text-[#FFB800]">
              TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.
            </span>
          </div>
          <p className="text-[#849396] leading-relaxed max-w-sm">
            Especialistas líderes en coordinación BIM MEP, detección de interferencias en modelos federados LOD 350/400 y automatización de infraestructura industrial bajo norma ISO 19650.
          </p>
          <div className="text-[11px] text-[#FFB800] font-semibold space-y-1">
            <div>© 2026 TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.</div>
            <div className="text-[#849396] text-[10px] font-normal">Departamento de Diseño e Implementación: <span className="text-[#4FC3F7] font-semibold">GatoMichuy</span></div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-2 text-[#bac9cc]">
          <div className="text-[#FFB800] font-bold uppercase mb-2">Contacto de Ingeniería</div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
            <span>Lima - Perú • Proyectos a Nivel Nacional</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
            <span>+51 (1) 748-9200 / +51 987 654 321</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
            <span>proyectos@teslasac.com.pe</span>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col items-start md:items-end space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenDeliverables}
              className="px-3 py-1.5 bg-[#161f2e] border border-[#1E293B] hover:border-[#FFB800] text-[#bac9cc] hover:text-white transition-all"
            >
              BIM ISO 19650 Specs
            </button>
            <button
              onClick={onOpenContact}
              className="px-3 py-1.5 bg-[#E63946] hover:bg-[#d92c39] text-white font-bold transition-all shadow-[0_0_10px_rgba(230,57,70,0.4)]"
            >
              Solicitar Cotización
            </button>
          </div>

          <div className="flex items-center gap-2 text-[#849396] text-[10px]">
            <Award className="w-4 h-4 text-[#FFB800]" />
            <span>ISO 9001:2015 • ISO 19650-2 Certified Quality</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
