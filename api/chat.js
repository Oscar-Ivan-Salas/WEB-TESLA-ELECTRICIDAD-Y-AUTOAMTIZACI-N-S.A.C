// PILI Chatbot - Serverless API Handler
// Matches logic from server-local.js (V3)

// Mock PILI Memory (Ephemereal for Serverless - best effort without DB)
// Note: In production serverless, this Map resets if the function cold-starts.
// For a robust solution, use Redis or a Database.
const globalSessions = new Map();

const STATES = {
    START: 'START',
    ASK_PROJECT_TYPE: 'ASK_PROJECT_TYPE',
    ASK_STAGE: 'ASK_STAGE',
    ASK_SERVICES: 'ASK_SERVICES',
    FILTER_SERIOUS: 'FILTER_SERIOUS',
    ASK_CONTACT_DATA: 'ASK_CONTACT_DATA',
    ASK_APPOINTMENT: 'ASK_APPOINTMENT',
    CONFIRM_APPOINTMENT: 'CONFIRM_APPOINTMENT',
    LEAD_CONFIRMED: 'LEAD_CONFIRMED',
    END: 'END'
};

// Helper: Format WhatsApp message with SAFE UNICODE EMOJIS
function generateWhatsAppLink(session) {
    // Emojis: 🔔 \uD83D\uDD14, 👤 \uD83D\uDC64, 📱 \uD83D\uDCF1, 📧 \uD83D\uDCE7
    // 🏗️ \uD83C\uDFD7\uFE0F, 📊 \uD83D\uDCCA, 🛠️ \uD83D\uDEE0\uFE0F, 📅 \uD83D\uDCC5

    const text = `\uD83D\uDD14 *NUEVA SOLICITUD - WEB TESLA* \uD83D\uDD14
    
\uD83D\uDC64 *Cliente:* ${session.nombre || 'No especificado'}
\uD83D\uDCF1 *Teléfono:* ${session.telefono || 'No especificado'}
\uD83D\uDCE7 *Correo:* ${session.correo || 'No especificado'}

\uD83C\uDFD7\uFE0F *Proyecto:* ${session.tipo_proyecto || '-'}
\uD83D\uDCCA *Etapa:* ${session.etapa || '-'}
\uD83D\uDEE0\uFE0F *Servicios:* ${session.servicios || '-'}

\uD83D\uDCC5 *Cita Sugerida:* ${session.cita || 'Por coordinar'}

Link autogenerado por PILi Chat.`;

    return `https://wa.me/51906315961?text=${encodeURIComponent(text)}`;
}

// Validation Helper
function isValidOption(input, options) {
    if (!options || !Array.isArray(options)) return true;
    const normalizedInput = input.trim().toLowerCase();
    return options.some(opt => opt.toLowerCase() === normalizedInput);
}

