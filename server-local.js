// Simple Local Server for Testing PILI (V4 - Conversion Flow)
// Run with: node server-local.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

const sessions = new Map();

// PILI V4 States
const STATES = {
    START: 'START',
    ASK_PROJECT_TYPE: 'ASK_PROJECT_TYPE',
    ASK_STAGE: 'ASK_STAGE',
    ASK_NEED: 'ASK_NEED',           // New: Problem-centric
    VALIDATION: 'VALIDATION',       // New: Explicit Reassurance
    ASK_NAME: 'ASK_NAME',
    ASK_PHONE: 'ASK_PHONE',
    ASK_LOCATION: 'ASK_LOCATION',   // New: Instead of Email
    ASK_APPOINTMENT: 'ASK_APPOINTMENT',
    CONFIRM: 'CONFIRM',
    END: 'END'
};

// Valid Options Configuration
const OPTIONS = {
    PROJECT_TYPE: [
        "🏗️ Obra en ejecución",
        "🏢 Proyecto nuevo",
        "🔧 Mantenimiento / Remodelación"
    ],
    STAGE: [
        "Inicio / Planos",
        "En ejecución / Casco",
        "Etapa final / Cierre"
    ],
    NEED: [
        "⚡ Electricidad",
        "🚨 Sistemas contra incendios",
        "🤖 Automatización / Domótica",
        "🔐 Seguridad electrónica",
        "🏗️ Acabados técnicos",
        "🧩 Solución integral TESLA"
    ]
};

// Helper: Format WhatsApp message (V4 Structure)
function generateWhatsAppLink(session) {
    // Direct emoji literals for WhatsApp compatibility
    const text = `🔔 *SOLICITUD PILi V4* 🔔
    
👤 *Cliente:* ${session.nombre || '-'}
📱 *WhatsApp:* ${session.telefono || '-'}
📍 *Ubicación:* ${session.ubicacion || '-'}

🏗️ *Proyecto:* ${session.tipo_proyecto || '-'}
📊 *Etapa:* ${session.etapa || '-'}
🛠️ *Necesidad:* ${session.necesidad || '-'}

📅 *Cita:* ${session.cita || 'Por coordinar'}

Link autogenerado por PILi Chat.`;

    return `https://api.whatsapp.com/send?phone=51906315961&text=${encodeURIComponent(text)}`;
}

// Helper: Validation
function isValidOption(input, options) {
    if (!options || !Array.isArray(options)) return true;
    const normalizedInput = input.trim().toLowerCase();
    return options.some(opt => opt.toLowerCase().includes(normalizedInput) || normalizedInput.includes(opt.toLowerCase())); // Loose matching for emojis
}

