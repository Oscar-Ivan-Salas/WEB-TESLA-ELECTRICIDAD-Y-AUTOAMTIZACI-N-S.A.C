// PILI V4 - Serverless Function (Vercel)
// Handles chat interactions with session management

const STATES = {
    START: 'START',
    ASK_PROJECT_TYPE: 'ASK_PROJECT_TYPE',
    ASK_STAGE: 'ASK_STAGE',
    ASK_NEED: 'ASK_NEED',
    ASK_NAME: 'ASK_NAME',
    ASK_PHONE: 'ASK_PHONE',
    ASK_LOCATION: 'ASK_LOCATION',
    ASK_APPOINTMENT: 'ASK_APPOINTMENT',
    CONFIRM: 'CONFIRM',
    END: 'END'
};

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
                message: "Hola 👋\nSoy **PILI**, asistente técnica de **TESLA Electricidad y Automatización**.\nTe ayudaré a evaluar tu proyecto y orientarte correctamente.\n\nPara empezar, selecciona el tipo de proyecto:",
                nextState: STATES.ASK_PROJECT_TYPE,
                options: OPTIONS.PROJECT_TYPE
            };

        case STATES.ASK_PROJECT_TYPE:
            if (!isValidOption(msg, OPTIONS.PROJECT_TYPE)) {
                return {
                    message: "Por favor, selecciona una opción del menú.",
                    nextState: STATES.ASK_PROJECT_TYPE,
                    options: OPTIONS.PROJECT_TYPE
                };
            }
            session.tipo_proyecto = msg;

            // Mensaje de especialista según servicio
            let specialistMessage = "";
            if (msg.includes("Obra en ejecución") || msg.includes("eléctrica")) {
                specialistMessage = "Entendido. En proyectos eléctricos, los problemas suelen aparecer al final: protecciones mal calculadas, tableros sin criterio o instalaciones que no quedaron operativas.\n\n";
            } else if (msg.includes("incendios")) {
                specialistMessage = "Entendido. En sistemas contra incendios, el mayor riesgo es instalar sin criterio normativo y descubrir observaciones cuando la obra ya está avanzada.\n\n";
            } else if (msg.includes("Automatización") || msg.includes("Domótica")) {
                specialistMessage = "Entendido. En automatización, muchas veces se instalan equipos que luego no se integran ni se aprovechan correctamente.\n\n";
            } else if (msg.includes("Mantenimiento") || msg.includes("Remodelación")) {
                specialistMessage = "Entendido. En mantenimiento técnico, el problema común es corregir síntomas sin resolver la causa real de la falla.\n\n";
            } else if (msg.includes("Acabados")) {
                specialistMessage = "Entendido. En acabados, los mayores retrabajos ocurren cuando no se coordinan correctamente las instalaciones técnicas.\n\n";
            } else if (msg.includes("integral") || msg.includes("TESLA")) {
                specialistMessage = "Entendido. Esta solución es ideal cuando no se quiere coordinar múltiples proveedores ni asumir riesgos técnicos.\n\n";
            }

            return {
                message: specialistMessage + "¿En qué etapa se encuentra actualmente?",
                nextState: STATES.ASK_STAGE,
                options: OPTIONS.STAGE
            };

        case STATES.ASK_STAGE:
            if (!isValidOption(msg, OPTIONS.STAGE)) {
                return {
                    message: "Por favor, selecciona una opción del menú.",
                    nextState: STATES.ASK_STAGE,
                    options: OPTIONS.STAGE
                };
            }
            session.etapa = msg;

            // Validación técnica según servicio
            let technicalContext = "";
            const projectType = session.tipo_proyecto || "";
            if (projectType.includes("eléctrica") || projectType.includes("Obra")) {
                technicalContext = "Perfecto. En estos casos revisamos carga, protecciones, puesta a tierra y el estado real de la instalación para evitar reprocesos.\n\n";
            } else if (projectType.includes("incendios")) {
                technicalContext = "Perfecto. En estos casos revisamos normativa INDECI, diseño de red y certificación para evitar observaciones.\n\n";
            } else if (projectType.includes("Automatización") || projectType.includes("Domótica")) {
                technicalContext = "Perfecto. En estos casos revisamos integración de sistemas, protocolos y configuración para garantizar aprovechamiento completo.\n\n";
            } else if (projectType.includes("Mantenimiento") || projectType.includes("Remodelación")) {
                technicalContext = "Perfecto. En estos casos realizamos diagnóstico de causa raíz y plan preventivo para soluciones duraderas.\n\n";
            } else if (projectType.includes("Acabados")) {
                technicalContext = "Perfecto. En estos casos coordinamos instalaciones técnicas y acabado final para evitar retrabajos.\n\n";
            } else if (projectType.includes("integral") || projectType.includes("TESLA")) {
                technicalContext = "Perfecto. En estos casos gestionamos el proyecto completo con un solo responsable técnico.\n\n";
            }

            return {
                message: technicalContext + "¿Qué necesitas resolver principalmente ahora? 👇",
                nextState: STATES.ASK_NEED,
                options: OPTIONS.NEED
            };

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
                message: "Para que un especialista revise tu caso con este contexto técnico, necesito registrar tus datos.\nNo es una cotización automática, es una revisión real.\n\n¿Cuál es tu nombre completo?",
                nextState: STATES.ASK_NAME
            };

        case STATES.ASK_NAME:
            if (!msg || msg.length < 3) {
                return {
                    message: "Por favor, ingresa tu nombre completo.",
                    nextState: STATES.ASK_NAME
                };
            }
            session.nombre = msg;
            return {
                message: `Gracias ${msg}.\n\n¿Cuál es tu número de *WhatsApp*? (para confirmación de evaluación técnica)`,
                nextState: STATES.ASK_PHONE
            };

        case STATES.ASK_PHONE:
            if (!msg || msg.length < 9) {
                return {
                    message: "Por favor, ingresa un número de WhatsApp válido.",
                    nextState: STATES.ASK_PHONE
                };
            }
            session.telefono = msg;
            return {
                message: "Perfecto.\n\n¿En qué *ciudad o región* se ubica el proyecto? (ejemplo: Huancayo, Lima, Junín)",
                nextState: STATES.ASK_LOCATION
            };

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

        case STATES.ASK_APPOINTMENT:
            session.cita = msg;
            const whatsappLink = generateWhatsAppLink(session);
            return {
                message: `Listo ✅\n\n*Resumen de tu solicitud:*\n• Proyecto: ${session.tipo_proyecto}\n• Etapa: ${session.etapa}\n• Necesidad: ${session.necesidad}\n• Ubicación: ${session.ubicacion}\n• Contacto: ${session.telefono}\n• Cita preferida: ${session.cita}\n\nUn especialista del equipo TESLA continuará el seguimiento con esta información.\nSi tienes otra consulta técnica, aquí estaré.`,
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

const sessions = new Map();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }

    let session = sessions.get(sessionId) || { estado: STATES.START };
    const response = processMessage(session, message);

    session.estado = response.nextState;
    sessions.set(sessionId, session);

    return res.status(200).json(response);
}