// Core Logic (Identical to server-local.js V3)
function processMessage(session, message) {
    const state = session.estado || STATES.START;
    const msg = message ? message.toString().trim() : "";
    const lowerMsg = msg.toLowerCase();

    switch (state) {
        // --- 1. START ---
        case STATES.START:
            return {
                message: "¡Hola! Soy PILi, asistente técnica de TESLA Electricidad y Automatización. ⚡\n\nPuedo ayudarte a evaluar tu proyecto y coordinar una cita técnica.\n\nPara empezar, ¿En qué tipo de proyecto estás trabajando?",
                nextState: STATES.ASK_PROJECT_TYPE,
                options: [
                    "Infraestructura Eléctrica",
                    "Automatización & BMS",
                    "Detección de Incendios",
                    "Otro proyecto"
                ]
            };

        // --- 2. ASK_PROJECT_TYPE ---
        case STATES.ASK_PROJECT_TYPE:
            {
                const validOptions = [
                    "Infraestructura Eléctrica",
                    "Automatización & BMS",
                    "Detección de Incendios",
                    "Otro proyecto"
                ];
                if (!isValidOption(msg, validOptions)) {
                    return {
                        message: "Por favor, selecciona una de las opciones válidas para poder asignarte un especialista adecuado. 👇",
                        nextState: STATES.ASK_PROJECT_TYPE,
                        options: validOptions
                    };
                }
                session.tipo_proyecto = msg;
                return {
                    message: `Entendido, proyecto de *${msg}*. \n\n¿En qué etapa se encuentra actualmente?`,
                    nextState: STATES.ASK_STAGE,
                    options: [
                        "Idea / Perfil",
                        "Expediente Técnico",
                        "En Construcción",
                        "Mantenimiento / Remodelación"
                    ]
                };
            }

        // --- 3. ASK_STAGE ---
        case STATES.ASK_STAGE:
            {
                const validOptions = [
                    "Idea / Perfil",
                    "Expediente Técnico",
                    "En Construcción",
                    "Mantenimiento / Remodelación"
                ];
                if (!isValidOption(msg, validOptions)) {
                    return {
                        message: "Para entender mejor tu necesidad, por favor dime en qué etapa está el proyecto. 👇",
                        nextState: STATES.ASK_STAGE,
                        options: validOptions
                    };
                }
                session.etapa = msg;
                return {
                    message: "¿Qué servicios específicos necesitas evaluar?",
                    nextState: STATES.ASK_SERVICES,
                    options: [
                        "Suministro de Materiales",
                        "Instalación / Ejecución",
                        "Ingeniería / Diseño",
                        "Pruebas y Certificación",
                        "Solución Llave en Mano (Todo)",
                        "Consultoría / Asesoría"
                    ]
                };
            }

        // --- 4. ASK_SERVICES ---
        case STATES.ASK_SERVICES:
            {
                const validOptions = [
                    "Suministro de Materiales",
                    "Instalación / Ejecución",
                    "Ingeniería / Diseño",
                    "Pruebas y Certificación",
                    "Solución Llave en Mano (Todo)",
                    "Consultoría / Asesoría"
                ];
                if (!isValidOption(msg, validOptions)) {
                    return {
                        message: "Selecciona el servicio principal que requieres. 👇",
                        nextState: STATES.ASK_SERVICES,
                        options: validOptions
                    };
                }
                session.servicios = msg;
                return {
                    message: "Gracias por los detalles. \n\n¿Estás buscando solo información general o deseas una *Evaluación Técnica* formal con un especialista?",
                    nextState: STATES.FILTER_SERIOUS,
                    options: [
                        "Solicitar Evaluación Técnica",
                        "Solo información general"
                    ]
                };
            }

        // --- 5. FILTER_SERIOUS ---
        case STATES.FILTER_SERIOUS:
            if (lowerMsg.includes("información") || lowerMsg.includes("general")) {
                return {
                    message: "Entiendo. Te invito a revisar nuestra sección de Servicios en la web para conocer más sobre lo que hacemos.\n\nSi te animas por una evaluación técnica, estaré aquí. ¡Saludos! 👋",
                    nextState: STATES.END,
                    requiresInput: false
                };
            } else {
                return {
                    message: "¡Excelente decisión! Para coordinar la visita o reunión técnica, necesito registrar tus datos básicos.\n\n¿Cuál es tu *Nombre Completo*?",
                    nextState: STATES.ASK_CONTACT_DATA,
                    requiresInput: true
                };
            }

        // --- 6. ASK_CONTACT_DATA ---
        case STATES.ASK_CONTACT_DATA:
            if (!session.nombre) {
                if (msg.length < 3) return { message: "Por favor, ingresa tu nombre completo real.", nextState: STATES.ASK_CONTACT_DATA, requiresInput: true };
                session.nombre = msg;
                return { message: `Gracias ${session.nombre}. \n\nPor favor indícame tu número de *Celular/WhatsApp* para contacto:`, nextState: STATES.ASK_CONTACT_DATA, requiresInput: true };
            } else if (!session.telefono) {
                const phoneRegex = /^[0-9+\s-]{7,15}$/;
                if (!phoneRegex.test(msg)) return { message: "El número no parece válido. Por favor ingresa un celular (ej. 987654321).", nextState: STATES.ASK_CONTACT_DATA, requiresInput: true };
                session.telefono = msg;
                return { message: "Perfecto. Finalmente, ¿Cuál es tu *Correo Electrónico* corporativo/personal? (O escribe 'omitir')", nextState: STATES.ASK_CONTACT_DATA, requiresInput: true };
            } else {
                session.correo = msg;
                return {
                    message: "Datos registrados. 📝\n\nPor favor selecciona la fecha y hora sugerida para la evaluación técnica:",
                    nextState: STATES.ASK_APPOINTMENT,
                    requiresInput: true,
                    inputType: 'datetime-local'
                };
            }

        // --- 7. ASK_APPOINTMENT ---
        case STATES.ASK_APPOINTMENT:
            session.cita = msg;
            return {
                message: `Perfecto. Resumen de tu solicitud:\n\n👤 ${session.nombre}\n🏗️ ${session.tipo_proyecto}\n📊 ${session.etapa}\n🛠️ ${session.servicios}\n📅 Cita: ${session.cita}\n\n¿Es correcto?`,
                nextState: STATES.CONFIRM_APPOINTMENT,
                options: ["Sí, confirmar solicitud", "Corregir datos"]
            };

        // --- 8. CONFIRM_APPOINTMENT ---
        case STATES.CONFIRM_APPOINTMENT:
            if (lowerMsg.includes("corregir")) {
                session.nombre = null;
                session.telefono = null;
                return { message: "Entendido. Empecemos de nuevo con tus datos. ¿Cuál es tu Nombre Completo?", nextState: STATES.ASK_CONTACT_DATA, requiresInput: true };
            } else {
                return {
                    message: "¡Excelente! Solicitud generada con éxito. ✅\n\nComo paso final, **haz clic en el botón de abajo** para enviar la ficha a nuestro Ingeniero Especialista vía WhatsApp y confirmar tu cita.",
                    nextState: STATES.LEAD_CONFIRMED,
                    whatsappLink: generateWhatsAppLink(session)
                };
            }

        default:
            return { message: "¡Hola! ¿En qué puedo ayudarte?", nextState: STATES.START, requiresInput: true };
    }
}

// Vercel Serverless Handler
export default function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const { message, sessionId } = req.body;

    if (!globalSessions.has(sessionId)) {
        globalSessions.set(sessionId, { estado: STATES.START });
    }

    const session = globalSessions.get(sessionId);
    const response = processMessage(session, message);

    if (response.nextState) {
        session.estado = response.nextState;
    }

    res.status(200).json(response);
}
