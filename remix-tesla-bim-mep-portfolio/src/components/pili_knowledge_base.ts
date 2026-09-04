// ─────────────────────────────────────────────────────────────────────────────
// pili_knowledge_base.ts
// Base de conocimiento RAG para PILI_agente 360°
// Chunks de texto sobre: normas peruanas, BIM, Revit MEP, AutoCAD, costos MEP
// Cada chunk tiene: id, categoría, tags (palabras clave), contenido técnico
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeChunk {
  id: string;
  category: 'normas_peruanas' | 'bim_standards' | 'revit_mep' | 'autocad' | 'costos_mep' | 'hvac' | 'electricidad' | 'sanitario' | 'aci' | 'gestion' | 'marketplace' | 'perfiles_usuario';
  tags: string[];
  title: string;
  content: string;
}

export const PILI_KNOWLEDGE_BASE: KnowledgeChunk[] = [

  // ───────────────────────────────────────────────────
  // NORMAS TÉCNICAS PERUANAS
  // ───────────────────────────────────────────────────
  {
    id: 'norm-em010',
    category: 'normas_peruanas',
    tags: ['EM.010', 'instalaciones eléctricas', 'tablero', 'alimentador', 'acometida', 'norma', 'reglamento', 'RNE'],
    title: 'EM.010 — Instalaciones Eléctricas Interiores (RNE)',
    content: `La norma EM.010 del Reglamento Nacional de Edificaciones (RNE) del Perú regula el diseño y ejecución de instalaciones eléctricas interiores.
PUNTOS CLAVE:
- Todo tablero eléctrico principal debe tener interruptor general de mínimo 2x(In) de capacidad.
- Los alimentadores deben dimensionarse para 125% de la carga total instalada (NEC 210.19).
- Caída de tensión máxima: 2.5% en alimentadores y 3% en circuitos derivados.
- Las bandejas portacables deben ser de acero galvanizado o aluminio, con capacidad mínima al 50%.
- Toda instalación en zona húmeda o exterior requiere conduit EMT galvanizado o PVC-P de alta resistencia.
- Puesta a tierra obligatoria: resistencia ≤ 25 Ω (vivienda) y ≤ 5 Ω (industria/hospitales).
- Separación mínima entre canalización eléctrica y sanitaria: 30 cm (horizontal) y 20 cm (cruce).
- Luminarias de emergencia: autonomía mínima de 90 minutos, nivel 10 lux en corredores.
APLICACIÓN BIM: En Revit MEP, los tableros eléctricos se modelan como familias de panel board con parámetros de voltaje, fases y capacidad en amperios (Amps).`
  },

  {
    id: 'norm-em020',
    category: 'normas_peruanas',
    tags: ['EM.020', 'instalaciones sanitarias', 'agua', 'desagüe', 'norma', 'RNE', 'dotación', 'cisterna'],
    title: 'EM.020 — Instalaciones Sanitarias (RNE)',
    content: `La norma EM.020 regula las instalaciones de agua fría, agua caliente, desagüe y ventilación en edificaciones peruanas.
DOTACIONES DE AGUA:
- Vivienda: 200 L/hab/día (IS.010 Tabla 1).
- Oficinas: 6 L/m²/día.
- Hospitales: 600–800 L/cama/día.
- Restaurante: 40 L/asiento/día.
DISEÑO DE CISTERNAS:
- Capacidad mínima = 3/4 del consumo diario.
- Cuarto de bombas: espacio mínimo 1.5 m libre alrededor del equipo.
- Altura mínima cisterna: 1.50 m para acceso de mantenimiento.
DESAGÜE Y VENTILACIÓN:
- Pendiente mínima de tuberías horizontales: 1% (DN ≤ 75mm) y 0.5% (DN > 75mm).
- Sifones: profundidad mínima de cierre hidráulico 5 cm.
- Columnas de ventilación: DN mínimo 50 mm, prolongadas 30 cm sobre la cubierta.
APLICACIÓN BIM: En Revit MEP, los sistemas sanitarios se modelan con familias de tuberías en sistema "Domestic Water" y "Sanitary" con pendiente parametrizada.`
  },

  {
    id: 'norm-em030',
    category: 'normas_peruanas',
    tags: ['EM.030', 'HVAC', 'ventilación', 'aire acondicionado', 'norma', 'RNE', 'climatización'],
    title: 'EM.030 — Instalaciones de Ventilación y Climatización (RNE)',
    content: `La norma EM.030 regula los sistemas de ventilación mecánica, aire acondicionado y climatización en edificaciones del Perú.
RENOVACIONES DE AIRE MÍNIMAS:
- Oficinas: 10 L/s por persona.
- Salas de reunión: 15 L/s por persona.
- Hospitales UCI: 15 renovaciones/hora con filtro HEPA H13.
- Estacionamientos: 7.5 L/s·m².
TEMPERATURA DE DISEÑO PERÚ:
- Huancayo (Sierra, 3270 msnm): Temp. exterior diseño 15°C, HR 70%.
- Lima (Costa): Temp. 28°C (verano), HR 80%.
DUCTERÍAS:
- Conductos de chapa galvanizada: espesor mínimo calibre 26 (0.55 mm) para DN ≤ 300 mm.
- Velocidad máxima de aire: 500 FPM en zonas habitadas, 1500 FPM en shaft técnico.
- Aislamiento térmico: espuma elastomérica 19 mm (min.) en ductos de impulsión.
APLICACIÓN BIM: En Revit, ductos HVAC se modelan en sistema "Supply Air" y "Return Air". El clash detection con estructuras es crítico en losas planas de concreto.`
  },

  {
    id: 'norm-ntp370',
    category: 'normas_peruanas',
    tags: ['NTP 370', 'tablero', 'interruptor', 'cortocircuito', 'norma técnica peruana', 'eléctrico'],
    title: 'NTP-IEC 60898 / NTP 370 — Interruptores Termomagnéticos y Tableros',
    content: `La NTP 370 y la NTP-IEC 60898 establecen requisitos para interruptores termomagnéticos y tableros eléctricos en instalaciones peruanas.
PUNTOS CLAVE:
- Interruptores residenciales: capacidad de ruptura mínima 6 kA (Icc).
- Interruptores industriales/comerciales: capacidad de ruptura mínima 10 kA.
- Tableros de distribución: índice de protección mínimo IP41 en interiores, IP65 en exteriores.
- Los tableros deben tener barras de neutro y tierra independientes y aisladas entre sí.
- Todo circuito debe tener protección diferencial (ELCB) de 30 mA en zonas húmedas.
- El calibre mínimo de conductor para circuitos de iluminación: 2.5 mm² (AWG 14 TW).
- El calibre mínimo para tomacorrientes: 4 mm² (AWG 12 TW).
COORDINACIÓN BIM: En Revit MEP, los tableros se asocian con paneles de distribución con parámetros de Icc calculado por Revit Electrical Analysis.`
  },

  {
    id: 'norm-is010',
    category: 'normas_peruanas',
    tags: ['IS.010', 'dotación', 'agua', 'sanitario', 'norma', 'RNE', 'aforo'],
    title: 'IS.010 — Instalaciones Sanitarias para Edificaciones (RNE)',
    content: `IS.010 del RNE define dotaciones de agua, dimensionamiento de cisternas y requisitos de instalaciones sanitarias para todo tipo de edificación en Perú.
TABLAS DE DOTACIÓN IMPORTANTES:
- Vivienda unifamiliar/multifamiliar: 200 L/persona/día.
- Tiendas y locales comerciales: 6 L/m²/día (área de ventas).
- Hoteles de 3 estrellas: 500 L/habitación/día.
- Clínicas y hospitales: 600 L/cama/día; consultorios externos: 500 L/consultorio/día.
- Colegios (solo alumno): 20 L/alumno/día.
- Estadios: 2 L/espectador/día.
DIMENSIONAMIENTO DE EQUIPOS:
- Bomba de agua: Q = dotación diaria / 4 horas (bombeo en horas de menor consumo).
- Presión mínima en punto más desfavorable: 1 kgf/cm² (residencial).
APLICACIÓN BIM: El cálculo hidráulico de caudales, diámetros y presiones puede realizarse mediante extensiones de Revit MEP como "Autodesign MEP" o exportando el modelo a CYPECAD MEP.`
  },

  {
    id: 'norm-itse',
    category: 'normas_peruanas',
    tags: ['ITSE', 'Defensa Civil', 'inspección', 'seguridad', 'certificación', 'extintor', 'señalización', 'evacuación'],
    title: 'Certificación ITSE — Inspección Técnica de Seguridad en Edificaciones',
    content: `La ITSE (Inspección Técnica de Seguridad en Edificaciones) es el proceso de certificación obligatorio en Perú a cargo del INDECI y las municipalidades para habilitar el funcionamiento de un local.
REQUISITOS PRINCIPALES ITSE:
- Planos de arquitectura y estructuras aprobados por municipalidad.
- Planos MEP (eléctrico, sanitario, HVAC) con firma de ingeniero colegiado (CIP).
- Sistema de detección y alarma de incendios (NFPA 72) para áreas > 150 m².
- Sistema de extinción: extintores cada 23 m de recorrido máximo. Rociadores automáticos (NFPA 13) en áreas > 500 m².
- Señalización de evacuación con luz de emergencia (NTP 399.010).
- Rutas de evacuación: distancia máxima al exterior 45 m (sin rociadores) / 60 m (con rociadores).
- Certificado de operatividad de grupos electrógenos y tableros de transferencia.
- Póliza de seguro CAR para proyectos en construcción.
PROCESO: Declaratoria de Edificación Conforme → Visita Inspección → Emisión Certificado ITSE (vigencia 2 años edificaciones multiusos).`
  },

  // ───────────────────────────────────────────────────
  // ESTÁNDARES BIM
  // ───────────────────────────────────────────────────
  {
    id: 'bim-lod',
    category: 'bim_standards',
    tags: ['LOD', 'nivel de detalle', 'BIM', 'LOD 100', 'LOD 200', 'LOD 300', 'LOD 400', 'LOD 500', 'modelado'],
    title: 'Niveles de Detalle BIM (LOD 100 a LOD 500)',
    content: `Los niveles LOD (Level of Development) definen el grado de información y geometría de los elementos en un modelo BIM según la fase del proyecto.
LOD 100 — Conceptual:
- Representación volumétrica básica (masa). Área, altura, volumen aproximado.
- Uso: Estudio de prefactibilidad. Estimación de costo orden de magnitud.
LOD 200 — Esquemático:
- Geometría genérica con tamaño aproximado, forma y ubicación relativa.
- Uso: Diseño esquemático, coordinación preliminar.
LOD 300 — Diseño de Detalle:
- Geometría específica, dimensiones, materiales definidos. Coordenadas exactas.
- Uso: Construcción. Clash detection. Metrados de obra. Planos de ingeniería de detalle.
LOD 400 — Fabricación:
- Información de fabricación: tolerancias, conexiones, accesorios, número de parte.
- Uso: Fabricación en taller, instalación en campo.
LOD 500 — As-Built:
- Modelo verificado en campo. Refleja exactamente lo instalado.
- Uso: Operación y mantenimiento. Entrega al cliente final.
NOTA TESLA: Para coordinación MEP, TESLA trabaja en LOD 300 para detección de interferencias y LOD 400 para proyectos de ingeniería de detalle con subcontratistas.`
  },

  {
    id: 'bim-clash',
    category: 'bim_standards',
    tags: ['clash detection', 'interferencias', 'Navisworks', 'coordinación BIM', 'clash', 'conflicto'],
    title: 'Clash Detection — Detección de Interferencias en BIM',
    content: `El Clash Detection es el proceso de identificar y resolver interferencias físicas entre sistemas constructivos antes de la ejecución en campo.
TIPOS DE CLASH:
- Hard Clash: Interferencia física real entre dos elementos (ej. ducto HVAC vs. viga estructural).
- Soft Clash: Elementos dentro del espacio de tolerancia requerido (ej. tubería a menos de 30 cm de cable de alta tensión).
- Workflow Clash: Conflicto de secuencia constructiva o espacio de mantenimiento insuficiente.
PROCESO TESLA DE CLASH DETECTION:
1. Exportar modelos Revit a formato NWC/NWD (Navisworks).
2. Agregar federación: Arquitectura + Estructura + MEP (Eléctrico + Sanitario + HVAC + ACI).
3. Ejecutar Clash Detective con reglas por disciplina.
4. Clasificar clashes: Nuevo > Activo > Revisado > Aprobado.
5. Emitir BIM Coordination Report con ubicación, descripción y responsable de resolución.
MÉTRICAS REALES TESLA: En proyectos hospitalarios de 5,000 m², el clash detection BIM reduce en un 78% los cambios en campo y hasta 35% del tiempo de coordinación vs. métodos 2D. TESLA ha resuelto +14,280 clashes en proyectos coordinados.`
  },

  {
    id: 'bim-iso19650',
    category: 'bim_standards',
    tags: ['ISO 19650', 'BIM', 'estándar internacional', 'CDE', 'entorno datos', 'BEP', 'información'],
    title: 'ISO 19650 — Estándar Internacional BIM',
    content: `La norma ISO 19650 define el marco de trabajo para la gestión de información en proyectos de construcción mediante BIM.
COMPONENTES CLAVE (aplicables en Perú):
- CDE (Common Data Environment): Entorno único de datos compartidos donde todos los modelos son publicados y revisados. Herramientas: Autodesk Docs, ACC, BIM 360, ProjectWise.
- BEP (BIM Execution Plan): Documento que establece software, LOD, nomenclatura, flujos de entrega y responsabilidades BIM.
- Nomenclatura de archivos: Proyecto-Disciplina-Tipo-Fase-Revisión (ej. TSL-MEP-RVT-CD-R03.rvt).
- Responsabilidades: BIM Manager (coordinador general), BIM Author (modelador por disciplina), BIM Coordinator (control de calidad del modelo).
APLICACIÓN EN TESLA: En proyectos con clientes corporativos (constructoras, MINEM, hospitales), TESLA entrega el BEP completo con matriz de responsabilidades y cronograma de entrega de modelos.`
  },

  // ───────────────────────────────────────────────────
  // REVIT MEP
  // ───────────────────────────────────────────────────
  {
    id: 'revit-workflow',
    category: 'revit_mep',
    tags: ['Revit', 'MEP', 'Autodesk', 'modelado', 'familia', 'workflow', 'coordinación', 'linking'],
    title: 'Flujo de Trabajo Revit MEP — Coordinación de Disciplinas',
    content: `Revit MEP es la herramienta principal de modelado BIM para instalaciones mecánicas, eléctricas y sanitarias.
FLUJO DE TRABAJO ESTÁNDAR TESLA:
1. Configuración: Crear plantilla Revit MEP con unidades métricas, niveles y cuadrículas vinculadas.
2. Vinculación (Link): Vincular modelo Revit de Arquitectura y Estructura como referencia (no editable).
3. Modelado por disciplina:
   - Eléctrico: Tableros, bandejas, tuberías conduit, artefactos de iluminación.
   - Sanitario: Tuberías agua fría/caliente, desagüe, ventilación, aparatos sanitarios.
   - HVAC: Ductos, difusores, equipos fan coil, chiller, AHU.
   - ACI: Redes de rociadores, montantes, siamesas, detectores.
4. Coordinación: Interferencia visual entre disciplinas dentro de Revit.
5. Clash Detection en Navisworks (exportar NWC desde Revit).
6. Generación de planos: Plantas por nivel, cortes de shaft, detalles de tablero, esquemas isométricos.
7. Tablas de planificación: Schedule de equipos, ductos, tuberías para metrados.
HERRAMIENTAS COMPLEMENTARIAS: AutoCAD Plant 3D (ISO de tuberías), CYPECAD MEP (cálculo hidráulico y eléctrico), Navisworks Manage (coordinación y simulación 4D).`
  },

  {
    id: 'revit-families',
    category: 'revit_mep',
    tags: ['Revit', 'familia', 'family', 'MEP', 'conector', 'parametrización', 'shared parameters'],
    title: 'Familias Revit MEP — Creación y Gestión',
    content: `Las familias en Revit MEP representan los componentes específicos del sistema de instalaciones.
TIPOS DE FAMILIAS MEP:
- Familias de sistema (System Families): Tuberías, ductos, bandejas portacables, conduits. Se crean directamente en el modelo.
- Familias cargables (Loadable Families): Tableros, equipos de aire, aparatos sanitarios, luminarias. Se cargan desde .rfa.
- Familias in situ (In-Place): Solo para elementos únicos no repetibles.
PARÁMETROS COMPARTIDOS TESLA:
- Para tableros: Código de tablero, voltaje, fases, Icc disponible, capacity (A).
- Para equipos HVAC: Marca, modelo, toneladas de refrigeración (TR), caudal (CFM/L/s), consumo eléctrico (kW).
- Para tuberías: Material, presión de diseño, fluido, temperatura.
BUENAS PRÁCTICAS:
- Usar conectores MEP correctamente definidos (tipo, tamaño, sistema) para que Revit calcule los sistemas automáticamente.
- Parametrizar tamaños en familias para evitar duplicación.
- Nomeclatura: MFR-CODIGO_FAMILIA-VARIANTE (ej: TSL-FAN_COIL-4TR).`
  },

  // ───────────────────────────────────────────────────
  // AUTOCAD
  // ───────────────────────────────────────────────────
  {
    id: 'autocad-standards',
    category: 'autocad',
    tags: ['AutoCAD', 'capas', 'layers', 'estándar', 'plano', 'nomenclatura', 'bloques', 'MEP'],
    title: 'Estándares AutoCAD para Planos MEP',
    content: `En proyectos MEP, AutoCAD se usa para presentación de planos finales y coordinación básica 2D cuando no se dispone de BIM.
ESTRUCTURA DE CAPAS (Layers) MEP:
Eléctricas:
- E-ALIM: Alimentadores (línea continua, color rojo, 0.50 mm)
- E-CIRC: Circuitos derivados (línea continua, color amarillo, 0.25 mm)
- E-TABLE: Tableros eléctricos (color rojo, 0.70 mm)
- E-ALUM: Artefactos de iluminación (color cyan, 0.25 mm)
- E-TOMA: Tomacorrientes (color magenta, 0.25 mm)
Sanitarias:
- S-AFA: Agua fría (línea continua, color azul, 0.35 mm)
- S-ACA: Agua caliente (línea discontinua, color naranja, 0.35 mm)
- S-DES: Desagüe (línea punto-raya, color verde, 0.35 mm)
- S-VEN: Ventilación sanitaria (color verde claro, 0.25 mm)
HVAC:
- M-IMP: Ductos de impulsión (color azul claro, 0.50 mm)
- M-RET: Ductos de retorno (color verde claro, 0.50 mm)
ESCALAS ESTÁNDAR EN PERÚ:
- Plantas de instalaciones: 1:75 o 1:100.
- Detalles de tablero y equipos: 1:20 o 1:25.
- Esquemas isométricos sanitarios: sin escala.`
  },

  // ───────────────────────────────────────────────────
  // COSTOS MEP (para cotización)
  // ───────────────────────────────────────────────────
  {
    id: 'costs-residential',
    category: 'costos_mep',
    tags: ['costo', 'precio', 'presupuesto', 'vivienda', 'residencial', 'cotización', 'tarifa', 'm²'],
    title: 'Rangos de Costo MEP — Proyectos Residenciales (Perú 2025)',
    content: `Rangos orientativos de honorarios de ingeniería MEP para proyectos residenciales en Perú (precios en soles y dólares, sin IGV):
VIVIENDA UNIFAMILIAR (< 500 m²):
- Diseño eléctrico completo: S/ 2.50–4.00/m² (USD 0.70–1.10/m²).
- Diseño sanitario completo: S/ 2.00–3.50/m².
- Diseño HVAC básico (minisplit): S/ 1.50–2.50/m².
- Paquete MEP completo: S/ 6.00–10.00/m².
EDIFICIO MULTIFAMILIAR (500–3,000 m²):
- Paquete MEP completo (diseño + coordinación): S/ 8.00–14.00/m².
- Con modelado BIM LOD 300: S/ 12.00–18.00/m².
- Con Clash Detection (Navisworks): adicional S/ 2.00–4.00/m².
NOTA: Los honorarios incluyen cálculo de demanda eléctrica, memoria descriptiva, especificaciones técnicas, planos de planta y detalle. Trámites municipales y gestión IRSE tienen costo adicional.`
  },

  {
    id: 'costs-commercial',
    category: 'costos_mep',
    tags: ['costo', 'precio', 'presupuesto', 'comercial', 'oficinas', 'edificio', 'cotización', 'm²'],
    title: 'Rangos de Costo MEP — Proyectos Comerciales y Oficinas (Perú 2025)',
    content: `Rangos orientativos de honorarios para proyectos comerciales y de oficinas en Perú (sin IGV):
EDIFICIO COMERCIAL / CENTRO COMERCIAL (3,000–10,000 m²):
- Diseño MEP + coordinación BIM LOD 300: S/ 15.00–22.00/m².
- Incluye: eléctrico, sanitario, HVAC, red de detección de incendios, sistema ACI básico.
- Clash Detection y BIM Coordination Report: S/ 3.00–5.00/m².
LOCAL COMERCIAL (150–500 m²):
- MEP completo sin BIM: S/ 10.00–16.00/m².
- Expediente ITSE completo: S/ 800–2,500 fijo por local.
CENTRO DE DATOS / DATA CENTER:
- Diseño MEP especializado: USD 1.80–3.50/m² (sistemas críticos redundantes).
REFERENCIA TESLA: Para proyectos en Sierra peruana (Huancayo, Ayacucho, Puno), aplicar factor de altura (> 3,000 msnm) +15% en sistemas HVAC por corrección de densidad de aire. Los precios sirven de referencia inicial; el presupuesto exacto requiere estudio de planos.`
  },

  {
    id: 'costs-industrial',
    category: 'costos_mep',
    tags: ['costo', 'precio', 'presupuesto', 'industrial', 'planta', 'fábrica', 'cotización', 'm²'],
    title: 'Rangos de Costo MEP — Proyectos Industriales y Hospitales (Perú 2025)',
    content: `Rangos de honorarios para proyectos industriales, hospitalarios y de gran escala en Perú (sin IGV):
PLANTA INDUSTRIAL / ALMACÉN (> 2,000 m²):
- MEP completo sin BIM: S/ 10.00–16.00/m².
- MEP + Coordinación BIM LOD 300: S/ 16.00–24.00/m².
- Sistemas especiales (alta potencia, corriente continua, UPS): costo adicional por estudio.
HOSPITAL / CLÍNICA (> 1,000 m²):
- Diseño MEP hospitalario (norma FCI, RNE): S/ 20.00–35.00/m².
- Modelo BIM LOD 300 coordinado + As-Built LOD 500: S/ 28.00–45.00/m².
- Certificación ITSE hospitalaria completa: USD 2,000–8,000 según complejidad.
PROYECTO BIM SOLO (sin diseño, solo modelado):
- Modelado LOD 200 desde planos 2D: S/ 3.00–6.00/m².
- Modelado LOD 300 con coordinación: S/ 7.00–12.00/m².
- Clash Detection + Informe de coordinación: S/ 1,500–5,000 fijo según número de disciplinas.
TIEMPOS ESTIMADOS DE ENTREGA TESLA:
- Expediente MEP simple (< 500 m²): 3–5 días hábiles.
- Proyecto MEP completo (500–3,000 m²): 10–15 días hábiles.
- Proyecto BIM + Clash Detection (> 3,000 m²): 20–35 días hábiles.`
  },

  // ───────────────────────────────────────────────────
  // SISTEMAS ACI — CONTRA INCENDIOS
  // ───────────────────────────────────────────────────
  {
    id: 'aci-sistemas',
    category: 'aci',
    tags: ['ACI', 'contra incendios', 'rociadores', 'NFPA', 'extinción', 'detección', 'alarma', 'gabinete'],
    title: 'Sistemas ACI — Contra Incendios (NFPA + RNE Perú)',
    content: `Los sistemas de protección contra incendios (ACI) en Perú se diseñan bajo NFPA y el RNE (norma A.130).
SISTEMAS NFPA APLICABLES EN PERÚ:
- NFPA 13: Sistemas de rociadores automáticos (sprinklers). Obligatorio en edificios > 3 pisos o áreas > 500 m².
- NFPA 14: Sistemas de gabinetes y montantes (standpipe systems).
- NFPA 72: Sistemas de detección y alarma de incendios.
- NFPA 10: Extintores portátiles.
CRITERIOS DE DISEÑO:
- Riesgo Ligero (oficinas, hoteles): densidad de descarga 4.1 L/min/m², área de operación 139 m².
- Riesgo Ordinario I (talleres, tiendas): densidad 6.1 L/min/m², área 139 m².
- Riesgo Ordinario II (almacenes): densidad 8.2 L/min/m², área 139 m².
ELEMENTOS DEL SISTEMA:
- Siamesa de inyección: accesible desde fachada para bomba de carro de Bomberos.
- Cuarto de bombas ACI: bomba principal eléctrica + jockey pump + bomba diesel de respaldo.
- Reserva de agua ACI: mínimo 45 minutos de operación (30 minutos para riesgo ligero).
APLICACIÓN BIM: En Revit MEP, el sistema ACI se modela en sistema "Fire Protection Wet" con familias de rociadores y sus áreas de cobertura visualizadas en análisis de Revit.`
  },

  // ───────────────────────────────────────────────────
  // GESTIÓN Y COMPARATIVAS
  // ───────────────────────────────────────────────────
  {
    id: 'bim-vs-2d',
    category: 'gestion',
    tags: ['BIM', 'vs', 'CAD', '2D', 'ventajas', 'ROI', 'ahorro', 'coordinación', 'comparativa'],
    title: 'BIM vs. CAD 2D — Ventajas y ROI para Proyectos MEP',
    content: `La coordinación BIM MEP frente al método tradicional CAD 2D ofrece ventajas cuantificables:
AHORRO EN CAMPO (datos de proyectos TESLA Huancayo):
- Reducción de interferencias en campo: 72–85%.
- Reducción de órdenes de cambio: 55–70%.
- Reducción de tiempo de coordinación: 30–40%.
- Ahorro total en costo de construcción: 5–15% del costo MEP instalado.
VENTAJAS CLAVE BIM:
1. Detección temprana de interferencias (antes de excavar o instalar).
2. Metrados automáticos precisos desde el modelo (Schedule Revit).
3. Visualización 3D para aprobación de cliente y contratistas.
4. Entrega de As-Built digital para mantenimiento.
5. Simulación 4D (cronograma de instalación por fases).
CUÁNDO BIM ES IMPRESCINDIBLE:
- Proyectos > 3,000 m² con múltiples disciplinas MEP.
- Hospitales, centros de datos, edificios de uso mixto.
- Proyectos con múltiples subcontratistas (eléctrico, sanitario, HVAC, ACI separados).
- Proyectos con normativa LEED o certificación ambiental.
CUÁNDO CAD 2D PUEDE BASTAR:
- Viviendas unifamiliares < 300 m² sin sistemas complejos.
- Locales comerciales sin HVAC centralizado.`
  },
  // ───────────────────────────────────────────────────
  // PERFILES DE USUARIO — IDENTIFICACIÓN AUTOMÁTICA
  // ───────────────────────────────────────────────────
  {
    id: 'perfil-cliente-b2c',
    category: 'perfiles_usuario',
    tags: ['cliente', 'propietario', 'vivienda', 'terreno', 'construir', 'casa', 'departamento', 'quiero construir', 'dueño', 'familia', 'residencia', 'B2C'],
    title: 'Perfil 1 — Cliente / Propietario (B2C)',
    content: `El Cliente o Propietario es el usuario más frecuente del Ecosistema TESLA ConTech. Es una persona natural que desea construir o ampliar su inmueble y busca orientación técnica inicial.
CÓMO IDENTIFICARLO:
- Menciona "quiero construir", "tengo un terreno", "cuánto cuesta", "cuántos pisos puedo hacer", "necesito planos".
- Puede no saber la diferencia entre un electricista, un proyectista y un ingeniero MEP.
- Suele tener presupuesto ajustado y necesita que se lo expliquen en términos simples.
FLUJO DE ATENCIÓN:
1. Preguntar: área del terreno (m²), frente(s), número de pisos deseados, uso (vivienda/comercio), distrito/ciudad.
2. Diagnosticar: verificar viabilidad según RNE A.010 (retiros, área libre, altura máxima).
3. Mostrar anteproyecto del Smart Catalog si corresponde.
4. Emitir Cotización Referencial en Soles (S/.) y USD.
5. Ofrecer el Anteproyecto HD + Ficha RNE por $5–$10 USD vía Yape/Plin/Tarjeta.
6. Registrar el lead (nombre, WhatsApp, proyecto) para que el equipo de ingeniería lo contacte.
TONO: Cálido, empático, didáctico, sin jerga técnica innecesaria.`
  },

  {
    id: 'perfil-arquitecto-ingeniero',
    category: 'perfiles_usuario',
    tags: ['arquitecto', 'ingeniero civil', 'proyectista', 'BIM', 'modelado', 'Revit', 'expediente técnico', 'diseño', 'dibujante', 'freelance', 'subcontrato', 'B2B'],
    title: 'Perfil 2 — Arquitecto / Ingeniero (B2B)',
    content: `El Arquitecto o Ingeniero es un profesional que necesita apoyo técnico especializado en MEP BIM, o desea integrar la red de freelancers de TESLA.
CÓMO IDENTIFICARLO:
- Menciona "necesito un proyectista MEP", "me falta la coordinación BIM", "tengo el proyecto de arquitectura", "busco dibujante Revit".
- Usa términos técnicos como LOD, clash detection, expediente técnico, CIP, Navisworks.
- Puede estar buscando subcontratar el modelado Revit MEP para un proyecto que ya ganó.
FLUJO DE ATENCIÓN:
1. Si NECESITA servicios MEP: solicitar planos de arquitectura (PDF/DWG), área total, plazo, ciudad. Emitir cotización de ingeniería MEP.
2. Si DESEA POSTULAR a la red: solicitar especialidad (Eléctrico/Sanitario/HVAC/ACI), software dominado (Revit/AutoCAD), LOD máximo trabajado, portafolio (Drive/PDF) y WhatsApp.
3. Registrar al profesional en el Marketplace BIM TESLA para asignarle briefs Revit según disponibilidad geográfica y especialidad.
TONO: Técnico, directo, entre pares. Usar normativa y estándares (ISO 19650, LOD, NFPA) naturalmente.`
  },

  {
    id: 'perfil-contratista-maestro',
    category: 'perfiles_usuario',
    tags: ['contratista', 'maestro de obra', 'constructor', 'subcontratista', 'licitación', 'metrados', 'propuesta económica', 'obra', 'hitos'],
    title: 'Perfil 3 — Contratista / Maestro de Obra',
    content: `El Contratista o Maestro de Obra es quien ejecuta físicamente las instalaciones MEP en campo. Busca proyectos con metrados exactos disponibles para presentar propuestas económicas.
CÓMO IDENTIFICARLO:
- Menciona "busco proyectos", "quiero licitar", "necesito trabajo", "tengo cuadrilla", "instalo tableros", "monto tuberías".
- Puede o no conocer BIM; lo que le importa son los metrados, el cronograma y las condiciones de pago.
FLUJO DE ATENCIÓN:
1. Presentarle la lista de obras activas en su zona (filtradas por ciudad o región).
2. Por cada licitación: mostrar tipo de proyecto, sistema MEP requerido, área total, plazo de ejecución y modalidad de pago por hitos (Escrow TESLA).
3. Explicar el proceso TESLA de Pago por Hitos (Escrow): el cliente deposita y TESLA libera los pagos al contratista según avance verificado.
4. Registrar sus datos (nombre, especialidad, zona de cobertura, WhatsApp) para futuras asignaciones.
TONO: Práctico, concreto, con cifras. Sin tecnicismos de modelado BIM.`
  },

  {
    id: 'perfil-proveedor-ferreteria',
    category: 'perfiles_usuario',
    tags: ['proveedor', 'ferretería', 'materiales', 'suministro', 'vender', 'cable', 'tubo', 'tablero', 'insumos', 'despacho', 'stock', 'almacén'],
    title: 'Perfil 4 — Proveedor / Ferretería (B2B Geo)',
    content: `El Proveedor o Ferretería es un negocio que desea recibir alertas de compra de materiales de obras cercanas a su ubicación, reduciendo costos de logística y asegurando demanda constante.
CÓMO IDENTIFICARLO:
- Menciona "vendo materiales", "tengo ferretería", "distribuyo cables", "despacho tuberías", "stock de PVC/EMT/tableros".
FLUJO DE ATENCIÓN:
1. Solicitar el tipo de materiales que distribuye y su ubicación o radio de cobertura (ej. "Lima Norte", "Cercado de Huancayo").
2. Explicarle el sistema de Geo-Alertas: TESLA notifica a los proveedores registrados cuando una obra cercana solicita materiales MEP (cables AWG 10/12, conduit EMT/PVC, tableros, tuberías CPVC, accesorios HVAC).
3. El proveedor confirma stock, precio y plazo de entrega.
4. TESLA cobra una comisión de intermediación del 2–5% del valor de la transacción.
5. Registrar su inventario, zona de cobertura y WhatsApp en el sistema.
TONO: Comercial, orientado al beneficio económico, breve y directo.`
  },

  // ───────────────────────────────────────────────────
  // MARKETPLACE CONTECH v5.0
  // ───────────────────────────────────────────────────
  {
    id: 'marketplace-smart-catalog',
    category: 'marketplace',
    tags: ['smart catalog', 'catálogo', 'anteproyecto', 'PDF', 'JSON', 'Revit', 'DWG', 'render', 'ficha RNE', 'plantilla BIM', 'descargar', '$5', '$10', 'Yape', 'Plin', 'pago'],
    title: 'Smart Catalog — Anteproyectos BIM de TESLA (PDF + JSON)',
    content: `El Smart Catalog es la biblioteca de plantillas BIM de TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C., organizada por área de terreno, frente y tipo de edificación.
CÓMO FUNCIONA (DOS CAPAS):
- CAPA DE VISIÓN (para el cliente): Archivo PDF vectorial de alta calidad (1–2 MB) que muestra plantas, elevaciones, cuadro de áreas y Ficha RNE. Más un archivo JSON con metadatos normativos (área libre, retiros, aforo, dotación de agua, carga eléctrica estimada).
- CAPA DE INGENIERÍA (protegida): Modelo Revit (.rvt) y planos AutoCAD (.dwg) de arquitectura y MEP, custodiados en la nube privada de TESLA. Se liberan solo tras el pago y la firma del contrato.
CATÁLOGO INICIAL (FASE 1):
- 120 m² · 6×20 m · Multifamiliar 4 pisos: S/ 504,000 (casco) / S/ 756,000 (acabados estándar).
- 160 m² · 8×20 m · Multifamiliar 5 pisos.
- 200 m² · 10×20 m · Multifamiliar 6 pisos.
PRECIO DE DESBLOQUEO:
- Anteproyecto Conceptual HD + Ficha RNE + Cuadro de Áreas: $5.00 – $10.00 USD.
- Pago vía: QR Yape / Plin / Culqi (tarjeta de crédito).
APLICACIÓN: Cuando el cliente muestra interés en ver el diseño de su proyecto, PILi_agente muestra el anteproyecto correspondiente del catálogo y ofrece descargarlo mediante la pasarela de pago.`
  },

  {
    id: 'marketplace-escrow-licitaciones',
    category: 'marketplace',
    tags: ['escrow', 'licitación', 'obra', 'contratista', 'hitos', 'pago por avance', 'garantía', 'custodia', 'subasta privada', 'metrado', 'propuesta económica'],
    title: 'Sistema de Escrow y Licitaciones de Obra TESLA',
    content: `El sistema de Escrow (Custodia de Pagos) de TESLA garantiza la ejecución segura de obras MEP entre clientes y contratistas, eliminando el riesgo de impago y abandono de obra.
CÓMO FUNCIONA EL ESCROW:
1. El Cliente deposita el monto total aprobado en la cuenta custodia de TESLA.
2. TESLA publica la licitación privada para contratistas registrados en el sistema, con metrados exactos en PDF/Revit.
3. Los contratistas envían sus propuestas económicas e hitos de construcción.
4. TESLA selecciona al mejor postor (precio + reputación + zona).
5. TESLA libera el pago al contratista según hitos verificados (ej. 30% al inicio, 40% a mitad de obra, 30% a la entrega con acta de conformidad).
VENTAJAS:
- Para el Cliente: Nunca paga por adelantado sin garantía de avance. TESLA actúa como garante.
- Para el Contratista: Pagos asegurados y liberados a tiempo. Acceso a proyectos con metrados exactos, sin necesidad de visitas presupuestales a ciegas.
COMISIÓN TESLA: 5–8% del valor total de la obra sobre el monto custodiado.
TIPOS DE OBRA EN LICITACIÓN: Instalaciones eléctricas, sanitarias, HVAC, ACI, cableado estructurado, automatización y domótica.`
  },

  {
    id: 'marketplace-red-freelance-bim',
    category: 'marketplace',
    tags: ['freelance', 'dibujante', 'modelador', 'Revit', 'AutoCAD', 'MEP', 'portafolio', 'brief', 'Revit MEP', 'urgente', 'subcontrato', 'honorario freelance'],
    title: 'Red Freelance BIM TESLA — Modeladores Revit MEP Certificados',
    content: `La Red Freelance BIM de TESLA es una plataforma de talento certificado en Revit MEP, AutoCAD instalaciones y CYPECAD MEP para atender los proyectos asignados por PILi_agente.
CÓMO FUNCIONA:
1. TESLA recibe a través de PILi_agente la solicitud de diseño o modelado de un cliente o arquitecto.
2. PILi_agente lanza la búsqueda de un freelancer disponible con la especialidad requerida (Eléctrico, Sanitario, HVAC, ACI) y el LOD solicitado.
3. TESLA asigna el Brief JSON al freelancer: contiene los parámetros del proyecto, planos de referencia (PDF/DWG), normativa peruana aplicable, LOD y plazo de entrega.
4. El freelancer entrega el modelo Revit (.rvt) y los planos PDF al entorno de revisión de TESLA (CDE / Autodesk Docs).
5. TESLA controla la calidad (clash detection básico) y entrega al cliente final.
HONORARIOS FREELANCE (referenciales sin IGV):
- Modelado LOD 200 desde planos 2D (por disciplina): S/ 300–600 fijo por proyecto.
- Modelado LOD 300 + coordinación (por disciplina): S/ 600–1,200 por proyecto.
- Clash Detection + Informe: S/ 400–800 por modelo federado.
REQUISITOS DE POSTULACIÓN: CIP vigente (ingenieros) o título en trámite, 1+ año de experiencia en Revit MEP, portafolio en Drive/PDF, WhatsApp activo y disponibilidad para trabajo remoto.`
  },

];

export default PILI_KNOWLEDGE_BASE;
