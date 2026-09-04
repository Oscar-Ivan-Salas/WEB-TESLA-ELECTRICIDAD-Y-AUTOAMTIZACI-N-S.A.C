// ─────────────────────────────────────────────────────────────────────────────
// pili_rag.ts
// Motor Mini-RAG Client-Side para PILI_agente 360°
// Búsqueda por relevancia de keywords (sin embeddings externos)
// ─────────────────────────────────────────────────────────────────────────────

import { PILI_KNOWLEDGE_BASE, KnowledgeChunk } from './pili_knowledge_base';

// Puntuación de relevancia de un chunk respecto a una consulta
function scoreChunk(chunk: KnowledgeChunk, query: string): number {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = q.split(/\s+/).filter(w => w.length > 2);
  let score = 0;

  // Score por tags (peso más alto)
  for (const tag of chunk.tags) {
    const tagNorm = tag.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (q.includes(tagNorm)) score += 6;
    for (const word of words) {
      if (tagNorm.includes(word)) score += 4;
    }
  }

  // Score por título
  const titleNorm = chunk.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (words.some(w => titleNorm.includes(w))) score += 3;

  // Score por contenido
  const contentNorm = chunk.content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const word of words) {
    const matches = (contentNorm.match(new RegExp(word, 'g')) || []).length;
    score += matches * 0.5;
  }

  // Bonus por categoría si la consulta menciona directamente la categoría
  const catBonuses: Record<string, string[]> = {
    normas_peruanas: ['norma', 'rne', 'reglamento', 'em.010', 'em.020', 'em.030', 'is.010', 'itse', 'ntp'],
    costos_mep: ['costo', 'precio', 'cotiz', 'presupuesto', 'honorario', 'cuanto', 'cuánto', 'tarifa', 'valor'],
    bim_standards: ['bim', 'lod', 'clash', 'interferencia', 'coordinacion', 'coordinación', 'iso 19650'],
    revit_mep: ['revit', 'familia', 'modelado', 'modelo', 'workflow', 'linking'],
    autocad: ['autocad', 'cad', 'plano', 'layer', 'capa', 'dwg'],
    aci: ['incendio', 'aci', 'rociador', 'nfpa', 'extincion', 'extinción', 'alarma', 'deteccion'],
    hvac: ['hvac', 'aire', 'climatizacion', 'ducteria', 'ventilacion', 'fan coil', 'chiller'],
    electricidad: ['electrico', 'eléctrico', 'tablero', 'alimentador', 'circuito', 'voltaje', 'amperio'],
    sanitario: ['sanitario', 'agua', 'desague', 'desagüe', 'cisterna', 'bomba', 'tuberia'],
    perfiles_usuario: ['cliente', 'propietario', 'arquitecto', 'ingeniero', 'contratista', 'maestro', 'proveedor', 'ferreteria', 'ferretería', 'quiero construir', 'tengo terreno', 'busco proyecto', 'busco trabajo', 'vendo materiales'],
    marketplace: ['smart catalog', 'anteproyecto', 'catalogo', 'catálogo', 'escrow', 'licitacion', 'licitación', 'freelance', 'dibujante', 'modelador', 'yape', 'plin', '$5', '$10', 'portafolio', 'brief', 'hitos', 'obra'],
  };

  for (const [cat, keywords] of Object.entries(catBonuses)) {
    if (chunk.category === cat && keywords.some(k => q.includes(k))) {
      score += 5;
    }
  }

  return score;
}

// Recuperar los N chunks más relevantes para una consulta
export function retrieveChunks(query: string, topN = 4): KnowledgeChunk[] {
  if (!query || query.trim().length < 3) return [];

  const scored = PILI_KNOWLEDGE_BASE.map(chunk => ({
    chunk,
    score: scoreChunk(chunk, query),
  }));

  const relevant = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(s => s.chunk);

  return relevant;
}

// Formatear los chunks recuperados en un bloque de contexto para el prompt
export function buildRAGContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return '';

  const lines = chunks.map(chunk =>
    `### [CONOCIMIENTO TÉCNICO: ${chunk.title}]\n${chunk.content}`
  );

  return `
## CONTEXTO TÉCNICO RECUPERADO (RAG — Base de Conocimiento TESLA)
Los siguientes fragmentos técnicos son fuentes verificadas de tu base de conocimiento. 
Úsalos como referencia técnica precisa para responder. Cita la norma o estándar cuando sea relevante.

${lines.join('\n\n---\n\n')}

## FIN DEL CONTEXTO TÉCNICO
`;
}

// ──────────────────────────────────────────────
// Generador de Cotización Automática
// ──────────────────────────────────────────────

export interface ProjectData {
  tipo: string;           // Hospital, Edificio Multifamiliar, etc.
  area_m2: number;        // Área total del proyecto
  sistemas: string[];     // ['Eléctrico', 'Sanitario', 'HVAC', 'ACI']
  nivel_bim: 'sin_bim' | 'lod200' | 'lod300' | 'lod400';
  clash_detection: boolean;
  itse: boolean;
  cliente_nombre?: string;
  cliente_whatsapp?: string;
  ubicacion?: string;
}

