/**
 * PILI Chatbot - Simplified API for Production
 * Works without complex imports - standalone version
 */

// PILI States
const STATES = {
    BIENVENIDA: 'bienvenida',
    CAPTURA_NOMBRE: 'captura_nombre',
    TIPO_PROYECTO: 'tipo_proyecto',
    DETALLES_PROYECTO: 'detalles_proyecto',
    CAPTURA_TELEFONO: 'captura_telefono',
    CONFIRMACION: 'confirmacion',
    DESPEDIDA: 'despedida'
};

// In-memory session storage (temporary - will reset on cold starts)
const sessions = new Map();

// Process message through PILI brain
function processMessage(session, message) {
    const state = session.estado || STATES.BIENVENIDA;

    switch (state) {
        case STATES.BIENVENIDA:
            return {
                message: "¡Hola! Soy PILI, la asistente técnica de TESLA. 🔌⚡\n\n¿Cómo te llamas?",
                nextState: STATES.CAPTURA_NOMBRE,
                requiresInput: true
            };

        case STATES.CAPTURA_NOMBRE:
            session.nombre = message;
            return {
                message: `¡Mucho gusto, ${message}! 😊\n\n¿En qué tipo de proyecto estás trabajando?`,
                nextState: STATES.TIPO_PROYECTO,
                options: [
                    "Infraestructura Eléctrica",
                    "Automatización & BMS",
                    "Detección de Incendios",
                    "Otro proyecto"
                ]
            };

        case STATES.TIPO_PROYECTO:
            session.tipo_proyecto = message;
            return {
                message: `Excelente, ${session.nombre}. Cuéntame más sobre tu proyecto de ${message}.\n\n¿Qué necesitas específicamente?`,
                nextState: STATES.DETALLES_PROYECTO,
                requiresInput: true
            };

        case STATES.DETALLES_PROYECTO:
            session.detalles = message;
            return {
                message: `Perfecto, entiendo que necesitas: "${message}".\n\n¿Cuál es tu número de WhatsApp para enviarte una cotización personalizada?`,
                nextState: STATES.CAPTURA_TELEFONO,
                requiresInput: true
            };

        case STATES.CAPTURA_TELEFONO:
            session.telefono = message;
            const whatsappMsg = `Hola, soy ${session.nombre}. Necesito una cotización para: ${session.tipo_proyecto} - ${session.detalles}`;
            const whatsappLink = `https://wa.me/51906315961?text=${encodeURIComponent(whatsappMsg)}`;

            return {
                message: `¡Gracias, ${session.nombre}! 🎉\n\nHe registrado tu solicitud:\n📋 Proyecto: ${session.tipo_proyecto}\n📝 Detalles: ${session.detalles}\n📱 WhatsApp: ${session.telefono}\n\nHaz clic abajo para contactarnos directamente:`,
                nextState: STATES.DESPEDIDA,
                whatsappLink: whatsappLink
            };

        default:
            return {
                message: "¡Hola! ¿En qué puedo ayudarte?",
                nextState: STATES.BIENVENIDA,
                requiresInput: true
            };
    }
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, sessionId } = req.body;

        // Validate input
        if (!message || !sessionId) {
            return res.status(400).json({
                error: 'Missing required fields: message and sessionId'
            });
        }

        // Get or create session
        let session = sessions.get(sessionId);
        if (!session) {
            session = {
                id: sessionId,
                estado: STATES.BIENVENIDA,
                conversacion: [],
                created: new Date().toISOString()
            };
            sessions.set(sessionId, session);
        }

        // Process message
        const response = processMessage(session, message);

        // Update session
        session.estado = response.nextState;
        session.conversacion.push(
            { role: 'user', message, timestamp: new Date().toISOString() },
            { role: 'pili', message: response.message, timestamp: new Date().toISOString() }
        );
        session.lastUpdate = new Date().toISOString();

        // Return response
        return res.status(200).json({
            message: response.message,
            state: response.nextState,
            options: response.options || null,
            requiresInput: response.requiresInput || false,
            whatsappLink: response.whatsappLink || null
        });

    } catch (error) {
        console.error('PILI Chat Error:', error);
        return res.status(500).json({
            error: 'Error procesando mensaje',
            message: 'Lo siento, hubo un error. Por favor intenta nuevamente.'
        });
    }
}
