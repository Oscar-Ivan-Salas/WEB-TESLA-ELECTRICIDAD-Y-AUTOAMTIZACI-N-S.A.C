import React, { useState } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { HeroSection } from './components/HeroSection';
import { BimMepViewer } from './components/BimMepViewer';
import { RoiCalculator } from './components/RoiCalculator';
import { SpecialtiesBento } from './components/SpecialtiesBento';
import { ProjectsPortfolio } from './components/ProjectsPortfolio';
import { DeliverablesInspector } from './components/DeliverablesInspector';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';
import PiliChat from './components/PiliChat';
import PILi_agente from './components/PILi_agente';

// Ruta rápida: si la URL contiene ?agent → mostrar PILi_agente Studio completo
const isAgentMode = new URLSearchParams(window.location.search).has('agent');



export default function App() {
  const [deliverablesOpen, setDeliverablesOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Modo PILI_agente Studio 360° — acceder desde: http://localhost:3002/?agent
  if (isAgentMode) return <PILi_agente />;


  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F9FAFB] flex flex-col font-body selection:bg-[#FFB800] selection:text-[#0B0F17] overflow-x-hidden">
      {/* Fixed Header */}
      <TopNavbar
        onOpenContact={() => setContactOpen(true)}
        onOpenDeliverables={() => setDeliverablesOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onOpenDeliverables={() => setDeliverablesOpen(true)}
          onOpenContact={() => setContactOpen(true)}
        />

        {/* 3D WebGL BIM MEP Viewer */}
        <BimMepViewer onOpenContact={() => setContactOpen(true)} />

        {/* ROI Optimization Calculator */}
        <RoiCalculator
          onOpenContact={() => setContactOpen(true)}
        />

        {/* Especialidades Bento Grid */}
        <SpecialtiesBento
          onOpenDeliverables={() => setDeliverablesOpen(true)}
          onOpenContact={() => setContactOpen(true)}
        />

        {/* Projects Portfolio Showcase */}
        <ProjectsPortfolio
          onOpenContact={() => setContactOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenDeliverables={() => setDeliverablesOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Deliverables Inspector Modal */}
      <DeliverablesInspector
        isOpen={deliverablesOpen}
        onClose={() => setDeliverablesOpen(false)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Engineering Contact & Quote Modal */}
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />

      {/* PILI 2.0 — IA Especialista BIM/MEP (flotante en toda la app) */}
      <PiliChat />
    </div>
  );
}
