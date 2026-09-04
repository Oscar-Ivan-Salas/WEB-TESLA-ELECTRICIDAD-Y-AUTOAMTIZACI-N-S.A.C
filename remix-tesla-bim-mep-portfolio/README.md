# ⚡ TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.
## Módulo de Coordinación y Compatibilización BIM MEP (LOD 400 - ISO 19650)

---

### 📌 1. CONTEXTO Y PROPÓSITO DEL PROYECTO
**TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.** está lanzando una nueva línea de negocio dirigida a estudios de arquitectura, proyectistas y empresas constructoras de alto nivel: **Servicio de Coordinación y Compatibilización BIM MEP (Eléctricas, Sanitarias, HVAC y Automatización)**.

Este proyecto local es un módulo independiente (*sandbox*) diseñado para construir y perfeccionar la experiencia interactiva de la Landing Page, enfocado de manera crítica en la creación de un **Visor 3D Interactivo de Nivel Industrial (LOD 400)**. 

No aceptamos representaciones geométricas infantiles ni bloques tridimensionales básicos. El visor debe transmitir la precisión técnica de **Autodesk Revit / Navisworks**, mostrando conexiones, codos, bandejas portacables perforadas, tuberías de agua y ductos HVAC con materiales semitransparentes (*glassmorphism*) y marcadores de detección de interferencias en vivo (*Clash Detection*).

---

### 🎨 2. GUÍA DE IDENTIDAD VISUAL Y BRANDING
El diseño debe alinearse de forma estricta a la paleta corporativa de la empresa:
* **Fondo Principal:** `#0B0F17` (Azul Noche / Carbón Profundo)
* **Contenedores y Tarjetas:** `#111827` (Gris Azulado Oscuro) con bordes en `#1F2937`
* **Titulares y Resaltados:** `#FFB800` (Dorado Eléctrico / Ámbar Cálido)
* **Botones Primarios de Acción (CTAs):** `#E63946` (Rojo Corporativo de Ingeniería)
* **Texto de Cuerpo:** `#F9FAFB` (Blanco) y `#9CA3AF` (Gris Slate)

---

### 🏛️ 3. ESTRUCTURA DE ARCHIVOS Y ARQUITECTURA MODULAR
```text
/
├── public/
│   └── models/               # Modelos 3D (.glb, .gltf, .splinecode)
├── src/
│   ├── assets/               # Texturas y assets vectoriales
│   ├── components/
│   │   ├── bim-mep/
│   │   │   ├── BimMepHero.jsx        # Copywriting directo + CTAs
│   │   │   ├── BimMepViewer.jsx      # Visor 3D LOD 400 con filtros y Clash Detection
│   │   │   ├── BimMepCalculator.jsx  # Calculadora dinámica de ROI en Soles (S/.)
│   │   │   ├── BimMepDeliverables.jsx# Bento Grid con entregables (.RVT, .NWD, .DWG)
│   │   │   └── index.jsx             # Envoltorio principal del módulo
│   │   └── layout/
│   │       ├── Header.jsx            # Branding TESLA + Badge ISO 19650
│   │       └── Footer.jsx            # Información de contacto
│   ├── data/
│   │   └── bimMetrics.js             # Factores de costo e interferencias en Soles
│   ├── App.jsx                       # Vista principal
│   └── main.jsx                      # Punto de entrada Vite/React
├── README.md                         # Hoja de ruta y guía del sistema
└── package.json