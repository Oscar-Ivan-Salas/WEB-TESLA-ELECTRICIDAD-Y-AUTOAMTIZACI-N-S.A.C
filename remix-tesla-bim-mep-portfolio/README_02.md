# ⚡ TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.
## Módulo BIM MEP LOD 400 - Plan de Ultra-Calidad Visual e Integración Final

---

### 🏛️ 1. DIRECTIVA DE ULTRA-CALIDAD VISUAL 3D (ESTÁNDAR DE INDUSTRIA)
Queda prohibido el uso de geometrías procedimentales primarias (cubos/cilindros básicos). La experiencia 3D debe utilizar el flujo de trabajo profesional estándar de la industria web:

1. **Carga de Modelos BIM Reales (`.glb` / `.gltf`):** Uso de `@react-three/drei` (`useGLTF`, `Center`, `Float`, `Stage`) para renderizar maquetas reales de Revit/Navisworks con codos, soportes Unistrut, bandejas perforadas y conectores VFD.
2. **Iluminación HDRI y Materiales PBR:** Entornos de reflexión metálica (`Environment`), sombras suaves (`ContactShadows`) y materiales traslúcidos con rugosidad y refracción realista (`meshPhysicalMaterial`).
3. **Efectos de Post-Procesamiento:** Implementación de `@react-three/postprocessing` para dar efecto de resplandor (*Glow / Bloom*) en los puntos de *Clash Detection* y luces de estado.
4. **Uso de Herramientas CLI y Skills:** Se autoriza el uso de la terminal (`/test`, comandos `npm`, descargas de GitHub/NPM) para instalar plugins y realizar pruebas de compilación automática.

---

### 📋 2. FASE FINAL DE EJECUCIÓN (PROMPTS DE OPTIMIZACIÓN Y PRUEBAS)

#### P21: Finalización del Prompt Pendiente (P2)
* **Prompt 21 (P2 Pendiente):** Crea el módulo `src/data/bimMetrics.ts` exportando la interfaz `BuildingMetric` y el objeto `BIM_METRICS` con los factores e importes en Soles (S/.). Conecta este módulo limpiamente en `RoiCalculator.tsx` eliminando datos embebidos.

#### FASE 5: Rediseño Hiperrealista del Visor 3D LOD 400 (Prompts 22 - 25)
* **Prompt 22 (Skills & Pipeline 3D):** Ejecuta la instalación de las bibliotecas de renderizado profesional de GitHub/NPM:
  `npm install @react-three/postprocessing three-stdlib gltfpack`
* **Prompt 23 (Carga de Modelo Real .GLB / Drei Stage):** Rediseña `BimMepViewer.tsx` integrando el componente `<Stage>` y `<Environment preset="city">` de Drei. Configura un cargador con `useGLTF` apuntando a `/models/mep_lod400.glb` (con fallback de alta fidelidad mientras carga).
* **Prompt 24 (Materiales PBR Traslúcidos & Capas):** Aplica traversado de escena (`scene.traverse`) para asignar materiales PBR realistas según el nombre de la malla: vidrio acrílico traslúcido en bandejas `#FFB800` (Eléctricas), tuberías metálicas refractivas `#00A8E8` (Sanitarias) y polímeros `#E63946` (ACI).
* **Prompt 25 (Post-Processing & Clash Marker):** Añade la capa de `<EffectComposer>` con `<Bloom luminanceThreshold={0.6} intensity={1.5} />` para que el marcador de *Clash Detection* parpadee con resplandor neón hiperrealista en tiempo real.

---

### 🧪 3. BATERÍA DE 5 PRUEBAS DE ESTRÉS Y COMPILACIÓN (/test)

* **Prueba T1 (Validación de Tipos y Datos):** Ejecuta `npx tsc --noEmit` para verificar que la extracción de `bimMetrics.ts` no rompa ningún prop o estado en la calculadora.
* **Prueba T2 (Gestión de Memoria GPU):** Verifica que al ocultar o conmutar capas en el Visor 3D no existan fugas de memoria, asegurando la llamada a `dispose()` en geometrías y texturas al desmontar.
* **Prueba T3 (Responsividad y Touch Controls):** Ejecuta `/test` o simulación en vista móvil asegurando que los `OrbitControls` permitan rotación suave con gestos táctiles sin bloquear el scroll de la página.
* **Prueba T4 (Rendimiento de FPS):** Certifica que la tasa de refresco del canvas se mantenga estable sobre 50-60 FPS en resoluciones estándar.
* **Prueba T5 (Build Final de Producción):** Ejecuta `npm run build` en la terminal para confirmar que el bundle generado en la carpeta `/dist` no contenga warnings, archivos corruptos o dependencias no resueltas.