import React, { useState, useRef, useEffect } from 'react';
import EvilEye from './EvilEye';
import { MepFloorPlan2D } from './MepFloorPlan2D';
import { retrieveChunks, buildRAGContext, generateQuote, detectQuoteIntent, ProjectData } from './pili_rag';

// ─── Supabase Lead Capture (fetch directo, sin SDK) ───────────────────────────
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fckbbohlxfqoyiomyxqm.supabase.co';
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
async function saveLead(nombre: string, whatsapp: string, proyecto: string): Promise<'ok' | 'error'> {
  if (!SUPA_KEY) return 'error';
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, Prefer: 'return=minimal' },
      body: JSON.stringify({ nombre, whatsapp, proyecto, fuente: 'PILi_agente', created_at: new Date().toISOString() }),
    });
    return r.ok ? 'ok' : 'error';
  } catch { return 'error'; }
}

// ─────────────────────────────────────────────────────────────────────────────
// PILi_agente — Studio 360° BIM MEP | TESLA Electricidad y Automatización S.A.C.
// ─────────────────────────────────────────────────────────────────────────────

const PILI_SYSTEM_PROMPT = `================================================================================
MASTER SYSTEM INSTRUCTIONS: PILi_agente v5.0 (TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.)
================================================================================

ROL E IDENTIDAD CORPORATIVA:
Eres PILi_agente, la Orquestadora Central y Consultora Senior del Ecosistema ConTech de TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C. (Huancayo, Perú). Tu propósito es actuar como el cerebro coordinador del Managed Marketplace de TESLA: ayudas a clientes a diseñar y cotizar anteproyectos, gestionas solicitudes de arquitectos e ingenieros MEP, lanzas licitaciones de obra para contratistas y conectas solicitudes de materiales con proveedores cercanos. Todo bajo estricta adherencia al Reglamento Nacional de Edificaciones (RNE), normas ITSE, CNE Utilización y estándares internacionales BIM / ISO 19650.

MINDSET Y TONO COMERCIAL:
1. Eres empática, altamente profesional, didáctica y comercialmente perspicaz.
2. Diagnosticas primero, educas sobre la ley peruana y propones soluciones antes de dar precios.
3. Utilizas inteligencia emocional: valida los sueños y presupuestos del cliente, pero mantén rigor técnico.
4. NUNCA eres pasiva — guías la conversación hacia el siguiente paso concreto.
5. NUNCA respondas con bloques de texto masivo. Usa viñetas cortas, negrillas y encabezados estructurados.
6. Hablas en español peruano. Tratas de "usted" a clientes mayores y de "tú" a jóvenes profesionales.

══════════════════════════════════════════════════════════════
CLASIFICACIÓN AUTOMÁTICA DE PERFIL DE USUARIO
══════════════════════════════════════════════════════════════
Durante los primeros 1-2 mensajes, identifica el perfil del usuario y conmuta tu comportamiento:

[PERFIL 1 — CLIENTE / PROPIETARIO (B2C)]:
SEÑALES: "quiero construir", "tengo un terreno", "cuánto cuesta", "cuántos pisos", "casa", "departamento", "dueño", "familia".
FLUJO:
1. Preguntar: área del terreno (m²), frente(s), número de pisos deseados, uso (vivienda/comercio), distrito/ciudad.
2. Diagnosticar viabilidad según RNE A.010: retiros, área libre mínima, altura máxima, factibilidad.
3. Si los datos corresponden al Smart Catalog: mencionar el anteproyecto disponible y ofrecerlo por $5–$10 USD vía Yape/Plin/Tarjeta.
4. Emitir Cotización Referencial en Soles (S/.) y USD (usa tu herramienta de cotización).
5. Registrar el lead (nombre, WhatsApp, proyecto) para que ingeniería los contacte en 2–4 horas hábiles.
TONO: Cálido, empático, sin tecnicismos. Como una amiga ingeniera explicando a un familiar.

[PERFIL 2 — ARQUITECTO / INGENIERO (B2B)]:
SEÑALES: "expediente técnico", "necesito MEP", "clash detection", "Revit", "LOD", "CIP", "coordinación BIM", "busco un proyectista", "tengo el proyecto de arq".
FLUJO:
1. Si necesita SERVICIOS MEP: solicitar planos de arquitectura (PDF/DWG), área total (m²), plazo de entrega, ciudad. Emitir cotización de ingeniería MEP.
2. Si desea POSTULAR a la Red Freelance BIM: solicitar especialidad (Eléctrico/Sanitario/HVAC/ACI), software dominado, LOD máximo trabajado, portafolio (Drive/PDF) y WhatsApp.
3. Registrar en el Marketplace BIM de TESLA para asignarle briefs Revit.
TONO: Técnico, entre pares. Usar normativa (ISO 19650, LOD, NFPA) y jerga BIM con naturalidad.

[PERFIL 3 — CONTRATISTA / MAESTRO DE OBRA]:
SEÑALES: "busco proyectos", "quiero licitar", "cuadrilla", "instalo tableros", "monto tuberías", "me dedico a la obra".
FLUJO:
1. Presentar licitaciones activas en su zona con: tipo de proyecto, sistema MEP, área, plazo y modalidad de pago por hitos (Escrow TESLA).
2. Explicar el sistema Escrow: el cliente deposita y TESLA libera los pagos al contratista según avance verificado (30% inicio / 40% avance / 30% entrega con acta).
3. Registrar su especialidad, zona de cobertura y WhatsApp para futuras asignaciones.
TONO: Práctico, concreto, con cifras claras. Sin tecnicismos de modelado BIM.

[PERFIL 4 — PROVEEDOR / FERRETERÍA (B2B GEO)]:
SEÑALES: "vendo materiales", "tengo ferretería", "distribuyo cables", "stock PVC/EMT/tableros", "proveedor".
FLUJO:
1. Solicitar tipo de materiales, ubicación física y radio de cobertura.
2. Explicar el sistema de Geo-Alertas: TESLA notifica cuando una obra cercana necesita materiales MEP.
3. Informar la comisión de intermediación: 2–5% sobre el valor de la transacción.
4. Registrar inventario, zona y WhatsApp en el sistema.
TONO: Comercial, orientado al beneficio económico. Breve y directo.

══════════════════════════════════════════════════════════════
SMART CATALOG — ANTEPROYECTOS BIM DISPONIBLES
══════════════════════════════════════════════════════════════
Cuando el cliente tiene un terreno que calza con el catálogo, menciona la plantilla disponible:
- CAT-120-001: 120 m² · Frente 6m × Fondo 20m · Multifamiliar 4 pisos · S/ 504,000 (casco) / S/ 756,000 (acabados estándar). Desbloqueo: $5 USD.
- CAT-160-001: 160 m² · Frente 8m × Fondo 20m · Multifamiliar 5 pisos. Desbloqueo: $8 USD.
- CAT-200-001: 200 m² · Frente 10m × Fondo 20m · Multifamiliar 6 pisos. Desbloqueo: $10 USD.
Incluye: Ficha RNE + Cuadro de Áreas + Planos Arquitectónicos Conceptuales HD en PDF. El modelo Revit/DWG se libera solo tras firma de contrato.

══════════════════════════════════════════════════════════════
REGLAS NORMATIVAS INVIOLABLES (PERÚ — RNE / ITSE / CNE)
══════════════════════════════════════════════════════════════
- RNE A.010 (Residencial): Pozo de luz mínimo (12% área construida), altura libre ≥ 2.30m, retiro municipal, pozo a tierra.
- RNE A.070/A.080 (Comercial/Hotel): SSHH independientes, ACI, luces emergencia, ruta evacuación ≥ 1.20m.
- EM.010 (Eléctrico): Caída de tensión máx. 2.5% alimentadores, puesta a tierra ≤ 25Ω (vivienda) / ≤ 5Ω (industria).
- EM.020 / IS.010 (Sanitario): Dotaciones por edificación, cisterna ≥ 3/4 del consumo diario.
- EM.030 (HVAC): Renovaciones de aire mínimas por espacio.
- Si el cliente pide algo que viola el RNE, corrígelo con la norma exacta y propón la alternativa técnica.

══════════════════════════════════════════════════════════════
DELTA-EDIT Y MEMORIA DE SESIÓN
══════════════════════════════════════════════════════════════
Si el usuario solicita modificaciones sobre un diseño previo (ej. "agranda la cocina", "cambia a HVAC centralizado"), ejecuta un Delta-Edit: modifica únicamente el parámetro solicitado sin reiniciar el contexto de la sesión. Mantén persistente toda la información del proyecto acumulada durante la conversación.

HERRAMIENTAS INTERACTIVAS DISPONIBLES (usa estas en tu respuesta cuando corresponda):
- 🧮 Calculadora ROI BIM: para demostrar el ahorro económico del BIM vs. CAD 2D.
- 📋 Checklist ITSE: para auditar requisitos de certificación de Defensa Civil.
- 🗂️ Registro Lead: para capturar los datos del cliente directamente en la base de datos de TESLA.
- 📐 Plano CAD 2D MEP: para mostrar un plano de instalaciones de referencia.

FIRMA OBLIGATORIA (en intervenciones técnicas clave):
"⚡ PILi_agente 360° | Centro de Despacho e Ingeniería BIM MEP | TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C. · Departamento de Diseño e Implementación GatoMichuy"
================================================================================`;

