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
    // WhatsApp-compatible emoji encoding
    const bell = String.fromCodePoint(0x1F514);
    const person = String.fromCodePoint(0x1F464);
    const phone = String.fromCodePoint(0x1F4F1);
    const pin = String.fromCodePoint(0x1F4CD);
    const building = String.fromCodePoint(0x1F3D7);
    const chart = String.fromCodePoint(0x1F4CA);
    const tools = String.fromCodePoint(0x1F6E0);
    const calendar = String.fromCodePoint(0x1F4C5);

    const text = `${bell} *SOLICITUD PILi V4* ${bell}
    
${person} *Cliente:* ${session.nombre || '-'}
${phone} *WhatsApp:* ${session.telefono || '-'}
${pin} *Ubicación:* ${session.ubicacion || '-'}

${building} *Proyecto:* ${session.tipo_proyecto || '-'}
${chart} *Etapa:* ${session.etapa || '-'}
${tools} *Necesidad:* ${session.necesidad || '-'}

${calendar} *Cita:* ${session.cita || 'Por coordinar'}

Link autogenerado por PILi Chat.`;

    return `https://wa.me/51906315961?text=${encodeURIComponent(text)}`;
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
                message: "¡Hola! Soy PILi, asistente técnica de TESLA Electricidad y Automatización. ⚡\n\nTe ayudo a identificar la mejor solución para tu proyecto y a coordinar una evaluación técnica.\n\nPara empezar, selecciona el tipo de proyecto:",
                nextState: STATES.ASK_PROJECT_TYPE,
                options: OPTIONS.PROJECT_TYPE
            };

        // --- 2. ASK_PROJECT_TYPE ---
        case STATES.ASK_PROJECT_TYPE:
            if (!isValidOption(msg, OPTIONS.PROJECT_TYPE)) {
                return { message: "Por favor, selecciona una opción del menú. 👇", nextState: STATES.ASK_PROJECT_TYPE, options: OPTIONS.PROJECT_TYPE };
            }
            session.tipo_proyecto = msg;
            return {
                message: "¿En qué etapa se encuentra actualmente?",
                nextState: STATES.ASK_STAGE,
                options: OPTIONS.STAGE
            };

        // --- 3. ASK_STAGE ---
        case STATES.ASK_STAGE:
            if (!isValidOption(msg, OPTIONS.STAGE)) {
                return { message: "Selecciona la etapa del proyecto. 👇", nextState: STATES.ASK_STAGE, options: OPTIONS.STAGE };
            }
            session.etapa = msg;
            return {
                message: "¿Qué necesitas resolver principalmente ahora? 👇",
                nextState: STATES.ASK_NEED,
                options: OPTIONS.NEED
            };

        // --- 4. ASK_NEED (New Categories) ---
        case STATES.ASK_NEED:
            if (!isValidOption(msg, OPTIONS.NEED)) {
                return { message: "Selecciona una especialidad. 👇", nextState: STATES.ASK_NEED, options: OPTIONS.NEED };
            }
            session.necesidad = msg; // Renamed from 'servicios' to 'necesidad' for V4 semantics

            // --- 5. VALIDATION (Auto-Reply) ---
            // We transition immediately to ASK_NAME but first send the validation msg logic
            // In a real chat interaction, this might be split, but here we combine the "Perfecto" with the Question
            return {
                message: `Perfecto. \nProyecto en *${session.etapa}* con necesidad de *${session.necesidad}*. Entendido.\n\nPara coordinar la evaluación técnica, indícame tu *Nombre Completo*:`,
                nextState: STATES.ASK_NAME,
                requiresInput: true
            };

        // --- 6. ASK_NAME ---
        case STATES.ASK_NAME:
            if (msg.length < 3) return { message: "Por favor, ingresa tu nombre real.", nextState: STATES.ASK_NAME, requiresInput: true };
            session.nombre = msg;
            return {
                message: `Gracias ${session.nombre}. \n\nIndícame tu número de *Celular / WhatsApp*:`,
                nextState: STATES.ASK_PHONE,
                requiresInput: true
            };

        // --- 7. ASK_PHONE ---
        case STATES.ASK_PHONE:
            const phoneRegex = /^[0-9+\s-]{7,15}$/;
            if (!phoneRegex.test(msg)) return { message: "Ingresa un número válido (ej. 987654321).", nextState: STATES.ASK_PHONE, requiresInput: true };
            session.telefono = msg;
            return {
                message: "Finalmente, ¿En qué **Lugar / Distrito** se ubica el proyecto? (Esto ayuda al ingeniero a planificar la visita).",
                nextState: STATES.ASK_LOCATION, // New Step
                requiresInput: true
            };

        // --- 8. ASK_LOCATION (Replaces Email) ---
        case STATES.ASK_LOCATION:
            session.ubicacion = msg;
            // V5 STRATEGY: Soft Contact Preference instead of Appointment
            session.estado = STATES.ASK_APPOINTMENT;
            return {
                message: "Perfecto. 📝\n\nUn especialista de TESLA se comunicará contigo para revisar tu proyecto.\n\n¿En qué horario prefieres que te contactemos?",
                nextState: STATES.ASK_APPOINTMENT,
                options: ["🕘 Mañana", "🕑 Tarde", "🕖 Noche"]
            };

        case STATES.ASK_APPOINTMENT: // Now serves as PREFERENCE
            // msg contains "Mañana", "Tarde", or "Noche"
            session.cita = msg;
            session.estado = STATES.CONFIRM;
            return {
                message: `Resumen de tu solicitud:\n\n👤 ${session.nombre}\n📍 ${session.ubicacion}\n⚡ ${session.necesidad}\n🕒 Horario preferido: ${session.cita}\n\n¿Confirmamos el contacto con el especialista?`,
                nextState: STATES.CONFIRM,
                options: ["✅ Confirmar", "✏️ Corregir datos"]
            };

        // --- 10. CONFIRM & CARD DELIVERY ---
        case STATES.CONFIRM:
            if (msg.includes('Confirmar') || msg.toLowerCase() === 'sí' || msg.toLowerCase() === 'si') {
                const whatsappLink = generateWhatsAppLink(session);
                session.estado = STATES.END;

                // V5 STRATEGY: Professional Closing + Card Receipt
                return {
                    message: "¡Perfecto! ✅\n\nUn **especialista técnico de TESLA** continuará la atención contigo.\n\nTe dejo además una **tarjeta digital del servicio** para que tengas nuestra información siempre a mano.\n\n👇 Haz clic abajo para continuar por WhatsApp.",
                    nextState: STATES.END,
                    whatsappLink: whatsappLink,
                    cardData: {
                        service: session.necesidad,
                        projectType: session.tipo_proyecto,
                        stage: session.etapa
                    }
                };
            } else {
                session.estado = STATES.ASK_NAME;
                return {
                    message: "Entendido, empecemos de nuevo. ¿Cuál es tu nombre?",
                    nextState: STATES.ASK_NAME,
                    options: []
                };
            }

        default:
            return { message: "Reset...", nextState: STATES.START };
    }
}

// API Endpoint
app.post('/api/chat', (req, res) => {
    const { message, sessionId } = req.body;
    if (!sessions.has(sessionId)) sessions.set(sessionId, { estado: STATES.START });
    const session = sessions.get(sessionId);
    const response = processMessage(session, message);
    if (response.nextState) session.estado = response.nextState;
    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server V4 running at http://localhost:${PORT}`);
});