export function generateQuote(data: ProjectData): string {
  // Rangos base por m² según tipo de proyecto
  const baseRates: Record<string, { min: number; max: number }> = {
    vivienda: { min: 6.0, max: 10.0 },
    multifamiliar: { min: 8.0, max: 14.0 },
    comercial: { min: 12.0, max: 18.0 },
    oficinas: { min: 12.0, max: 18.0 },
    industrial: { min: 10.0, max: 16.0 },
    hospital: { min: 20.0, max: 35.0 },
    clinica: { min: 18.0, max: 28.0 },
    default: { min: 10.0, max: 16.0 },
  };

  // Determinar categoría del proyecto
  const tipoLower = data.tipo.toLowerCase();
  let categoria = 'default';
  for (const key of Object.keys(baseRates)) {
    if (tipoLower.includes(key)) { categoria = key; break; }
  }
  const rate = baseRates[categoria];

  // Ajustes por sistemas seleccionados
  let systemFactor = 0;
  if (data.sistemas.includes('Eléctrico')) systemFactor += 0.30;
  if (data.sistemas.includes('Sanitario')) systemFactor += 0.25;
  if (data.sistemas.includes('HVAC')) systemFactor += 0.30;
  if (data.sistemas.includes('ACI')) systemFactor += 0.15;

  // Ajuste BIM
  let bimAdder = 0;
  if (data.nivel_bim === 'lod200') bimAdder = 3.0;
  if (data.nivel_bim === 'lod300') bimAdder = 6.0;
  if (data.nivel_bim === 'lod400') bimAdder = 10.0;

  // Clash Detection
  const clashAdder = data.clash_detection ? 3.0 : 0;

  // ITSE
  const itseFlat = data.itse ? 1500 : 0; // fijo

  // Cálculo total
  const adjustedMin = (rate.min * systemFactor) + bimAdder + clashAdder;
  const adjustedMax = (rate.max * systemFactor) + bimAdder + clashAdder;
  const totalMin = Math.round(data.area_m2 * adjustedMin + itseFlat);
  const totalMax = Math.round(data.area_m2 * adjustedMax + itseFlat);
  const totalMinUSD = Math.round(totalMin / 3.72);
  const totalMaxUSD = Math.round(totalMax / 3.72);

  // Tiempo estimado
  let tiempo = '3–5 días hábiles';
  if (data.area_m2 > 500) tiempo = '10–15 días hábiles';
  if (data.area_m2 > 3000) tiempo = '20–35 días hábiles';

  const sistemasLabel = data.sistemas.join(', ') || 'Por definir';
  const bimLabel = data.nivel_bim === 'sin_bim' ? 'CAD 2D (sin BIM)' : `Modelado BIM ${data.nivel_bim.toUpperCase()}`;

  return `
---
## 📊 COTIZACIÓN REFERENCIAL PRELIMINAR — PILI AGENTE 360°
**TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.**
*Departamento de Diseño e Implementación: GatoMichuy*

| Parámetro | Detalle |
|---|---|
| **Proyecto** | ${data.tipo} |
| **Área total** | ${data.area_m2.toLocaleString('es-PE')} m² |
| **Sistemas MEP** | ${sistemasLabel} |
| **Alcance BIM** | ${bimLabel} |
| **Clash Detection** | ${data.clash_detection ? '✅ Incluido' : '—'} |
| **Expediente ITSE** | ${data.itse ? '✅ Incluido (+ S/ 1,500 fijo)' : '—'} |
| **Ubicación** | ${data.ubicacion || 'Huancayo, Junín — Perú'} |

### 💰 RANGO DE HONORARIOS ESTIMADO (sin IGV):
| | Mínimo | Máximo |
|---|---|---|
| **En Soles (S/)** | S/ ${totalMin.toLocaleString('es-PE')} | S/ ${totalMax.toLocaleString('es-PE')} |
| **En USD** | USD ${totalMinUSD.toLocaleString('es-PE')} | USD ${totalMaxUSD.toLocaleString('es-PE')} |

### ⏱️ Tiempo de entrega estimado: **${tiempo}**

> ⚠️ **IMPORTANTE**: Esta es una cotización preliminar de referencia basada en los datos que has proporcionado. El presupuesto definitivo requiere la revisión de los planos de arquitectura y definición exacta del alcance por nuestro equipo técnico.
>
> 📱 **¿Deseas enviar esta Cotización a un Ingeniero de TESLA por WhatsApp?**
>
> [👉 **Contactar por WhatsApp (+51 970 000 000)**](https://wa.me/51970000000?text=Hola%20TESLA%20SAC,%20acabo%20de%20generar%20una%20cotizaci%C3%B3n%20preliminar%20con%20PILi_agente%20para%20un%20proyecto%20de%20${encodeURIComponent(data.tipo)}%20de%20${data.area_m2}%20m%C2%B2.%20Rango:%20S/%20${totalMin}%20-%20S/%20${totalMax}.%20Deseo%20coordinar%20la%20propuesta%20formal.)

---
`;
}

// Detectar si el usuario ha proporcionado suficiente info para cotizar
export function detectQuoteIntent(conversation: string): boolean {
  const lowerConv = conversation.toLowerCase();
  const areaPattern = /\d+\s*(m²|m2|metros|hectareas|m cuadrados)/;
  const hasTipo = ['hospital', 'edificio', 'vivienda', 'planta', 'centro', 'comercial', 'industrial', 'clínica', 'clinica', 'multifamiliar', 'local'].some(t => lowerConv.includes(t));
  const hasSistema = ['eléctrico', 'electrico', 'sanitario', 'hvac', 'aci', 'mep', 'incendio'].some(s => lowerConv.includes(s));
  const hasArea = areaPattern.test(lowerConv) || /\d{3,6}\s*m/.test(lowerConv);

  return hasTipo && (hasSistema || hasArea);
}
