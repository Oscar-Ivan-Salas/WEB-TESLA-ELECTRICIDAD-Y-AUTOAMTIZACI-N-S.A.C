import React, { useState } from 'react';
import { Specialty } from '../types';
import { Zap, Droplets, Wind, Cpu, FileText, AlertTriangle, Compass, BarChart3, X, CheckCircle2, ChevronRight } from 'lucide-react';

interface SpecialtiesBentoProps {
  onOpenDeliverables: () => void;
  onOpenContact: () => void;
}

export const SpecialtiesBento: React.FC<SpecialtiesBentoProps> = ({ onOpenDeliverables, onOpenContact }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);

  const specialtiesData: Specialty[] = [
    {
      id: 'electrica',
      title: 'Eléctricas Inteligentes',
      subtitle: 'Sistemas de Potencia & BMS',
      description: 'Diseño de bandejas porta-cables, ductos subterráneos, alimentadores de fuerza y luminarias con ruteo optimizado para integración en BMS y tableros PLC.',
      icon: 'Zap',
      imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=1200&q=80',
      features: [
        'Modelado 3D de bandejas porta-cables pesadas y conduit flexible.',
        'Sincronización con sub-estaciones y grupos electrógenos.',
        'Verificación de radios de curvatura e índice de llenado según CNE.',
        'Detección automática de interferencias con redes de agua y ductos.'
      ],
      specs: [
        { label: 'Estándar Taller', value: 'NEMA VE-1 / IEC 61537' },
        { label: 'Tensión Operativa', value: '380V / 220V / 10kV Media Tensión' },
        { label: 'Nivel de Detalle', value: 'LOD 350 - Ready for Fabrication' },
        { label: 'Formato Entregable', value: 'Autodesk Revit .RVT / IFC4' }
      ]
    },
    {
      id: 'sanitaria',
      title: 'Redes Sanitarias & ACI',
      subtitle: 'Hidráulica Industrial & Agua Contra Incendios',
      description: 'Cálculo automatizado de pendientes, colectores principales, redes de agua fría/caliente y rociadores ACI en sótanos y losas de cimentación.',
      icon: 'Droplets',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      features: [
        'Optimización de pendientes en tuberías de desagüe industrial.',
        'Modelado de pases en vigas perimetrales y losas postensadas.',
        'Ruteo de redes de rociadores automáticos (Agua Contra Incendios NFPA 13).',
        'Metrados exactos de accesorios PVC, CPVC, Hierro Dúctil y HDPE.'
      ],
      specs: [
        { label: 'Normativa', value: 'RNE IS.010 / IS.020 / NFPA 13' },
        { label: 'Tolerancia Inclinación', value: '1.0% a 2.0% estricto' },
        { label: 'Validación Cruces', value: 'Pases reforzados con manguitos' },
        { label: 'Entregable', value: 'Planos de Pases + Tablas de Metrado' }
      ]
    },
    {
      id: 'hvac',
      title: 'Climatización & HVAC',
      subtitle: 'Ventilación Mecánica & Extracción',
      description: 'Modelado volumétrico de ductería de alta eficiencia, Unidades Manejadoras de Aire (UMA), VRF, chillers y extractores de monóxido en estacionamientos.',
      icon: 'Wind',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      features: [
        'Ductos de aire acondicionado aislados térmicamente.',
        'Verificación de espacio libre para mantenimiento de motores.',
        'Ruteo de líneas de refrigerante de cobre y drenajes de condensado.',
        'Análisis de interferencias volumétricas con vigas y luminarias.'
      ],
      specs: [
        { label: 'Estándar Fabricación', value: 'SMACNA / ASHRAE 90.1' },
        { label: 'Sistemas', value: 'VRV/VRF, Chillers, Extracción Garajes' },
        { label: 'Análisis Térmico', value: 'Integración con Cargas BEM' },
        { label: 'Entregables', value: 'Plano de Trazado + Fichas de Equipos' }
      ]
    },
    {
      id: 'automatizacion',
      title: 'Tableros de Automatización',
      subtitle: 'Control Industrial PLC & SCADA',
      description: 'Integración de hardware y software para el control centralizado de la infraestructura energética, BMS (Building Management System) y cuadros de mando.',
      icon: 'Cpu',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      features: [
        'Diseño en 3D de gabinetes de control NEMA y canalizaciones dedicadas.',
        'Ubicación exacta de sensores de temperatura, flujo y presión.',
        'Conexión serial y ethernet Modbus / BACnet / Profinet.',
        'Planos de conexionado y diagramas unifilares 2D/3D.'
      ],
      specs: [
        { label: 'Protocolo', value: 'Modbus TCP/IP, BACnet IP' },
        { label: 'Envolventes', value: 'NEMA 4X Stainless Steel' },
        { label: 'Precisión Modu', value: 'LOD 400 As-Built Ready' },
        { label: 'Integración', value: 'SCADA Web + Telemetría Cloud' }
      ]
    }
  ];

  return (
    <section id="especialidades" className="py-20 px-4 md:px-12 bg-[#0B0F17] relative border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1E293B] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] font-code text-xs uppercase tracking-widest mb-2">
              MEP Engineering Core
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white">
              Nuestras Especialidades <span className="text-[#FFB800]">BIM</span>
            </h2>
          </div>
          <p className="font-body text-[#bac9cc] text-sm md:text-base max-w-lg">
            Sincronización integral de las cuatro grandes ingenierías para garantizar constructibilidad sin improvisaciones en campo.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[580px]">
          
          {/* Card 1: Electricals (Large 8 Cols) */}
          <div
            onClick={() => setSelectedSpecialty(specialtiesData[0])}
            className="md:col-span-8 bg-[#161f2e] relative group overflow-hidden border border-[#1E293B] hover:border-[#FFB800] cursor-pointer transition-all duration-300 rounded-xs min-h-[280px]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-35"
              style={{ backgroundImage: `url('${specialtiesData[0].imageUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/70 to-transparent p-6 md:p-8 flex flex-col justify-end space-y-2">
              <div className="flex items-center gap-2 font-code text-xs text-[#FFB800] font-bold uppercase">
                <Zap className="w-4 h-4 text-[#FFB800]" />
                {specialtiesData[0].subtitle}
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white group-hover:text-[#FFB800] transition-colors">
                {specialtiesData[0].title}
              </h3>
              <p className="text-[#bac9cc] font-body text-sm max-w-lg line-clamp-2">
                {specialtiesData[0].description}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-code text-[#FFB800] font-bold uppercase">
                <span>Ver especificación de ruteo</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: Sanitary (4 Cols) */}
          <div
            onClick={() => setSelectedSpecialty(specialtiesData[1])}
            className="md:col-span-4 bg-[#161f2e] relative group overflow-hidden border border-[#1E293B] hover:border-[#FFB800] cursor-pointer transition-all duration-300 rounded-xs min-h-[280px]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-35"
              style={{ backgroundImage: `url('${specialtiesData[1].imageUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/70 to-transparent p-6 flex flex-col justify-end space-y-2">
              <div className="flex items-center gap-2 font-code text-xs text-[#FFB800] font-bold uppercase">
                <Droplets className="w-4 h-4 text-[#FFB800]" />
                {specialtiesData[1].subtitle}
              </div>
              <h3 className="font-display text-2xl font-extrabold text-white group-hover:text-[#FFB800] transition-colors">
                {specialtiesData[1].title}
              </h3>
              <p className="text-[#bac9cc] font-body text-xs line-clamp-2">
                {specialtiesData[1].description}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-code text-[#FFB800] font-bold uppercase">
                <span>Cálculo de pendientes</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 3: HVAC (4 Cols) */}
          <div
            onClick={() => setSelectedSpecialty(specialtiesData[2])}
            className="md:col-span-4 bg-[#161f2e] relative group overflow-hidden border border-[#1E293B] hover:border-[#FFB800] cursor-pointer transition-all duration-300 rounded-xs min-h-[280px]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-35"
              style={{ backgroundImage: `url('${specialtiesData[2].imageUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/70 to-transparent p-6 flex flex-col justify-end space-y-2">
              <div className="flex items-center gap-2 font-code text-xs text-[#ff8c00] font-bold uppercase">
                <Wind className="w-4 h-4 text-[#ff8c00]" />
                {specialtiesData[2].subtitle}
              </div>
              <h3 className="font-display text-2xl font-extrabold text-white group-hover:text-[#FFB800] transition-colors">
                {specialtiesData[2].title}
              </h3>
              <p className="text-[#bac9cc] font-body text-xs line-clamp-2">
                {specialtiesData[2].description}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-code text-[#FFB800] font-bold uppercase">
                <span>Ductería volumétrica</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 4: Automation (8 Cols) */}
          <div
            onClick={() => setSelectedSpecialty(specialtiesData[3])}
            className="md:col-span-8 bg-[#161f2e] relative group overflow-hidden border border-[#1E293B] hover:border-[#FFB800] cursor-pointer transition-all duration-300 rounded-xs min-h-[280px]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-35"
              style={{ backgroundImage: `url('${specialtiesData[3].imageUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/70 to-transparent p-6 md:p-8 flex flex-col justify-end space-y-2">
              <div className="flex items-center gap-2 font-code text-xs text-[#FFB800] font-bold uppercase">
                <Cpu className="w-4 h-4 text-[#FFB800]" />
                {specialtiesData[3].subtitle}
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white group-hover:text-[#FFB800] transition-colors">
                {specialtiesData[3].title}
              </h3>
              <p className="text-[#bac9cc] font-body text-sm max-w-lg line-clamp-2">
                {specialtiesData[3].description}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-code text-[#FFB800] font-bold uppercase">
                <span>Cuadros de control PLC</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>

        {/* Deliverables Footer Strip */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-code text-xs">
          <button
            onClick={onOpenDeliverables}
            className="flex items-center justify-between p-4 bg-[#161f2e] border border-[#1E293B] hover:border-[#FFB800] text-white transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#FFB800]" />
              <div>
                <div className="font-bold text-xs">ARCHIVOS .RVT / .IFC</div>
                <div className="text-[10px] text-[#849396]">Modelos Abiertos ISO</div>
              </div>
            </div>
          </button>

          <button
            onClick={onOpenDeliverables}
            className="flex items-center justify-between p-4 bg-[#161f2e] border border-[#1E293B] hover:border-[#FFB800] text-white transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FFB800]" />
              <div>
                <div className="font-bold text-xs">CLASH REPORT 100%</div>
                <div className="text-[10px] text-[#849396]">Auditoría Solibri</div>
              </div>
            </div>
          </button>

          <button
            onClick={onOpenDeliverables}
            className="flex items-center justify-between p-4 bg-[#161f2e] border border-[#1E293B] hover:border-[#FFB800] text-white transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-[#FFB800]" />
              <div>
                <div className="font-bold text-xs">PLANOS DE PASES</div>
                <div className="text-[10px] text-[#849396]">Aperturas Estructurales</div>
              </div>
            </div>
          </button>

          <button
            onClick={onOpenDeliverables}
            className="flex items-center justify-between p-4 bg-[#161f2e] border border-[#1E293B] hover:border-[#FFB800] text-white transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[#E63946]" />
              <div>
                <div className="font-bold text-xs">METRADOS BIM 5D</div>
                <div className="text-[10px] text-[#849396]">Cómputos Automatizados</div>
              </div>
            </div>
          </button>
        </div>

      </div>

      {/* Specialty Detail Modal */}
      {selectedSpecialty && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E293B] max-w-2xl w-full p-6 md:p-8 space-y-6 relative rounded-xs active-glow max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedSpecialty(null)}
              className="absolute top-4 right-4 p-2 bg-[#161f2e] text-[#849396] hover:text-white border border-[#1E293B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 border-b border-[#1E293B] pb-4">
              <span className="font-code text-xs text-[#FFB800] font-bold uppercase tracking-widest">
                FICHA TÉCNICA DE ESPECIALIDAD • TESLA
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white">
                {selectedSpecialty.title}
              </h3>
              <p className="font-code text-xs text-[#FFB800]">{selectedSpecialty.subtitle}</p>
            </div>

            <p className="font-body text-sm text-[#bac9cc] leading-relaxed">
              {selectedSpecialty.description}
            </p>

            <div className="space-y-3">
              <h4 className="font-code text-xs text-[#FFB800] uppercase font-bold">Protocolos & Alcances Incluidos:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-body text-xs">
                {selectedSpecialty.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-[#161f2e] p-2.5 border border-[#1E293B]">
                    <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                    <span className="text-[#dde3ea]">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#161f2e] p-4 border border-[#1E293B] space-y-2">
              <h4 className="font-code text-xs text-[#FFB800] uppercase font-bold">Parámetros de Entregable:</h4>
              <div className="grid grid-cols-2 gap-3 font-code text-xs">
                {selectedSpecialty.specs.map((sp, idx) => (
                  <div key={idx}>
                    <span className="text-[#849396] text-[10px] uppercase block">{sp.label}</span>
                    <span className="text-white font-semibold">{sp.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedSpecialty(null);
                  onOpenContact();
                }}
                className="flex-1 bg-[#E63946] hover:bg-[#d92c39] text-white font-display font-bold text-xs uppercase py-3 text-center tracking-wider shadow-[0_0_12px_rgba(230,57,70,0.4)]"
              >
                Solicitar Cotización de esta Especialidad
              </button>
              <button
                onClick={() => setSelectedSpecialty(null)}
                className="px-5 border border-slate-700 text-[#bac9cc] hover:text-white font-code text-xs"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