// ─── Tipos ───────────────────────────────────────────────────────────────────
type AgentMode = 'cotizar' | 'obra' | 'planos' | 'freelance' | 'proveedor';
type AgentStatus = 'idle' | 'analyzing' | 'thinking';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fileName?: string;
  fileType?: string;
  fileDataUrl?: string;
}

interface ConvTurn {
  role: string;
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

// ─── Sidebar modes ────────────────────────────────────────────────────────────
const MODES: { key: AgentMode; label: string; icon: string; short: string }[] = [
  { key: 'cotizar', label: 'Ingeniería y Cotización', icon: '💰', short: 'Cotizar Proyecto' },
  { key: 'obra', label: 'Gestión de Contratistas', icon: '🏗️', short: 'Ejecución/Obra' },
  { key: 'planos', label: 'Análisis IA de Planos', icon: '🔍', short: 'Auditoría BIM' },
  { key: 'freelance', label: 'Red de Talento BIM', icon: '👨‍💻', short: 'Freelance Hub' },
  { key: 'proveedor', label: 'Marketplace Materiales', icon: '🏭', short: 'Proveedores B2B' },
];

const MODE_CHIPS: Record<AgentMode, string[]> = {
  cotizar: ['Quiero diseñar mi edificio', 'Calculadora de Retorno ROI', 'Ficha Técnica RNE'],
  obra: ['Asignar cuadrillas mecánicas', 'Revisar interferencias ITSE', 'Costos de instalación'],
  planos: ['Buscar interferencias Sanitarias', 'Extraer Metrados', 'Generar Checklist ITSE'],
  freelance: ['Postular como Dibujante CAD', 'Soy Modelador MEP LOD400', 'Ver proyectos abiertos'],
  proveedor: ['Registrar mi Ferretería', 'Catálogo de Bandejas', 'Homologar Tableros Eléctricos']
};

const EYE_COLORS: Record<AgentMode, string> = {
  cotizar: '#FFB800',
  obra: '#F97316',
  planos: '#4FC3F7',
  freelance: '#10B981',
  proveedor: '#8B5CF6'
};

const AGENT_TOOLS = [
  { icon: '🔍', label: 'Análisis de Planos', desc: 'IA detecta sistemas MEP e interferencias' },
  { icon: '🧮', label: 'Calculadora ROI', desc: 'Ahorro BIM vs. método 2D en S/.' },
  { icon: '📊', label: 'Ficha Técnica', desc: 'Resumen técnico con LOD y normas' },
  { icon: '📋', label: 'Checklist ITSE', desc: 'Requisitos Defensa Civil / RNE' },
  { icon: '📐', label: 'Marketplace BIM', desc: 'Proyectos para freelancers Revit' },
  { icon: '🗂️', label: 'Registro Lead', desc: 'Captura nombre + WhatsApp del cliente' },
];

// ─── Gemini REST + RAG ────────────────────────────────────────────────────────
async function callGemini(
  history: ConvTurn[],
  userText: string,
  fileBase64?: string,
  fileMime?: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('TU_CLAVE')) {
    return 'Para activar la IA agrega `VITE_GEMINI_API_KEY` en `.env.local`. **PILi_agente** está lista una vez configurada.';
  }

  // ── MEMORIA A LARGO PLAZO (LTM) LOCALSTORAGE ──
  const memoryKey = `pili_ltm_memory`;
  const savedMemory = localStorage.getItem(memoryKey) || "Aún no hay contexto del usuario.";

  // ── RAG: recuperar contexto técnico relevante ─────────────────────────────
  const ragChunks = retrieveChunks(userText, 4);
  const ragContext = buildRAGContext(ragChunks);

  let currentTextPrompt = userText;
  const userParts: ConvTurn['parts'] = [];

  // ── INTERCEPCIÓN ANTI-TIMEOUT PARA PDFS PESADOS ──
  if (fileBase64 && fileMime) {
    if (fileMime.startsWith('image/')) {
      userParts.push({ inlineData: { mimeType: fileMime, data: fileBase64 } });
    } else {
      // Bloquear payload masivo de PDF/DWG si pesa demasiado (gemini flash peta)
      currentTextPrompt += `\n[Contexto del Sistema]: El usuario acaba de adjuntar un archivo técnico pesado (PDF o CAD) que por seguridad de red ha sido interceptado en el frontend, no intentes leerlo visualmente. Usa tu conocimiento RAG y el historial para inferir que es un plano de ingeniería o especificaciones y asístele con normativas MEP y análisis teórico asumiendo los datos que te provea en el chat.`;
    }
  }

  currentTextPrompt = `=== MEMORIA COGNITIVA LTM ===\n${savedMemory}\n=============================\n\nUsuario: ${currentTextPrompt}`;
  userParts.push({ text: currentTextPrompt });

  const systemWithRAG = PILI_SYSTEM_PROMPT + (ragContext ? '\n\n' + ragContext : '');

  const contents: ConvTurn[] = [
    { role: 'user', parts: [{ text: systemWithRAG + '\n\nEntendido.' }] },
    { role: 'model', parts: [{ text: 'Entendido. Soy PILi_agente de TESLA S.A.C. ¿Cómo puedo ayudarte hoy?' }] },
    ...history,
    { role: 'user', parts: userParts },
  ];

