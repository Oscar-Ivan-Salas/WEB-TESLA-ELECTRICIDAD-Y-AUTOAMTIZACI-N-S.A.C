import React, { useState } from 'react';
import { Project } from '../types';
import { Building2, Factory, Hospital, MapPin, Layers, CheckCircle2, AlertOctagon, ExternalLink, X } from 'lucide-react';

interface ProjectsPortfolioProps {
  onOpenContact: () => void;
}

export const ProjectsPortfolio: React.FC<ProjectsPortfolioProps> = ({ onOpenContact }) => {
  const [filter, setFilter] = useState<string>('Todos');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const projectsData: Project[] = [
    {
      id: 'proj-01',
      title: 'Planta de Procesamiento Industrial Alimentario',
      category: 'Industrial',
      area: '14,500 m²',
      location: 'Lurín, Lima - Perú',
      lod: 'LOD 350',
      clashesPrevented: 382,
      savingsEstimated: 'S/ 314,500',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80',
      description: 'Coordinación federada integral para planta de procesamiento limpia con normas de inocuidad alimentaria. Modelado de tuberías sanitarias de acero inoxidable 316L, bandejas porta-cables de alta densidad y ductos de extracción aire industrial.',
      specialties: ['Eléctrica', 'Sanitaria ACI', 'HVAC Industrial', 'Tableros PLC']
    },
    {
      id: 'proj-02',
      title: 'Centro Comercial & Torre Empresarial 22 Pisos',
      category: 'Comercial',
      area: '32,000 m²',
      location: 'San Isidro, Lima - Perú',
      lod: 'LOD 350',
      clashesPrevented: 840,
      savingsEstimated: 'S/ 777,000',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      description: 'Detección y resolución de interferencias en 4 niveles de sótanos de estacionamiento y 22 pisos de oficinas. Ruteo de losas postensadas con pases predeterminados para evita perfoación estructural posterior.',
      specialties: ['Eléctrica BMS', 'Drenaje Pluvial', 'Chillers HVAC', 'Extracción Garajes']
    },
    {
      id: 'proj-03',
      title: 'Complejo Hospitalario de Alta Especialidad',
      category: 'Hospitalario',
      area: '18,200 m²',
      location: 'Arequipa, Perú',
      lod: 'LOD 400',
      clashesPrevented: 620,
      savingsEstimated: 'S/ 610,500',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
      description: 'Coordinación MEP hospitalaria con altísima densidad de redes: Gases medicinales (Oxígeno, Vacío, Aire Comprimido), sistemas de climatización con filtros HEPA para quirófanos y energía ininterrumpida UPS.',
      specialties: ['Gases Medicinales', 'HVAC HEPA', 'Instalaciones Especiales', 'Tableros Aislados']
    },
    {
      id: 'proj-04',
      title: 'Centro de Datos TIER III Data Center',
      category: 'Infraestructura',
      area: '6,800 m²',
      location: 'Callao, Perú',
      lod: 'LOD 400',
      clashesPrevented: 290,
      savingsEstimated: 'S/ 362,600',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
      description: 'Coordinación BIM de redudancia N+1 de potencia y enfriamiento. Modelado ultra-preciso LOD 400 As-Built para pasillos fríos/calientes y detección temprana de incendios por aspiración VESDA.',
      specialties: ['Doble Acometida 10kV', 'Chilled Water Systems', 'Scada Telemetría', 'Sistemas VESDA']
    }
  ];

  const filteredProjects = filter === 'Todos'
    ? projectsData
    : projectsData.filter(p => p.category === filter);

  return (
    <section id="proyectos" className="py-20 px-4 md:px-12 bg-[#0B0F17] relative border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Title & Filter bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E293B] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] font-code text-xs uppercase tracking-widest mb-2">
              Portafolio Destacado ISO 19650
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white">
              Proyectos <span className="text-[#FFB800]">Coordinados</span>
            </h2>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-2 font-code text-xs">
            {['Todos', 'Industrial', 'Comercial', 'Hospitalario', 'Infraestructura'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 border transition-all uppercase ${
                  filter === cat
                    ? 'bg-[#FFB800] text-[#0B0F17] border-[#FFB800] font-bold shadow-[0_0_10px_rgba(255,184,0,0.3)]'
                    : 'bg-[#161f2e] text-[#bac9cc] border-[#1E293B] hover:border-[#849396]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="glass-panel border border-[#1F2937] hover:border-[#FFB800] transition-all group overflow-hidden rounded-xs flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-black/40 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="bg-[#0B0F17]/80 backdrop-blur-md text-[#FFB800] text-[10px] font-code font-bold px-2.5 py-1 border border-[#FFB800]/30 uppercase">
                      {project.category}
                    </span>
                    <span className="bg-[#FFB800] text-[#0B0F17] text-[10px] font-code font-bold px-2 py-0.5">
                      {project.lod}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-code text-white">
                    <MapPin className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>{project.location}</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#F9FAFB] group-hover:text-[#FFB800] transition-colors">
                    {project.title}
                  </h3>
                  <p className="font-body text-xs text-[#9CA3AF] mt-2 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#0B0F17] p-3 border border-[#1F2937] font-code text-xs my-2">
                  <div>
                    <span className="text-[#9CA3AF] text-[10px] uppercase block">ÁREA CONSTRUIDA</span>
                    <span className="font-bold text-white">{project.area}</span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] text-[10px] uppercase block">CRUCES PREVENIDOS</span>
                    <span className="font-bold text-[#FFB800]">{project.clashesPrevented} interferencias</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#1F2937]">
                  <div className="flex flex-wrap gap-1.5">
                    {project.specialties.map((spec, i) => (
                      <span key={i} className="text-[10px] font-code bg-[#111827] text-[#FFB800] px-2 py-0.5 border border-[#1F2937]">
                        {spec}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveProject(project)}
                    className="w-full bg-[#111827] hover:bg-[#FFB800] hover:text-[#0B0F17] text-[#FFB800] border border-[#FFB800] font-display font-bold text-xs uppercase tracking-wider py-2.5 transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Ver Ficha Completa del Proyecto</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E293B] max-w-3xl w-full p-6 md:p-8 space-y-6 relative rounded-xs active-glow max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setActiveProject(null)}
              className="absolute top-4 right-4 p-2 bg-[#161f2e] text-[#849396] hover:text-white border border-[#1E293B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 border-b border-[#1E293B] pb-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFB800]/20 text-[#FFB800] font-code text-[10px] font-bold px-2 py-0.5">
                  {activeProject.category}
                </span>
                <span className="font-code text-xs text-[#849396]">{activeProject.location}</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white">
                {activeProject.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-code text-xs">
              <div className="bg-[#0B0F17] p-3 border border-[#1E293B]">
                <span className="text-[#849396] text-[10px] uppercase block">ÁREA TOTAL</span>
                <span className="font-bold text-white text-base">{activeProject.area}</span>
              </div>
              <div className="bg-[#0B0F17] p-3 border border-[#1E293B]">
                <span className="text-[#849396] text-[10px] uppercase block">CRUCES RESUELTOS</span>
                <span className="font-bold text-[#FFB800] text-base">{activeProject.clashesPrevented}</span>
              </div>
              <div className="bg-[#0B0F17] p-3 border border-[#1E293B]">
                <span className="text-[#849396] text-[10px] uppercase block">AHORRO EN OBRA</span>
                <span className="font-bold text-[#E63946] text-base">{activeProject.savingsEstimated}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-code text-xs text-[#FFB800] uppercase font-bold">Resumen de Coordinación BIM MEP:</h4>
              <p className="font-body text-sm text-[#bac9cc] leading-relaxed">
                {activeProject.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-code text-xs text-[#FFB800] uppercase font-bold">Especialidades Coordinadas bajo ISO 19650:</h4>
              <div className="flex flex-wrap gap-2">
                {activeProject.specialties.map((s, i) => (
                  <span key={i} className="bg-[#161f2e] text-white border border-[#1E293B] px-3 py-1 font-code text-xs">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#1E293B]">
              <button
                onClick={() => {
                  setActiveProject(null);
                  onOpenContact();
                }}
                className="flex-1 bg-[#E63946] hover:bg-[#d92c39] text-white font-display font-bold text-xs uppercase py-3 text-center tracking-wider shadow-[0_0_12px_rgba(230,57,70,0.4)]"
              >
                Solicitar Cotización de Proyecto Similar
              </button>
              <button
                onClick={() => setActiveProject(null)}
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