// PILI V4 Brain
function processMessage(session, message) {
    const state = session.estado || STATES.START;
    const msg = message ? message.toString().trim() : "";

    switch (state) {
        // --- 1. START ---
        case STATES.START:
            return {
                message: "¡Hola! Soy PILi, asistente técnica de TESLA Electricidad y Automatización. ⚡\\n\\nTe ayudo a identificar la mejor solución para tu proyecto y a coordinar una evaluación técnica.\\n\\nPara empezar, selecciona el tipo de proyecto:",
                nextState: STATES.ASK_PROJECT_TYPE,
                options: OPTIONS.PROJECT_TYPE
            };

        // --- 2. ASK_PROJECT_TYPE ---
        case STATES.ASK_PROJECT_TYPE:
            if (!isValidOption(msg, OPTIONS.PROJECT_TYPE)) {
                return {
                    message: "Por favor, selecciona una opción del menú.",
                    nextState: STATES.ASK_PROJECT_TYPE,
                    options: OPTIONS.PROJECT_TYPE
                };
            }
            session.tipo_proyecto = msg;
            return {
                message: "Perfecto.\\n\\n¿En qué etapa se encuentra actualmente?",
                nextState: STATES.ASK_STAGE,
                options: OPTIONS.STAGE
            };

        // --- 3. ASK_STAGE ---
        case STATES.ASK_STAGE:
            if (!isValidOption(msg, OPTIONS.STAGE)) {
                return {
                    message: "Por favor, selecciona una opción del menú.",
                    nextState: STATES.ASK_STAGE,
                    options: OPTIONS.STAGE
                };
            }
            session.etapa = msg;
            return {
                message: "Entendido.\\n\\n¿Qué necesitas resolver principalmente ahora? 👇",
                nextState: STATES.ASK_NEED,
                options: OPTIONS.NEED
            };

        // --- 4. ASK_NEED ---
        case STATES.ASK_NEED:
            if (!isValidOption(msg, OPTIONS.NEED)) {
                return {
                    message: "Por favor, selecciona una opción del menú.",
                    nextState: STATES.ASK_NEED,
                    options: OPTIONS.NEED
                };
            }
            session.necesidad = msg;
            return {
                message: `Perfecto.\\nProyecto en *${session.etapa}* con necesidad de *${session.necesidad}*. Entendido.\\n\\nPara coordinar la evaluación técnica, indícame tu *Nombre Completo*:`,
                nextState: STATES.ASK_NAME
            };

        // --- 5. ASK_NAME ---
        case STATES.ASK_NAME:
            if (!msg || msg.length < 3) {
                return {
                    message: "Por favor, ingresa tu nombre completo.",
                    nextState: STATES.ASK_NAME
                };
            }
            session.nombre = msg;
            return {
                message: `Gracias ${msg}.\\n\\n¿Cuál es tu número de *WhatsApp*? (para confirmación de evaluación técnica)`,
                nextState: STATES.ASK_PHONE
            };

        // --- 6. ASK_PHONE ---
        case STATES.ASK_PHONE:
            if (!msg || msg.length < 9) {
                return {
                    message: "Por favor, ingresa un número de WhatsApp válido.",
                    nextState: STATES.ASK_PHONE
                };
            }
            session.telefono = msg;
            return {
                message: "Perfecto.\\n\\n¿En qué *ciudad o región* se ubica el proyecto? (ejemplo: Huancayo, Lima, Junín)",
                nextState: STATES.ASK_LOCATION
            };

        // --- 7. ASK_LOCATION ---
        case STATES.ASK_LOCATION:
            if (!msg || msg.length < 3) {
                return {
                    message: "Por favor, ingresa la ubicación del proyecto.",
                    nextState: STATES.ASK_LOCATION
                };
            }
            session.ubicacion = msg;
            return {
                message: "¿Cuándo prefieres que te contactemos para coordinar la evaluación técnica?",
                nextState: STATES.ASK_APPOINTMENT,
                options: ["🌅 Mañana", "🕐 Tarde", "📅 Fin de semana"]
            };

        // --- 8. ASK_APPOINTMENT ---
        case STATES.ASK_APPOINTMENT:
            session.cita = msg;
            const whatsappLink = generateWhatsAppLink(session);
            return {
                message: `Excelente, ${session.nombre}.\\n\\n✅ *Resumen de tu solicitud:*\\n• Proyecto: ${session.tipo_proyecto}\\n• Etapa: ${session.etapa}\\n• Necesidad: ${session.necesidad}\\n• Ubicación: ${session.ubicacion}\\n• Contacto: ${session.telefono}\\n• Cita preferida: ${session.cita}\\n\\n*Próximos pasos:*\\n1️⃣ Confirma enviando este mensaje a WhatsApp\\n2️⃣ Un especialista técnico te contactará en las próximas 24 horas\\n3️⃣ Coordinaremos la evaluación técnica en tu proyecto\\n\\n¡Gracias por confiar en TESLA! ⚡`,
                nextState: STATES.END,
                whatsappLink: whatsappLink,
                cardData: {
                    service: session.necesidad || 'Solución TESLA',
                    projectType: session.tipo_proyecto,
                    stage: session.etapa
                }
            };

        default:
            return {
                message: "¡Hola! Soy PILi. ¿En qué puedo ayudarte?",
                nextState: STATES.START
            };
    }
}

// API Endpoint
app.post('/api/chat', (req, res) => {
    const { message, sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }

    let session = sessions.get(sessionId) || { estado: STATES.START };
    const response = processMessage(session, message);

    session.estado = response.nextState;
    sessions.set(sessionId, session);

    res.json(response);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 PILI V4 Local Server running on http://localhost:${PORT}`);
    console.log(`📱 Test the chatbot at http://localhost:${PORT}`);
});
