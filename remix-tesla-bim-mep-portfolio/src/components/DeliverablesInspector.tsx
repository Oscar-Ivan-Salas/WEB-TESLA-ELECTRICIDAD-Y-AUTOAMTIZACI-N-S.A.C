import React, { useState } from 'react';
import { ClashItem } from '../types';
import { X, FileSpreadsheet, AlertTriangle, Compass, BarChart3, CheckCircle2, Download, ShieldCheck } from 'lucide-react';

interface DeliverablesInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
}

export const DeliverablesInspector: React.FC<DeliverablesInspectorProps> = ({ isOpen, onClose, onOpenContact }) => {
  const [activeTab, setActiveTab] = useState<'clash' | 'pases' | 'metrados' | 'iso'>('clash');

  if (!isOpen) return null;

  const sampleClashes: ClashItem[] = [
    { id: 'CLASH-101', spec1: 'HVAC Duct (800x500)', spec2: 'Tray Elec (300x100)', level: 'Sótano -1', gridRef: 'E-4', status: 'Resuelto', distance: '0 mm (Shift +150mm)', costImpact: 'S/ 4,440' },
    { id: 'CLASH-102', spec1: 'Tub. Agua Fría 3"', spec2: 'Viga Estructural V-201', level: 'Piso 2', gridRef: 'B-7', status: 'Aprobado', distance: 'Pase 150mm reforzado', costImpact: 'S/ 3,145' },
    { id: 'CLASH-103', spec1: 'Desagüe 4" (Pend. 2%)', spec2: 'Band. Datos Fibra', level: 'Piso 4', gridRef: 'C-2', status: 'Resuelto', distance: '+120 mm clearance', costImpact: 'S/ 3,515' },
    { id: 'CLASH-104', spec1: 'Ducto Extracción Monóxido', spec2: 'Columna C-04', level: 'Sótano -2', gridRef: 'A-1', status: 'Resuelto', distance: 'Desvío 45° con codo', costImpact: 'S/ 7,770' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F17] border border-[#1E293B] max-w-4xl w-full p-6 md:p-8 space-y-6 relative rounded-xs active-glow max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#161f2e] text-[#849396] hover:text-white border border-[#1E293B]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFB800]/20 text-[#FFB800] font-code text-[10px] font-bold px-2 py-0.5 border border-[#FFB800]/40">
              ENTREGABLES MODELO FEDERADO
            </span>
            <span className="font-code text-xs text-[#E63946] font-semibold">ESTÁNDAR ISO 19650-2</span>
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white">
            Paquete de Entregables Técnico TESLA
          </h3>
          <p className="font-body text-xs text-[#bac9cc]">
            Inspeccione los informes ejecutivos y bases de datos que entregamos en cada fase del proyecto.
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="flex flex-wrap gap-2 border-b border-[#1E293B] pb-3 font-code text-xs">
          <button
            onClick={() => setActiveTab('clash')}
            className={`px-4 py-2 border transition-all flex items-center gap-2 uppercase font-bold ${
              activeTab === 'clash'
                ? 'bg-[#FFB800] text-[#0B0F17] border-[#FFB800]'
                : 'bg-[#161f2e] text-[#bac9cc] border-[#1E293B] hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Clash Report
          </button>

          <button
            onClick={() => setActiveTab('pases')}
            className={`px-4 py-2 border transition-all flex items-center gap-2 uppercase font-bold ${
              activeTab === 'pases'
                ? 'bg-[#FFB800] text-[#0B0F17] border-[#FFB800]'
                : 'bg-[#161f2e] text-[#bac9cc] border-[#1E293B] hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            Planos de Pases
          </button>

          <button
            onClick={() => setActiveTab('metrados')}
            className={`px-4 py-2 border transition-all flex items-center gap-2 uppercase font-bold ${
              activeTab === 'metrados'
                ? 'bg-[#FFB800] text-[#0B0F17] border-[#FFB800]'
                : 'bg-[#161f2e] text-[#bac9cc] border-[#1E293B] hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Metrados BIM 5D
          </button>

          <button
            onClick={() => setActiveTab('iso')}
            className={`px-4 py-2 border transition-all flex items-center gap-2 uppercase font-bold ${
              activeTab === 'iso'
                ? 'bg-[#FFB800] text-[#0B0F17] border-[#FFB800]'
                : 'bg-[#161f2e] text-[#bac9cc] border-[#1E293B] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Cumplimiento ISO 19650
          </button>
        </div>

        {/* Tab Content 1: Clash Report Table */}
        {activeTab === 'clash' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-code">
              <span className="text-[#FFB800] font-bold">Matriz de Interferencias Solibri / Navisworks:</span>
              <span className="text-[#849396]">Total Cruces Resueltos: 100%</span>
            </div>

            <div className="overflow-x-auto border border-[#1E293B]">
              <table className="w-full text-left font-code text-xs">
                <thead className="bg-[#161f2e] text-[#FFB800] border-b border-[#1E293B]">
                  <tr>
                    <th className="p-2.5">ID CRUCE</th>
                    <th className="p-2.5">ELEMENTO 1</th>
                    <th className="p-2.5">ELEMENTO 2</th>
                    <th className="p-2.5">NIVEL / EJE</th>
                    <th className="p-2.5">ESTADO</th>
                    <th className="p-2.5">COSTO AHORRADO (S/.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] text-[#dde3ea]">
                  {sampleClashes.map((c) => (
                    <tr key={c.id} className="hover:bg-[#161c22]">
                      <td className="p-2.5 font-bold text-[#FFB800]">{c.id}</td>
                      <td className="p-2.5">{c.spec1}</td>
                      <td className="p-2.5 text-[#bac9cc]">{c.spec2}</td>
                      <td className="p-2.5 text-[11px]">{c.level} ({c.gridRef})</td>
                      <td className="p-2.5">
                        <span className="bg-[#FFB800]/20 text-[#FFB800] px-2 py-0.5 text-[10px] font-bold">
                          ✓ {c.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-[#E63946]">{c.costImpact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 2: Planos de Pases */}
        {activeTab === 'pases' && (
          <div className="space-y-4 font-code text-xs">
            <p className="text-[#bac9cc] font-body text-xs">
              Planos estructurales con acotado milimétrico de pases, manguitos y camisas en vigas y losas para garantizar que la estructura civil se vierta con todos los orificios exactos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0B0F17] p-4 border border-[#1E293B] space-y-2">
                <div className="text-[#FFB800] font-bold">PASE ESTRUCTURAL PA-102 (VIGA V-201)</div>
                <div className="text-[#bac9cc]">Dimensiones: Ø 150mm c/refuerzo helicoidal</div>
                <div className="text-[#bac9cc]">Especialidad que atraviesa: Tubería Drenaje Sanit. 4"</div>
                <div className="text-[#E63946] font-semibold">Aprobado por Ingeniero Calculista Estructural</div>
              </div>

              <div className="bg-[#0B0F17] p-4 border border-[#1E293B] space-y-2">
                <div className="text-[#FFB800] font-bold">PASE ESTRUCTURAL PA-105 (LOSA PISO 3)</div>
                <div className="text-[#bac9cc]">Dimensiones: 400x200mm c/manguito galvanizado</div>
                <div className="text-[#bac9cc]">Especialidad que atraviesa: Bandeja Alimentador Elec.</div>
                <div className="text-[#E63946] font-semibold">Aprobado por Ingeniero Calculista Estructural</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Metrados BIM 5D */}
        {activeTab === 'metrados' && (
          <div className="space-y-4 font-code text-xs">
            <p className="text-[#bac9cc] font-body text-xs">
              Extracción automática de cantidades desde el modelo federado. Cero variaciones por estimación manual.
            </p>

            <div className="bg-[#0B0F17] p-4 border border-[#1E293B] space-y-3">
              <div className="flex justify-between border-b border-[#1E293B] pb-2 text-[#FFB800] font-bold">
                <span>CONCEPTO / ITEM</span>
                <span>CANTIDAD MODELADA</span>
                <span>UNIDAD</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B]/60 pb-1">
                <span>Bandeja Porta-Cables Pesada 300x100mm</span>
                <span className="font-bold text-white">1,240.50</span>
                <span className="text-[#849396]">ml</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B]/60 pb-1">
                <span>Tubería CPVC SCH 80 Ø 3"</span>
                <span className="font-bold text-white">850.00</span>
                <span className="text-[#849396]">ml</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B]/60 pb-1">
                <span>Ducto Acero Galvanizado SMACNA 800x500mm</span>
                <span className="font-bold text-white">410.20</span>
                <span className="text-[#849396]">m²</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: ISO 19650 */}
        {activeTab === 'iso' && (
          <div className="space-y-4 font-code text-xs">
            <div className="bg-[#0B0F17] p-4 border border-[#1E293B] space-y-3">
              <div className="text-[#FFB800] font-bold text-sm">REQUISITOS CUMPLIDOS ISO 19650-1 / 19650-2:</div>
              <div className="space-y-2 text-[#bac9cc]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />
                  <span>Estructura de Carpetas y Nomenclatura CDE (Common Data Environment)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />
                  <span>Nivel de Información Necesaria (LOIN) definido en BEP (BIM Execution Plan)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />
                  <span>Intercambio de datos Abiertos en estándar OpenBIM IFC4.0 e ISO 16739</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#1E293B]">
          <button
            onClick={() => {
              onClose();
              onOpenContact();
            }}
            className="flex-1 bg-[#E63946] hover:bg-[#d92c39] text-white font-display font-bold text-xs uppercase py-3.5 text-center tracking-wider shadow-[0_0_12px_rgba(230,57,70,0.4)] flex items-center justify-center gap-2"
          >
            <span>Solicitar Muestra de Entregables para Su Proyecto</span>
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="px-6 border border-slate-700 text-[#bac9cc] hover:text-white font-code text-xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