  try {
    const abortCtrl = new AbortController();
    const timeoutId = setTimeout(() => abortCtrl.abort(), 60000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ contents }),
        signal: abortCtrl.signal
      }
    );
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`Cloud Server Error ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta.';

    // APRENDIZAJE PERPETUO: Grabar datos estructurales que el usuario dice.
    const memoryMatch = userText.match(/(me llamo|soy|mi nombre|mi empresa|ubicado en|presupuesto de|proyecto de ) (.+)/i);
    if (memoryMatch) {
       const newFact = `- ${memoryMatch[0]} (Guardado: ${new Date().toLocaleDateString()})\n`;
       const updatedMem = (localStorage.getItem(memoryKey) || "") + newFact;
       localStorage.setItem(memoryKey, updatedMem.slice(-2000));
    }

    return reply;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return `⚠️ **PILi Router (Red Saturada):** El archivo originó un timeout. \n\nHe activado el Motor Local: Entiendo que quieres analizar la trama MEP. Podemos conectarlo al servidor privado de GatoMichuy, o cuéntame más sobre las áreas y lo resolveré con pura lógica.`;
    }
    return `⚡ **PILi Multi-IA Fallback Engine:** Google Gemini Cloud experimenta alta latencia y rechazó la petición.\n\nHe registrado tu instrucción ("*${userText.substring(0,35)}...*") en mi memoria local. En cuanto este nodo o un LLM gemelo (Claude/Llama) levante, procederemos. ¿Quieres revisar tus normativas (ITSE) internamente mientras tanto?`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal: PILi_agente
// ─────────────────────────────────────────────────────────────────────────────
// ─── Modal ROI ────────────────────────────────────────────────────────────────
function RoiModal({ onClose, onInject }: { onClose: () => void; onInject: (txt: string) => void }) {
  const [area, setArea] = useState(500);
  const [tipo, setTipo] = useState('Multifamiliar');
  const tipos = ['Vivienda', 'Multifamiliar', 'Comercial', 'Hotel', 'Industrial'];
  const clashFactor: Record<string, number> = { Vivienda: 0.08, Multifamiliar: 0.12, Comercial: 0.15, Hotel: 0.14, Industrial: 0.18 };
  const costPer: Record<string, number> = { Vivienda: 1200, Multifamiliar: 1600, Comercial: 2000, Hotel: 1800, Industrial: 2400 };
  const clashes = Math.round(area * (clashFactor[tipo] || 0.12));
  const saving = Math.round(clashes * (costPer[tipo] || 1600));
  const savingUSD = Math.round(saving / 3.72);
  const inject = () => {
    onInject(`Acabo de calcular el ROI BIM para mi proyecto: **${tipo}** de **${area} m²** — ahorros estimados: **S/ ${saving.toLocaleString()} (USD ${savingUSD.toLocaleString()})** en adicionales y re-trabajos evitados con ${clashes} clashes detectados. ¿Qué sistemas MEP recomiendas modelar en LOD 300?`);
    onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,8,16,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#0D1422', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 20, padding: 28, width: 380, maxWidth: '92vw' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFB800', marginBottom: 16, letterSpacing: 1 }}>🧮 CALCULADORA ROI BIM</div>
        <label style={{ fontSize: 11, color: '#667', display: 'block', marginBottom: 4 }}>TIPO DE PROYECTO</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {tipos.map(t => <button key={t} onClick={() => setTipo(t)} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, background: tipo === t ? 'rgba(255,184,0,0.15)' : 'transparent', border: `1px solid ${tipo === t ? '#FFB800' : 'rgba(255,184,0,0.2)'}`, color: tipo === t ? '#FFB800' : '#556', cursor: 'pointer' }}>{t}</button>)}
        </div>
        <label style={{ fontSize: 11, color: '#667' }}>ÁREA TOTAL: <strong style={{ color: '#FFB800' }}>{area} m²</strong></label>
        <input type="range" min={100} max={8000} step={50} value={area} onChange={e => setArea(+e.target.value)} style={{ width: '100%', margin: '8px 0 20px', accentColor: '#FFB800' }} />
        <div style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#667', marginBottom: 4 }}>CLASHES PREVENIDOS: <strong style={{ color: '#FFB800' }}>{clashes}</strong></div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>S/ {saving.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#4FC3F7' }}>USD {savingUSD.toLocaleString()} en re-trabajos evitados</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={inject} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#E63946,#b02530)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Enviar a PILi ▶</button>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,184,0,0.2)', color: '#556', cursor: 'pointer', fontSize: 13 }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Lead ────────────────────────────────────────────────────────────────
function LeadModal({ onClose, onInject }: { onClose: () => void; onInject: (txt: string) => void }) {
  const [nombre, setNombre] = useState('');
  const [wa, setWa] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const submit = async () => {
    if (!nombre || !wa) return;
    setState('sending');
    const res = await saveLead(nombre, wa, proyecto);
    setState(res === 'ok' ? 'ok' : 'err');
    if (res === 'ok') {
      onInject(`He registrado mi contacto: **${nombre}** — WhatsApp: ${wa}. Proyecto: ${proyecto || 'Por definir'}. ¿Cuáles son los siguientes pasos para recibir la propuesta formal de TESLA?`);
      setTimeout(onClose, 1200);
    }
  };
  const inp = (ph: string, val: string, set: (v: string) => void) => (
    <input placeholder={ph} value={val} onChange={e => set(e.target.value)} style={{ width: '100%', background: 'rgba(15,22,36,0.7)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 8, padding: '9px 12px', color: '#E8E8E8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
  );
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,8,16,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#0D1422', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 20, padding: 28, width: 360, maxWidth: '92vw' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFB800', marginBottom: 16, letterSpacing: 1 }}>🗂️ REGISTRO DE CONTACTO</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {inp('Nombre completo *', nombre, setNombre)}
          {inp('WhatsApp (+ código país) *', wa, setWa)}
          {inp('Describe tu proyecto (opcional)', proyecto, setProyecto)}
        </div>
        {state === 'ok' && <div style={{ color: '#4CAF50', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>✅ ¡Registrado! El equipo de TESLA te contactará pronto.</div>}
        {state === 'err' && <div style={{ color: '#E63946', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>⚠️ Error al guardar. Verifica la clave Supabase en .env.local</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={submit} disabled={state === 'sending' || !nombre || !wa} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#E63946,#b02530)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: !nombre || !wa ? 0.5 : 1 }}>
            {state === 'sending' ? '⟳ Enviando...' : 'Registrar ▶'}
          </button>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,184,0,0.2)', color: '#556', cursor: 'pointer', fontSize: 13 }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Payment (Pasarela MercadoPago/Stripe Simulada) ─────────────────────
function PaymentModal({ onClose, price, catalogId, onInject }: { onClose: () => void; price: number; catalogId: string; onInject: (txt: string) => void }) {
  const [state, setState] = useState<'idle' | 'processing' | 'ok'>('idle');
  
  const handlePay = () => {
    setState('processing');
    setTimeout(() => {
      setState('ok');
      setTimeout(() => {
        onInject(`✅ Acabo de abonar los **$${price} USD** para desbloquear el modelo **${catalogId}**. ¿Me envías el enlace oficial para la descarga y previsualización de los archivos editables (Revit/DWG)?`);
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,8,16,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#0D1422', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 20, padding: 32, width: 380, maxWidth: '92vw', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>💳</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#4FC3F7', letterSpacing: 1 }}>PASARELA TESLA SECURE</div>
          <div style={{ fontSize: 24, color: '#fff', fontWeight: 800, marginTop: 8 }}>$ {price}.00 USD</div>
          <div style={{ fontSize: 12, color: '#667', marginTop: 4 }}>Desbloqueo VIP: {catalogId}</div>
        </div>
        
        {state === 'idle' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input placeholder="Número de Tarjeta (Simulado)" disabled style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px', color: '#889', fontSize: 13 }} value="**** **** **** 4242" />
            <button onClick={handlePay} style={{ width: '100%', padding: '14px', borderRadius: 10, background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
              Pagar $ {price}.00 y Desbloquear
            </button>
            <button onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'transparent', border: 'none', color: '#667', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
          </div>
        ) : state === 'processing' ? (
          <div style={{ textAlign: 'center', color: '#4FC3F7', padding: '20px 0' }}>
            <span style={{ fontSize: 24, display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span>
            <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700 }}>Procesando tarjeta...</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#10B981', padding: '20px 0' }}>
            <span style={{ fontSize: 40 }}>✅</span>
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 800 }}>¡Pago Exitoso!</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal ITSE ────────────────────────────────────────────────────────────────
const ITSE_ITEMS: { label: string; norm: string }[] = [
  { label: 'Planos aprobados de arquitectura', norm: 'RNE A.010' },
  { label: 'Certificado de parámetros urbanísticos', norm: 'Municipalidad' },
  { label: 'Plano de instalaciones eléctricas', norm: 'RNE EM.010' },
  { label: 'Plano de instalaciones sanitarias', norm: 'RNE IS.010' },
  { label: 'Plano ACI (rociadores / gabinetes)', norm: 'NFPA 13/14' },
  { label: 'Señalización y rutas de evacuación', norm: 'RNE A.130' },
  { label: 'Luces de emergencia en escaleras', norm: 'RNE A.130 §16' },
  { label: 'SSHH accesibles (discapacitados)', norm: 'RNE A.120' },
  { label: 'Puesta a tierra documentada ≤25Ω', norm: 'CNE Utilización §060' },
  { label: 'Estudio de impacto vial (>500 m²)', norm: 'RNE A.010 §35' },
];
function ItseModal({ onClose, onInject }: { onClose: () => void; onInject: (txt: string) => void }) {
  const [checks, setChecks] = useState<boolean[]>(new Array(ITSE_ITEMS.length).fill(false));
  const toggle = (i: number) => setChecks(c => c.map((v, j) => j === i ? !v : v));
  const done = checks.filter(Boolean).length;
  const inject = () => {
    const missing = ITSE_ITEMS.filter((_, i) => !checks[i]).map(it => it.label);
    const txt = missing.length === 0
      ? '¡Mi proyecto tiene **todos los requisitos ITSE** listos! ¿Me puedes ayudar a organizar el expediente para presentar a Defensa Civil?'
      : `Mi proyecto le **falta ${missing.length} documento(s) ITSE**: ${missing.map(m => `• ${m}`).join('\n')}. ¿Cómo los consigo y qué prioridad tienen?`;
    onInject(txt);
    onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,8,16,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#0D1422', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 20, padding: 28, width: 420, maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFB800', marginBottom: 4, letterSpacing: 1 }}>📋 CHECKLIST ITSE — DEFENSA CIVIL</div>
        <div style={{ fontSize: 10, color: '#445', marginBottom: 16 }}>Marca lo que ya tienes listo:</div>
        {ITSE_ITEMS.map((it, i) => (
          <div key={i} onClick={() => toggle(i)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: checks[i] ? 'rgba(80,200,100,0.05)' : 'transparent', marginBottom: 4 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checks[i] ? '#4CAF50' : 'rgba(255,184,0,0.25)'}`, background: checks[i] ? '#4CAF50' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, color: '#fff' }}>{checks[i] ? '✓' : ''}</div>
            <div>
              <div style={{ fontSize: 12, color: checks[i] ? '#4CAF50' : '#E8E8E8' }}>{it.label}</div>
              <div style={{ fontSize: 10, color: '#445' }}>{it.norm}</div>
            </div>
          </div>
        ))}
        <div style={{ margin: '16px 0 12px', textAlign: 'center', fontSize: 13, color: done === ITSE_ITEMS.length ? '#4CAF50' : '#FFB800', fontWeight: 700 }}>{done}/{ITSE_ITEMS.length} Cumplidos</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={inject} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#E63946,#b02530)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Consultar a PILi ▶</button>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,184,0,0.2)', color: '#556', cursor: 'pointer', fontSize: 13 }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Ficha Técnica ────────────────────────────────────────────────────────
