import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from '@google/genai';

// ─────────────────────────────────────────────────────────
// PILI 2.0 — Especialista BIM/MEP — TESLA Electricidad S.A.C.
// Motor: Gemini Flash | Estrategia: guía activa + retorno al tema
// ─────────────────────────────────────────────────────────

const PILI_SYSTEM_PROMPT = `Eres PILI AGENTE 360°, la Agente Ejecutiva Senior de Ingeniería y Desarrollo BIM MEP en TESLA Electricidad y Automatización S.A.C. (Huancayo, Perú). No eres un simple chatbot, eres una arquitecta e ingeniera virtual de nivel consultora disponible 24/7.

## TUS 3 PERFILES DE ATENCIÓN MULTI-AGENTE:

### PERFIL 1: CLIENTES, ARQUITECTOS Y CONSTRUCTORAS (Busca contratar servicios)
- **Tu rol**: Asesora Comercial & Técnica Senior.
- **Acción**: Identifica si es hospital, edificación, industria o vivienda. Pregunta los m² y sistemas MEP requeridos (Eléctrico, Sanitario, HVAC, ACI).
- **Cierre**: Ofrécele una propuesta técnica previa y solicita su WhatsApp y nombre para que el equipo de proyectos le envíe el presupuesto en menos de 24 horas.

### PERFIL 2: FREELANCERS & DISEÑADORES REVIT / MEP (Busca proyectos / trabajo)
- **Tu rol**: Coordinadora de Talento BIM TESLA.
- **Acción**: Guíalo sobre cómo funciona nuestro Marketplace Freelance TESLA.
- **Calificación**: Pregúntale su nivel de Revit (LOD 300 / 400), especialidad (Eléctrica, Sanitaria, HVAC) y años de experiencia.
- **Cierre**: Pídele su portafolio en PDF / Drive y su WhatsApp para registrarlo en la bolsa de proyectos freelance de TESLA.

### PERFIL 3: USUARIOS CON PLANOS / BOSQUEJOS (Busca pre-auditoría o cotización directa)
- **Tu rol**: Auditing Engine & Visor Técnico.
- **Acción**: Invítalos a subir sus archivos (AutoCAD .dwg, PDF, imágenes o croquis a mano) mediante el botón de adjuntar archivo en el chat.
- **Respuesta**: Procesa el tipo de archivo, promételes un informe de detección de interferencias y metrados preliminar por TESLA.

## TU PERSONALIDAD & ESTILO:
- Inteligente, ejecutiva, empática y altamente estructurada.
- Si el usuario te habla de cualquier tema ajeno a construcción/ingeniería/BIM, responde brevemente con cortesía y re-orienta suavemente hacia sus necesidades de proyectos.
- Sé concisa: respuestas de máximo 2 a 3 párrafos, usando negritas para conceptos clave y formato impecable.`;

// Quick reply chips por perfil
const QUICK_REPLIES_INITIAL = [
  '🏗️ Soy Constructora / Arquitecto (Cotizar)',
  '📐 Soy Freelancer Revit (Buscar trabajo)',
  '📁 Tengo un Plano / Croquis (Analizar)',
  '⚡ ¿Qué servicios MEP ofrece TESLA?',
];

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LeadData {
  nombre?: string;
  telefono?: string;
  proyecto?: string;
  sistemas?: string;
  fase?: string;
  metros?: string;
}

// ─────────────────────────────────────────────────────────
// Gemini client — usa la clave del entorno
// ─────────────────────────────────────────────────────────
function getGenAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// ─────────────────────────────────────────────────────────
// Extract lead data from conversation (simple heuristic)
// ─────────────────────────────────────────────────────────
function extractLeadData(messages: Message[]): LeadData {
  const fullText = messages.map(m => m.content).join(' ').toLowerCase();
  const lead: LeadData = {};

  // Phone pattern Peru
  const phoneMatch = fullText.match(/\b9\d{8}\b/);
  if (phoneMatch) lead.telefono = phoneMatch[0];

  // Project size
  const m2Match = fullText.match(/(\d[\d.,]*)\s*m[²2]/i);
  if (m2Match) lead.metros = m2Match[1];

  return lead;
}

