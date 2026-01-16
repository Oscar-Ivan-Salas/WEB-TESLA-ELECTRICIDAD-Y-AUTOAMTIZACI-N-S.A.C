// PILI Chatbot V4 - Serverless API Handler
// Matches logic from server-local.js (Conversion Flow)
// FORCE UPDATE V4.1 - REBUILD PLEASE

const globalSessions = new Map();

const STATES = {
    START: 'START',
    ASK_PROJECT_TYPE: 'ASK_PROJECT_TYPE',
    ASK_STAGE: 'ASK_STAGE',
    ASK_NEED: 'ASK_NEED',
    VALIDATION: 'VALIDATION',
    ASK_NAME: 'ASK_NAME',
    ASK_PHONE: 'ASK_PHONE',
    ASK_LOCATION: 'ASK_LOCATION',
    ASK_APPOINTMENT: 'ASK_APPOINTMENT',
    CONFIRM: 'CONFIRM',
    END: 'END'
};

const OPTIONS = {
    PROJECT_TYPE: [
        "🏗️ Proyecto en curso",
        "📋 Evaluación inicial",
        "� Actualización técnica"
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

function generateWhatsAppLink(session) {
    const text = `\uD83D\uDD14 *SOLICITUD PILI V4* \uD83D\uDD14
    
\uD83D\uDC64 *Cliente:* ${session.nombre || '-'}
\uD83D\uDCF1 *Whatsapp:* ${session.telefono || '-'}
\uD83D\uDCCD *Ubicación:* ${session.ubicacion || '-'}

\uD83C\uDFD7\uFE0F *Proyecto:* ${session.tipo_proyecto || '-'}
\uD83D\uDCCA *Etapa:* ${session.etapa || '-'}
\uD83D\uDEE0\uFE0F *Necesidad:* ${session.necesidad || '-'}

\uD83D\uDCC5 *Cita:* ${session.cita || 'Por coordinar'}

Link autogenerado por PILi Chat.`;

    return `https://wa.me/51906315961?text=${encodeURIComponent(text)}`;
}

function isValidOption(input, options) {
    if (!options || !Array.isArray(options)) return true;
    const normalizedInput = input.trim().toLowerCase();
    return options.some(opt => opt.toLowerCase().includes(normalizedInput) || normalizedInput.includes(opt.toLowerCase()));
}

function processMessage(session, message) {
    const state = session.estado || STATES.START;
    const msg = message ? message.toString().trim() : "";

    switch (state) {
        case STATES.START:
            return {
                message: "¡Hola! 👋 Soy PILi, la asistente técnica de TESLA Electricidad y Automatización.\n\nEstoy aquí para ayudarte a evaluar tu proyecto y coordinar una reunión técnica con nuestro equipo.\n\n¿En qué tipo de proyecto estás trabajando?",
                nextState: STATES.ASK_PROJECT_TYPE,
                options: OPTIONS.PROJECT_TYPE
            };

        case STATES.ASK_PROJECT_TYPE:
            if (!isValidOption(msg, OPTIONS.PROJECT_TYPE)) return { message: "Por favor, selecciona una opción del menú. 👇", nextState: STATES.ASK_PROJECT_TYPE, options: OPTIONS.PROJECT_TYPE };
            session.tipo_proyecto = msg;
            return { message: "Entendido. ¿En qué etapa se encuentra tu proyecto actualmente?", nextState: STATES.ASK_STAGE, options: OPTIONS.STAGE };

        case STATES.ASK_STAGE:
            if (!isValidOption(msg, OPTIONS.STAGE)) return { message: "Selecciona la etapa del proyecto. 👇", nextState: STATES.ASK_STAGE, options: OPTIONS.STAGE };
            session.etapa = msg;
            return { message: "Para darte una evaluación precisa, ¿qué sistemas necesitas integrar en tu proyecto? 👇", nextState: STATES.ASK_NEED, options: OPTIONS.NEED };

        case STATES.ASK_NEED:
            if (!isValidOption(msg, OPTIONS.NEED)) return { message: "Selecciona una especialidad. 👇", nextState: STATES.ASK_NEED, options: OPTIONS.NEED };
            session.necesidad = msg;
            return {
                message: `Entendido. Proyecto en *${session.etapa}* que requiere *${session.necesidad}*.\n\nPara coordinar la evaluación técnica, ¿cuál es tu *Nombre Completo*?`,
                nextState: STATES.ASK_NAME,
                requiresInput: true
            };

        case STATES.ASK_NAME:
            if (msg.length < 3) return { message: "Por favor, ingresa tu nombre real.", nextState: STATES.ASK_NAME, requiresInput: true };
            session.nombre = msg;
            return { message: `Gracias ${session.nombre}.\n\n¿A qué número de WhatsApp podemos enviarte la confirmación de la evaluación técnica?`, nextState: STATES.ASK_PHONE, requiresInput: true };

        case STATES.ASK_PHONE:
            const phoneRegex = /^[0-9+\s-]{7,15}$/;
            if (!phoneRegex.test(msg)) return { message: "Ingresa un número válido (ej. 987654321).", nextState: STATES.ASK_PHONE, requiresInput: true };
            session.telefono = msg;
            return {
                message: "¿En qué ciudad o región se ejecutará el proyecto?\n(Ejemplo: Huancayo, Lima, Junín)",
                nextState: STATES.ASK_LOCATION,
                requiresInput: true
            };

        case STATES.ASK_LOCATION:
            session.ubicacion = msg;
            // V5 STRATEGY: Soft Contact Preference
            session.estado = STATES.ASK_APPOINTMENT; // Update session state
            return {
                message: "Perfecto. 📝\n\nUn especialista de TESLA se comunicará contigo para revisar tu proyecto.\n\n¿En qué horario prefieres que te contactemos?",
                options: ["🕘 Mañana", "🕑 Tarde", "🕖 Noche"],
                nextState: STATES.ASK_APPOINTMENT // Explicitly set next state for clarity
            };

        case STATES.ASK_APPOINTMENT:
            session.cita = msg;
            session.estado = STATES.CONFIRM; // Update session state
            return {
                message: `Resumen de tu solicitud:\n\n👤 ${session.nombre}\n📍 ${session.ubicacion}\n⚡ ${session.necesidad}\n🕒 Horario preferido: ${session.cita}\n\n¿Confirmamos el contacto con el especialista?`,
                options: ["✅ Confirmar", "✏️ Corregir datos"],
                nextState: STATES.CONFIRM // Explicitly set next state for clarity
            };

        case STATES.CONFIRM:
            if (msg.includes('Confirmar') || msg.toLowerCase() === 'sí' || msg.toLowerCase() === 'si') {
                const whatsappLink = generateWhatsAppLink(session);
                session.estado = STATES.END; // Update session state

                return {
                    message: `✅ Perfecto, ${session.nombre}.\n\nHemos registrado tu solicitud de evaluación técnica para tu proyecto en ${session.ubicacion}.\n\n**Próximos pasos:**\n1️⃣ Un ingeniero de TESLA revisará tu caso en las próximas 24 horas\n2️⃣ Te contactaremos vía WhatsApp para coordinar una visita técnica\n3️⃣ Recibirás una propuesta técnica personalizada\n\n📲 Confirmación enviada a: ${session.telefono}\n\n👇 Haz clic abajo para continuar.`,
                    whatsappLink: whatsappLink,
                    cardData: {
                        service: session.necesidad,
                        projectType: session.tipo_proyecto,
                        stage: session.etapa
                    },
                    nextState: STATES.END // Explicitly set next state for clarity
                };
            } else {
                session.estado = STATES.ASK_NAME; // Update session state
                return {
                    message: "Entendido, empecemos de nuevo. ¿Cuál es tu nombre?",
                    options: [],
                    nextState: STATES.ASK_NAME // Explicitly set next state for clarity
                };
            }

        default:
            return { message: "Reset...", nextState: STATES.START };
    }
}

export default function handler(req, res) {
    if (req.method !== 'POST') { res.status(405).json({ message: 'Method Not Allowed' }); return; }
    const { message, sessionId } = req.body;
    if (!globalSessions.has(sessionId)) globalSessions.set(sessionId, { estado: STATES.START });
    const session = globalSessions.get(sessionId);
    const response = processMessage(session, message);
    if (response.nextState) session.estado = response.nextState;
    res.status(200).json(response);
}