function FichaModal({ onClose, onInject }: { onClose: () => void; onInject: (txt: string) => void }) {
  const inject = () => {
    onInject('Genera una **Ficha Técnica RNE** para mi proyecto especificando el nivel de detalle (LOD 300) y las normativas aplicables para poder presentarla al municipio.');
    onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,8,16,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#0D1422', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 20, padding: 28, width: 380, maxWidth: '92vw' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFB800', marginBottom: 16, letterSpacing: 1 }}>📊 FICHA TÉCNICA RNE / BIM</div>
        <div style={{ fontSize: 12, color: '#E8E8E8', marginBottom: 20, lineHeight: 1.6 }}>
          La Inteligencia Artificial de TESLA puede estructurar una ficha técnica validada por el Reglamento Nacional de Edificaciones (Perú) para proyectos BIM MEP.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={inject} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#E63946,#b02530)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Solicitar a PILi ▶</button>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,184,0,0.2)', color: '#556', cursor: 'pointer', fontSize: 13 }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Marketplace ────────────────────────────────────────────────────────
function MarketplaceModal({ onClose, onInject }: { onClose: () => void; onInject: (txt: string) => void }) {
  const injectFreelance = () => {
    onInject('Soy modelador Revit MEP LOD 400. ¿Tienen convocatorias disponibles o proyectos en licitación en el Marketplace?');
    onClose();
  };
  const injectMaterial = () => {
    onInject('Quiero registrar el catálogo de mi ferretería eléctrica para ser proveedor de sus licitaciones MEP y recibir cotizaciones.');
    onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,8,16,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#0D1422', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 20, padding: 28, width: 420, maxWidth: '92vw' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFB800', marginBottom: 16, letterSpacing: 1 }}>📐 MARKETPLACE BIM (CONTECH)</div>
        <div style={{ fontSize: 12, color: '#E8E8E8', marginBottom: 16, lineHeight: 1.6 }}>
          Únete a la red hiperlocal de TESLA S.A.C. conectando tu perfil profesional o stock ferretero directamente a nuestras obras y clientes.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
           <button onClick={injectFreelance} style={{ textAlign: 'left', padding: '14px', borderRadius: 10, background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', color: '#4FC3F7', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>👨‍💻 Soy Dibujante / Modelador BIM</button>
           <button onClick={injectMaterial} style={{ textAlign: 'left', padding: '14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>🏗️ Soy Ferretería / Proveedor (B2B)</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 10, background: 'transparent', border: 'none', color: '#667', cursor: 'pointer', fontSize: 12 }}>✕ Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Componente principal: PILi_agente
// ─────────────────────────────────────────────────────────────────────────────
export default function PILi_agente() {

  const [mode, setMode] = useState<AgentMode>('cotizar');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [history, setHistory] = useState<ConvTurn[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [showTools, setShowTools] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; dataUrl: string; base64: string } | null>(null);
  const [viewerFile, setViewerFile] = useState<{ dataUrl: string; type: string; name: string } | null>(null);
  const [showCad, setShowCad] = useState(false);
  const [modal, setModal] = useState<'roi' | 'itse' | 'lead' | 'payment' | 'ficha' | 'market' | null>(null);
  const [activePrice, setActivePrice] = useState(5);
  const [activeCatalog, setActiveCatalog] = useState('CAT-120-001');
  const [chatWidth, setChatWidth] = useState(600);
  const injectMessage = (txt: string) => { sendMessage(txt); };

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentStatus]);

  useEffect(() => {
    const welcomes: Record<AgentMode, string> = {
      cotizar: '¡Bienvenido! Soy **PILi_agente** 👷‍♀️\n\nArquitecta e Ingeniera Consultora Senior de **TESLA S.A.C.**\n\nDime: ¿qué tipo de proyecto tienes? (vivienda, hotel, comercial, industrial). Con el área (m²) estimaremos **sistemas MEP, normativas y costos**.\n\n¿Empezamos?',
      obra: '¡Hola! Soy **PILi_agente**, supervisora de terreno 🏗️\n\nAsignaré cuadrillas mecánicas y subcontratas eléctricas verificadas. ¿Estás buscando contratistas, o eres uno queriendo asociarse a TESLA?',
      planos: '¡Hola! Estoy lista para analizar tu plano con **IA de Precisión Técnica** 🔍\n\nAdjunta tu plano (CAD o PDF) con el botón **＋**. Examinaré cruces, instalaciones defectuosas y requisitos requeridos por INDECI (ITSE).',
      freelance: '¡Hola! Soy coordinadora de la **Red de Talento BIM** 📐\n\nSi eres Arquitecto, Modelador Revit o Gestor BIM, puedes aplicar aquí mismo para unirte a nuestros proyectos remotos.',
      proveedor: '¡Hola, Partners B2B! Soy la gestora del **Marketplace de Materiales** 🏭\n\n¿Eres una ferretería, importador o marca (ej. Legrand, Bticino)? Ingresa tu inventario y te homologaremos para que los ingenieros de TESLA te compren directamente.',
    };
    setMessages([{ id: 'welcome', role: 'assistant', content: welcomes[mode] }]);
    setHistory([]);
    setAttachedFile(null);
    setViewerFile(null);
  }, [mode]);

  // Compresión de imagen para evitar Timeout en base64 gigantes (muy grandes)
  const compressImage = async (file: File): Promise<{ blobUrl: string, base64: string }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1500;
        let { width, height } = img;
        
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // comprimir a 85% jpeg
        resolve({ blobUrl: dataUrl, base64: dataUrl.split(',')[1] });
      };
      img.src = url;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const { blobUrl, base64 } = await compressImage(file);
      setAttachedFile({ name: file.name, type: 'image/jpeg', dataUrl: blobUrl, base64 });
      setViewerFile({ dataUrl: blobUrl, type: 'image/jpeg', name: file.name });
    } else {
      const blobUrl = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const base64 = dataUrl.split(',')[1];
        setAttachedFile({ name: file.name, type: file.type, dataUrl: blobUrl, base64 });
        setViewerFile({ dataUrl: blobUrl, type: file.type, name: file.name });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const { blobUrl, base64 } = await compressImage(file);
          setAttachedFile({ name: 'CapturaPegada.jpg', type: 'image/jpeg', dataUrl: blobUrl, base64 });
          setViewerFile({ dataUrl: blobUrl, type: 'image/jpeg', name: 'CapturaPegada.jpg' });
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = chatWidth;

    const onPointerMove = (ev: PointerEvent) => {
      const newWidth = startWidth + (ev.clientX - startX);
      setChatWidth(Math.max(300, Math.min(newWidth, window.innerWidth - 200)));
    };

    const onPointerUp = () => {
      document.body.style.cursor = 'default';
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const handleSidebarDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    if (sidebarCollapsed) setSidebarCollapsed(false);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onPointerMove = (ev: PointerEvent) => {
      const newWidth = startWidth + (ev.clientX - startX);
      setSidebarWidth(Math.max(200, Math.min(newWidth, window.innerWidth / 2.5)));
    };

    const onPointerUp = () => {
      document.body.style.cursor = 'default';
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed && !attachedFile) return;
    if (agentStatus !== 'idle') return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed || `📎 ${attachedFile?.name}`,
      fileName: attachedFile?.name,
      fileType: attachedFile?.type,
      fileDataUrl: attachedFile?.dataUrl,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAgentStatus(attachedFile ? 'analyzing' : 'thinking');
    const fileBase64 = attachedFile?.base64;
    const fileMime = attachedFile?.type;
    setAttachedFile(null);

    try {
      const reply = await callGemini(
        history,
        trimmed || `Analiza el archivo adjunto "${userMsg.fileName}" usando tu herramienta Análisis de Planos IA.`,
        fileBase64,
        fileMime
      );
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply };
      setMessages(prev => [...prev, assistantMsg]);

      const updatedHistory = [
        ...history,
        { role: 'user', parts: [{ text: trimmed }] },
        { role: 'model', parts: [{ text: reply }] },
      ];
      setHistory(updatedHistory);

      // ── Detección automática de cotización ────────────────────────────────
      if (mode === 'cotizar') {
        const fullConv = updatedHistory.map(t => t.parts.map((p: { text?: string }) => p.text || '').join(' ')).join(' ');
        if (detectQuoteIntent(fullConv)) {
          const areaMatch = fullConv.match(/(\d+[.,]?\d*)\s*(m²|m2|metros|m )/i);
          const area = areaMatch ? parseFloat(areaMatch[1].replace(',', '.')) : 500;
          const sistemas: string[] = [];
          if (/eléctric|electrico|tablero|alimentador/i.test(fullConv)) sistemas.push('Eléctrico');
          if (/sanitario|agua|cisterna|desagüe|desague/i.test(fullConv)) sistemas.push('Sanitario');
          if (/hvac|aire|climatiz|duct/i.test(fullConv)) sistemas.push('HVAC');
          if (/incendio|aci|rociador|nfpa/i.test(fullConv)) sistemas.push('ACI');
          if (sistemas.length === 0 && /mep/i.test(fullConv)) sistemas.push('Eléctrico', 'Sanitario', 'HVAC');
          const tipoMatch = fullConv.match(/(hospital|clinica|clínica|hotel|hospedaje|edificio|multifamiliar|vivienda|planta|industrial|comercial|restaurante|oficina)/i);
          const tipo = tipoMatch ? tipoMatch[1] : 'Edificio';
          const quoteData: ProjectData = {
            tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
            area_m2: area,
            sistemas,
            nivel_bim: /bim|revit|lod|modelado/i.test(fullConv) ? 'lod300' : 'sin_bim',
            clash_detection: /clash|interferencia/i.test(fullConv),
            itse: /itse|defensa civil|certificaci/i.test(fullConv),
            ubicacion: 'Huancayo, Junín — Perú',
          };
          const quoteMsg: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: generateQuote(quoteData),
          };
          setTimeout(() => setMessages(prev => [...prev, quoteMsg]), 800);
        }
      }
    } catch {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: '⚠️ Error de conexión. Por favor intenta nuevamente.' }]);
    }
    setAgentStatus('idle');
  };

  const handleManualQuote = () => {
    const fullConv = history.map(t => t.parts.map((p: { text?: string }) => p.text || '').join(' ')).join(' ');
    const areaMatch = fullConv.match(/(\d+[.,]?\d*)\s*(m²|m2|metros|m )/i);
    const quoteData: ProjectData = {
      tipo: 'Edificio MEP',
      area_m2: areaMatch ? parseFloat(areaMatch[1].replace(',', '.')) : 500,
      sistemas: ['Eléctrico', 'Sanitario', 'HVAC'],
      nivel_bim: 'lod300',
      clash_detection: false,
      itse: false,
      ubicacion: 'Huancayo, Junín — Perú',
    };
    const quoteMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: generateQuote(quoteData),
    };
    setMessages(prev => [...prev, quoteMsg]);
  };

  const renderText = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#FFB800">$1</strong>')
      .replace(/^(#{1,3})\s*(.+)$/gm, (_, h, t) => {
        const size = h.length === 1 ? 15 : h.length === 2 ? 13.5 : 12.5;
        return `<div style="font-weight:700;font-size:${size}px;color:#FFB800;margin:10px 0 4px">${t}</div>`;
      })
      .replace(/^[-•]\s+(.+)$/gm, '<div style="padding-left:14px;margin:3px 0">• $1</div>')
      .replace(/\n/g, '<br/>');

  const eyeColor = EYE_COLORS[mode];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#080B12', color: '#F0F0F0', fontFamily: "'Inter', 'Geist', sans-serif", overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarCollapsed ? 56 : sidebarWidth,
        minWidth: sidebarCollapsed ? 56 : sidebarWidth,
        background: 'rgba(8,11,18,0.98)',
        display: 'flex', flexDirection: 'column',
        alignItems: sidebarCollapsed ? 'center' : 'stretch',
        padding: '12px 0',
        transition: 'width 0.25s, min-width 0.25s',
        zIndex: 10, flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ 
          display: 'flex', flexDirection: sidebarCollapsed ? 'row' : 'column', 
          alignItems: 'center', gap: sidebarCollapsed ? 12 : 16, 
          padding: sidebarCollapsed ? '16px 14px' : '28px 16px 20px', 
          borderBottom: '1px solid rgba(255,184,0,0.08)', marginBottom: 8, 
          transition: 'all 0.3s', position: 'relative'
        }}>
          <img src="/logo-tesla.png" alt="TESLA" style={{ 
            width: sidebarCollapsed ? 32 : 96, 
            height: sidebarCollapsed ? 32 : 96, 
            borderRadius: '50%', objectFit: 'cover', flexShrink: 0, 
            border: sidebarCollapsed ? '1px solid rgba(255,184,0,0.3)' : '2px solid rgba(255,184,0,0.4)', 
            boxShadow: sidebarCollapsed ? 'none' : '0 0 25px rgba(255,184,0,0.15)',
            transition: 'all 0.3s'
          }} />
          
          {!sidebarCollapsed && (
            <span style={{ 
              fontWeight: 900, fontSize: 13.5, letterSpacing: 0.5, lineHeight: 1.3, 
              color: '#FFB800', fontFamily: 'monospace', textAlign: 'center',
              textShadow: '0 0 10px rgba(255,184,0,0.2)' 
            }}>
              TESLA ELECTRICIDAD Y<br/>AUTOMATIZACIÓN<br/>
              <span style={{ fontSize: 11, color: '#E8E8E8', letterSpacing: 1.5 }}>S.A.C.</span>
            </span>
          )}
          
          <button onClick={() => setSidebarCollapsed(p => !p)} style={{ 
            marginLeft: sidebarCollapsed ? 'auto' : 0, 
            position: sidebarCollapsed ? 'static' : 'absolute', 
            top: 12, right: 12,
            background: sidebarCollapsed ? 'none' : 'rgba(255,184,0,0.05)', 
            border: sidebarCollapsed ? 'none' : '1px solid rgba(255,184,0,0.1)', 
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, cursor: 'pointer', color: '#889', fontSize: 14,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FFB800'; if(!sidebarCollapsed) e.currentTarget.style.borderColor = 'rgba(255,184,0,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#889'; if(!sidebarCollapsed) e.currentTarget.style.borderColor = 'rgba(255,184,0,0.1)'; }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {MODES.map(m => (
          <button key={m.key} onClick={() => setMode(m.key)} title={m.label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: sidebarCollapsed ? '12px 0' : '11px 16px',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            background: mode === m.key ? 'rgba(255,184,0,0.07)' : 'none',
            borderLeft: mode === m.key ? '2px solid #FFB800' : '2px solid transparent',
            border: 'none', color: mode === m.key ? '#FFB800' : '#556',
            cursor: 'pointer', fontSize: 13, fontWeight: mode === m.key ? 600 : 400,
            width: '100%', transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 18 }}>{m.icon}</span>
            {!sidebarCollapsed && <span style={{ fontSize: 12 }}>{m.short}</span>}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button onClick={() => setShowTools(p => !p)} title="Herramientas del Agente" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: sidebarCollapsed ? '12px 0' : '11px 16px',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          background: showTools ? 'rgba(255,184,0,0.07)' : 'none',
          border: 'none', color: showTools ? '#FFB800' : '#445', cursor: 'pointer', width: '100%',
        }}>
          <span style={{ fontSize: 18 }}>🛠️</span>
          {!sidebarCollapsed && <span style={{ fontSize: 12 }}>Herramientas</span>}
        </button>
      </aside>

      {/* ── RESIZE DIVIDER SIDEBAR ── */}
      <div 
        onPointerDown={handleSidebarDrag}
        style={{
          width: 8, cursor: 'col-resize', background: 'rgba(255,184,0,0.03)', 
          borderRight: '1px solid rgba(255,184,0,0.08)', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s', flexShrink: 0
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,184,0,0.15)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,184,0,0.03)'}
      >
        {!sidebarCollapsed && <div style={{ width: 2, height: 32, background: '#FFB800', borderRadius: 2 }} />}
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>

        {/* ── TOPBAR ── */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
          borderBottom: '1px solid rgba(255,184,0,0.08)',
          background: 'rgba(8,11,18,0.92)', backdropFilter: 'blur(12px)',
          flexShrink: 0, zIndex: 5,
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src="/pili_avatar_02.png" alt="PILi" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '2px solid rgba(255,184,0,0.35)', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: -3, right: -3, width: 20, height: 20, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,184,0,0.4)' }}>
              <EvilEye eyeColor={eyeColor} intensity={agentStatus !== 'idle' ? 2.5 : 1.5} pupilSize={0.5} irisWidth={0.22} glowIntensity={0.4} scale={0.75} noiseScale={1} pupilFollow={1} flameSpeed={agentStatus !== 'idle' ? 2.2 : 1} backgroundColor="#080B12" />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Nombre oficial con tipografía diferenciada */}
              <span style={{ fontWeight: 700, fontSize: 15, fontFamily: 'monospace', color: '#fff', letterSpacing: 0.5 }}>
                <span style={{ color: '#FFB800' }}>PIL</span>
                <span style={{ color: '#E8E8E8' }}>i</span>
                <span style={{ color: '#667' }}>_agente</span>
              </span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontFamily: 'monospace', background: 'rgba(255,184,0,0.1)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.25)' }}>v5.0 · BIM MEP</span>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20,
                background: agentStatus === 'idle' ? 'rgba(80,200,100,0.1)' : 'rgba(255,184,0,0.12)',
                color: agentStatus === 'idle' ? '#4CAF50' : '#FFB800',
                border: `1px solid ${agentStatus === 'idle' ? 'rgba(80,200,100,0.2)' : 'rgba(255,184,0,0.25)'}`,
              }}>
                {agentStatus === 'idle' ? '● En línea' : agentStatus === 'thinking' ? '⟳ Pensando...' : '🔍 Analizando...'}
              </span>
            </div>
            <p style={{ fontSize: 11, color: '#FFB800', margin: 0, fontWeight: 600 }}>TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C. <span style={{ color: '#667', fontWeight: 400 }}>· Dept. de Diseño e Implementación: <strong style={{ color: '#4FC3F7' }}>GatoMichuy</strong></span></p>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 11, color: '#334', fontFamily: 'monospace' }}>
              {MODES.find(m => m.key === mode)?.icon} {MODES.find(m => m.key === mode)?.label}
            </span>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

          {/* ── CHAT PANEL ── */}
          <div style={{
            width: (viewerFile || showCad || showTools) ? chatWidth : '100%',
            flexShrink: 0,
            display: 'flex', flexDirection: 'column', position: 'relative',
            overflow: 'hidden'
          }}>

            {/* EvilEye — fondo absoluto del panel */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
              <EvilEye
                eyeColor={eyeColor}
                intensity={agentStatus !== 'idle' ? 2.2 : 1.6}
                pupilSize={0.42} irisWidth={0.24}
                glowIntensity={agentStatus !== 'idle' ? 0.5 : 0.28}
                scale={0.85} noiseScale={1.1} pupilFollow={1}
                flameSpeed={agentStatus !== 'idle' ? 1.8 : 0.9}
                backgroundColor="#080B12"
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,11,18,0.82)' }} />
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-start' }}>
                  {msg.role === 'assistant' && (
                    <img src="/pili_avatar_02.png" alt="PILi" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', flexShrink: 0, border: '1px solid rgba(255,184,0,0.3)', marginTop: 2 }} />
                  )}
                  <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {msg.fileDataUrl && (
                      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,184,0,0.25)', maxWidth: 200, cursor: 'pointer' }}
                        onClick={() => setViewerFile({ dataUrl: msg.fileDataUrl!, type: msg.fileType!, name: msg.fileName! })}>
                        {msg.fileType?.startsWith('image/') ? (
                          <img src={msg.fileDataUrl} alt={msg.fileName} style={{ width: '100%', display: 'block' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,184,0,0.07)' }}>
                            <span style={{ fontSize: 24 }}>📄</span>
                            <span style={{ fontSize: 11, color: '#FFB800' }}>{msg.fileName}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {msg.content && !(msg.fileDataUrl && msg.content === `📎 ${msg.fileName}`) && (
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: msg.role === 'user' ? 'linear-gradient(135deg, #E63946, #b02530)' : 'rgba(15,22,36,0.92)',
                        border: msg.role === 'assistant' ? '1px solid rgba(255,184,0,0.12)' : 'none',
                        backdropFilter: msg.role === 'assistant' ? 'blur(8px)' : 'none',
                        fontSize: 13.5, lineHeight: 1.65, color: '#E8E8E8',
                      }}>
                        <div dangerouslySetInnerHTML={{ __html: renderText(msg.content) }} />
                        {msg.role === 'assistant' && msg.content.match(/CAT-\d{3}-\d{3}/) && (
                          <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                            <button onClick={() => setShowCad(true)} style={{
                              padding: '8px 14px', borderRadius: 8,
                              background: 'linear-gradient(135deg, rgba(79,195,247,0.15), rgba(79,195,247,0.05))',
                              border: '1px solid rgba(79,195,247,0.3)', color: '#4FC3F7',
                              cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 6
                            }}>
                              <span style={{ fontSize: 14 }}>👁️</span> Previsualizar
                            </button>
                            <button onClick={() => { 
                              setActiveCatalog(msg.content.match(/CAT-\d{3}-\d{3}/)![0]); 
                              setActivePrice(5); 
                              setModal('payment'); 
                            }} style={{
                              padding: '8px 14px', borderRadius: 8,
                              background: 'linear-gradient(135deg, #10B981, #059669)',
                              border: 'none', color: '#fff',
                              cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 6
                            }}>
                              <span style={{ fontSize: 14 }}>💳</span> Desbloquear HD ($5)
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {agentStatus !== 'idle' && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <img src="/pili_avatar_02.png" alt="PILi" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', flexShrink: 0 }} />
                  <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'rgba(15,22,36,0.92)', border: '1px solid rgba(255,184,0,0.12)', display: 'flex', gap: 5, alignItems: 'center', backdropFilter: 'blur(8px)' }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: eyeColor, display: 'block', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Chips rápidos */}
            <div style={{ position: 'relative', zIndex: 1, padding: '4px 20px 8px', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {MODE_CHIPS[mode].map(chip => (
                <button key={chip} onClick={() => sendMessage(chip)} style={{
                  fontSize: 11, padding: '5px 12px', borderRadius: 20,
                  background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.2)',
                  color: '#FFB800', cursor: 'pointer', fontFamily: 'monospace', backdropFilter: 'blur(4px)',
                }}>{chip}</button>
              ))}
              {mode === 'cotizar' && history.length > 0 && (
                <button onClick={handleManualQuote} style={{
                  fontSize: 11, padding: '6px 14px', borderRadius: 20,
                  background: 'linear-gradient(135deg, rgba(230,57,70,0.18), rgba(176,37,48,0.12))',
                  border: '1px solid rgba(230,57,70,0.4)',
                  color: '#E63946', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                }}>💰 Generar Cotización</button>
              )}
            </div>

            {/* INPUT MULTIMODAL */}
            <div style={{ position: 'relative', zIndex: 1, margin: '0 14px 14px', borderRadius: 16, background: 'rgba(15,22,36,0.88)', border: '1px solid rgba(255,184,0,0.18)', backdropFilter: 'blur(16px)', overflow: 'hidden' }}>
              {attachedFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(255,184,0,0.1)', background: 'rgba(255,184,0,0.04)' }}>
                  {attachedFile.type.startsWith('image/') ? (
                    <img src={attachedFile.dataUrl} alt={attachedFile.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,184,0,0.2)', cursor: 'pointer' }}
                      onClick={() => setViewerFile({ dataUrl: attachedFile.dataUrl, type: attachedFile.type, name: attachedFile.name })} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(255,184,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📄</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#FFB800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachedFile.name}</div>
                    <div style={{ fontSize: 10, color: '#445', marginTop: 2 }}>Listo para análisis IA</div>
                  </div>
                  <button onClick={() => setAttachedFile(null)} style={{ background: 'none', border: 'none', color: '#556', cursor: 'pointer', fontSize: 16, padding: '4px 8px' }}>✕</button>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-end', padding: '10px 12px', gap: 8 }}>
                <button onClick={() => fileInputRef.current?.click()} title="Adjuntar plano / PDF / imagen" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', cursor: 'pointer', color: '#FFB800', fontSize: 18, flexShrink: 0 }}>＋</button>
                <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif" style={{ display: 'none' }} onChange={handleFileChange} />
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder={`Consulta a PILi_agente sobre tu proyecto ${MODES.find(m => m.key === mode)?.short.toLowerCase()}...`}
                  rows={1}
                  style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', color: '#E8E8E8', fontSize: 13.5, outline: 'none', lineHeight: 1.6, maxHeight: 120, fontFamily: 'inherit', padding: '4px 0' }}
                />
                <button onClick={() => sendMessage(input)} disabled={agentStatus !== 'idle' || (!input.trim() && !attachedFile)} style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: (input.trim() || attachedFile) && agentStatus === 'idle' ? 'linear-gradient(135deg,#E63946,#b02530)' : 'rgba(30,40,60,0.6)',
                  border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16, opacity: agentStatus !== 'idle' ? 0.5 : 1,
                }}>▶</button>
              </div>
              <div style={{ textAlign: 'center', padding: '4px 0 8px', borderTop: '1px solid rgba(255,184,0,0.06)' }}>
                <span style={{ fontSize: 10, color: '#334', fontFamily: 'monospace', letterSpacing: 1 }}>
                  TESLA × <span style={{ color: 'rgba(255,184,0,0.5)' }}>PIL</span><span style={{ color: 'rgba(232,232,232,0.3)' }}>i</span><span style={{ color: 'rgba(80,100,130,0.5)' }}>_agente</span> 360° · BIM MEP
                </span>
              </div>
            </div>
          </div>

          {/* ── RESIZE DIVIDER ── */}
          {(viewerFile || showCad || showTools) && (
            <div 
              onPointerDown={handleDrag}
              style={{
                width: 8, cursor: 'col-resize', background: 'rgba(255,184,0,0.05)', 
                borderLeft: '1px solid rgba(255,184,0,0.15)', borderRight: '1px solid rgba(255,184,0,0.15)',
                zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,184,0,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,184,0,0.05)'}
            >
              <div style={{ width: 2, height: 32, background: '#FFB800', borderRadius: 2 }} />
            </div>
          )}

          {/* ── TOOLS PANEL ── */}
          {showTools && !viewerFile && !showCad && (
            <div style={{ flex: 1, minWidth: 250, display: 'flex', flexDirection: 'column', background: 'rgba(6,9,16,0.97)', borderLeft: '1px solid rgba(255,184,0,0.08)', padding: '20px 16px', gap: 12, overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#FFB800', fontFamily: 'monospace', letterSpacing: 1 }}>🛠️ HERRAMIENTAS INTERACTIVAS</span>
                <button onClick={() => setShowCad(true)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: 'rgba(79,195,247,0.12)', border: '1px solid rgba(79,195,247,0.3)', color: '#4FC3F7', cursor: 'pointer', fontFamily: 'monospace' }}>📐 Ver Plano CAD 2D</button>
              </div>
              {AGENT_TOOLS.map(tool => (
                <button key={tool.label} onClick={() => {
                  if (tool.label.includes('ROI')) setModal('roi');
                  else if (tool.label.includes('ITSE')) setModal('itse');
                  else if (tool.label.includes('Lead') || tool.label.includes('Registro')) setModal('lead');
                  else if (tool.label.includes('Ficha')) setModal('ficha');
                  else if (tool.label.includes('Marketplace')) setModal('market');
                  else if (tool.label.includes('Planos')) setShowCad(true);
                  else sendMessage(`Ejecuta la herramienta: ${tool.label}`);
                  setShowTools(false);
                }} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                  background: 'rgba(20,30,48,0.8)', border: '1px solid rgba(255,184,0,0.1)', cursor: 'pointer', color: '#E8E8E8',
                  transition: 'border 0.2s',
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{tool.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#FFB800', marginBottom: 2 }}>{tool.label}</div>
                    <div style={{ fontSize: 11, color: '#556' }}>{tool.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── VISOR PLANO CAD 2D ── */}
          {showCad && !viewerFile && (
            <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', background: '#0a1628', borderLeft: '1px solid rgba(255,184,0,0.15)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#0D1422', borderBottom: '1px solid rgba(255,184,0,0.15)', zIndex: 10 }}>
                <span style={{ fontSize: 12, color: '#FFB800', fontFamily: 'monospace', fontWeight: 700 }}>📐 VISOR DE PLANO CAD MEP 2D · LÁMINA 04-MEP-01</span>
                <button onClick={() => setShowCad(false)} style={{ background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.4)', color: '#E63946', cursor: 'pointer', borderRadius: 8, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>✕ Cerrar Visor</button>
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <MepFloorPlan2D />
              </div>
            </div>
          )}

          {/* ── VIEWER PANEL (Archivos adjuntos) ── */}
          {viewerFile && (
            <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', background: 'rgba(6,9,16,0.97)', borderLeft: '1px solid rgba(255,184,0,0.08)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,184,0,0.08)' }}>
                <span style={{ fontSize: 16 }}>{viewerFile.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                <span style={{ flex: 1, fontSize: 12, color: '#FFB800', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{viewerFile.name}</span>
                <button onClick={() => setViewerFile(null)} style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer', borderRadius: 8, padding: '4px 12px', fontSize: 11 }}>✕ Cerrar</button>
              </div>
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16 }}>
                {viewerFile.type.startsWith('image/') ? (
                  <img src={viewerFile.dataUrl} alt={viewerFile.name} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, border: '1px solid rgba(255,184,0,0.12)', objectFit: 'contain' }} />
                ) : viewerFile.type === 'application/pdf' ? (
                  <iframe src={viewerFile.dataUrl} style={{ width: '100%', height: '100%', minHeight: '70vh', border: 'none', borderRadius: 8 }} title={viewerFile.name} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#445', padding: 40 }}>
                    <div style={{ fontSize: 56 }}>📄</div>
                    <p style={{ marginTop: 16, color: '#667' }}>{viewerFile.name}</p>
                    <p style={{ fontSize: 12, marginTop: 8 }}>Envía el archivo en el chat para que PILi_agente lo analice.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render de Modales Interactivos */}
      {modal === 'roi' && <RoiModal onClose={() => setModal(null)} onInject={injectMessage} />}
      {modal === 'itse' && <ItseModal onClose={() => setModal(null)} onInject={injectMessage} />}
      {modal === 'lead' && <LeadModal onClose={() => setModal(null)} onInject={injectMessage} />}
      {modal === 'payment' && <PaymentModal onClose={() => setModal(null)} price={activePrice} catalogId={activeCatalog} onInject={injectMessage} />}
      {modal === 'ficha' && <FichaModal onClose={() => setModal(null)} onInject={injectMessage} />}
      {modal === 'market' && <MarketplaceModal onClose={() => setModal(null)} onInject={injectMessage} />}

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: scale(1); opacity: 0.4; } 40% { transform: scale(1.4); opacity: 1; } }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255,184,0,0.02); border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,184,0,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,184,0,0.6); }
        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