// ─────────────────────────────────────────────────────────
// Main PiliChat Component
// ─────────────────────────────────────────────────────────
export default function PiliChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; parts: Array<{ text: string }> }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendWelcome();
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const msg: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const sendWelcome = async () => {
    setIsLoading(true);
    try {
      const genAI = getGenAI();
      if (!genAI) {
        addMessage('assistant', `¡Hola! Soy **PILI**, la especialista BIM MEP de TESLA Electricidad y Automatización S.A.C. 👷‍♀️\n\nTe ayudo a coordinar los sistemas de instalaciones de tu proyecto — eléctrico, sanitario, HVAC y más.\n\n¿En qué tipo de proyecto estoy trabajando contigo hoy?`);
        setIsLoading(false);
        return;
      }

      const chat = genAI.chats.create({
        model: 'gemini-2.0-flash',
        config: { systemInstruction: PILI_SYSTEM_PROMPT },
        history: [],
      });

      const welcomePrompt = 'Saluda al cliente de manera profesional y técnica. Preséntate brevemente y pregunta sobre su proyecto BIM MEP. Sé concisa (máximo 4 líneas).';
      const response = await chat.sendMessage({ message: welcomePrompt });
      const text = response.text ?? '';

      addMessage('assistant', text);
      setConversationHistory([
        { role: 'user', parts: [{ text: welcomePrompt }] },
        { role: 'model', parts: [{ text }] },
      ]);
    } catch {
      addMessage('assistant', `¡Hola! Soy **PILI**, especialista BIM MEP de TESLA. ¿Cuéntame sobre tu proyecto — qué sistemas necesitas coordinar?`);
    }
    setIsLoading(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setShowQuickReplies(false);
    addMessage('user', text);
    setInput('');
    setIsLoading(true);

    try {
      // Llamada REST directa a Gemini (evita fallos de cliente SDK en Vite)
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey.includes('TU_CLAVE')) {
        addMessage('assistant', `Hola, soy **PILI** 👷‍♀️. Para activar mis respuestas completas con IA, necesitas agregar tu API Key de Gemini en el archivo \`.env.local\`.\n\nPor ahora puedo responderte dudas básicas: **BIM MEP** es la coordinación 3D de instalaciones eléctricas, sanitarias y HVAC.`);
        setIsLoading(false);
        return;
      }

      // Preparar historial en formato REST de Gemini
      const contents = [
        {
          role: 'user',
          parts: [{ text: PILI_SYSTEM_PROMPT + "\n\nEntendido. Asume el rol de PILI inmediatamente." }]
        },
        {
          role: 'model',
          parts: [{ text: "Entendido, soy PILI, la especialista técnica BIM MEP de TESLA. Estoy lista para atender al cliente." }]
        },
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text }]
        }
      ];

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      const data = await res.json();
      if (data.error) {
        console.error('[PILI REST Error]', data.error);
        addMessage('assistant', `Ocurrió un detalle con la clave de Gemini: ${data.error.message}. Por favor revisa la clave en .env.local.`);
        setIsLoading(false);
        return;
      }

      const assistantText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude procesar la respuesta. ¿Me repites tu duda sobre BIM MEP?';

      addMessage('assistant', assistantText);
      setConversationHistory([
        ...conversationHistory,
        { role: 'user', parts: [{ text }] },
        { role: 'model', parts: [{ text: assistantText }] },
      ]);

      // Auto-detect if lead is complete (has phone number in conversation)
      const allMessages = [...messages, { role: 'user', content: text } as Message];
      const lead = extractLeadData(allMessages);
      if (lead.telefono && allMessages.length > 6) {
        // Lead captured — could save to Supabase here
        console.log('[PILI] Lead detected:', lead);
      }
    } catch (err) {
      console.error('[PILI] Error:', err);
      addMessage('assistant', 'Disculpa, tuve un problema técnico. ¿Puedes repetir tu consulta sobre el proyecto BIM MEP?');
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ─── Render ───────────────────────────────────────────
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #E63946, #b02530)',
          boxShadow: '0 0 24px rgba(230,57,70,0.5), 0 4px 16px rgba(0,0,0,0.4)',
        }}
        aria-label="Abrir chat PILI"
      >
        {isOpen ? (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {/* Pulse indicator */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFB800] animate-pulse border-2 border-[#0b0f17]" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: '380px',
            height: '560px',
            background: 'rgba(8, 13, 22, 0.97)',
            border: '1px solid rgba(255,184,0,0.25)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 40px rgba(0,0,0,0.6), 0 0 16px rgba(255,184,0,0.1)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{
              background: 'linear-gradient(90deg, rgba(20,30,48,0.98), rgba(10,16,28,0.98))',
              borderBottom: '1px solid rgba(255,184,0,0.15)',
            }}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #E63946, #b02530)', color: 'white' }}
            >
              P
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm font-mono tracking-wide">PILI</span>
                <span
                  className="text-[10px] px-2 py-px rounded-full font-mono uppercase tracking-widest"
                  style={{ background: 'rgba(255,184,0,0.12)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.3)' }}
                >
                  BIM MEP
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Especialista TESLA · En línea</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1E293B transparent' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-sm'
                      : 'text-gray-200 rounded-bl-sm'
                  }`}
                  style={
                    msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, #E63946, #c0304a)' }
                      : { background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,184,0,0.12)' }
                  }
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#FFB800">$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-xl rounded-bl-sm flex gap-1.5 items-center"
                  style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,184,0,0.12)' }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#FFB800] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {showQuickReplies && messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
              {QUICK_REPLIES_INITIAL.map(reply => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="text-[11px] px-3 py-1.5 rounded-full transition-all hover:scale-105 font-mono"
                  style={{
                    background: 'rgba(255,184,0,0.08)',
                    border: '1px solid rgba(255,184,0,0.3)',
                    color: '#FFB800',
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div
            className="px-3 py-3 shrink-0 flex gap-2 items-end"
            style={{ borderTop: '1px solid rgba(255,184,0,0.12)', background: 'rgba(8,13,22,0.8)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta BIM/MEP..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 outline-none leading-relaxed py-2"
              style={{
                maxHeight: '80px',
                fontSize: '13px',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: input.trim() ? 'linear-gradient(135deg, #E63946, #b02530)' : 'rgba(30,41,59,0.6)' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Footer branding */}
          <div className="text-center py-1 shrink-0" style={{ borderTop: '1px solid rgba(255,184,0,0.08)' }}>
            <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">TESLA × PILI 2.0 · BIM MEP</span>
          </div>
        </div>
      )}
    </>
  );
}
