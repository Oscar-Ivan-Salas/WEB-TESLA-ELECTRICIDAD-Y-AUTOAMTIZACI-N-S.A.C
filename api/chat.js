/**
 * PILI Chatbot - Simplified API for Production
 * Works without complex imports - standalone version
 */

// PILI States - Full Flow
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

// Helper to format WhatsApp message
function generateWhatsAppLink(session) {
    const text = `🔔 *NUEVA SOLICITUD - WEB TESLA* 🔔
    
👤 *Cliente:* ${session.nombre || 'No especificado'}
📱 *Teléfono:* ${session.telefono || 'No especificado'}
📧 *Correo:* ${session.correo || 'No especificado'}

🏗️ *Proyecto:* ${session.tipo_proyecto || '-'}
📊 *Etapa:* ${session.etapa || '-'}
🛠️ *Servicios:* ${session.servicios || '-'}

📅 *Cita Sugerida:* ${session.cita || 'Por coordinar'}

Link autogenerado por PILI Chat.`;

    return `https://wa.me/51906315961?text=${encodeURIComponent(text)}`;
}

// Process message through PILI brain
function processMessage(session, message) {
    const state = session.estado || STATES.START;

    // Normalization helper
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

        // --- 3. ASK_STAGE ---
        case STATES.ASK_STAGE:
            session.etapa = msg;
            return {
                message: "¿Qué servicios específicos necesitas evaluar?",
                nextState: STATES.ASK_SERVICES,
                options: [
                    "Suministro de Materiales",
                    "Instalación / Ejecución",
                    "Ingeniería / Diseño",
                    "Pruebas y Certificación",
                    "Solución Llave en Mano (Todo)"
                ]
            };

        // --- 4. ASK_SERVICES ---
        case STATES.ASK_SERVICES:
            session.servicios = msg;
            return {
                message: "Gracias por los detalles. \n\n¿Estás buscando solo información general o deseas una *Evaluación Técnica* formal con un especialista?",
                nextState: STATES.FILTER_SERIOUS,
                options: [
                    "Solicitar Evaluación Técnica",
                    "Solo información general"
                ]
            };

        // --- 5. FILTER_SERIOUS ---
        case STATES.FILTER_SERIOUS:
            if (lowerMsg.includes("información") || lowerMsg.includes("general")) {
                return {
                    message: "Entiendo. Te invito a revisar nuestra sección de Servicios en la web para conocer más sobre lo que hacemos.\n\nSi te animas por una evaluación técnica, estaré aquí. ¡Saludos! 👋",
                    nextState: STATES.END,
                    requiresInput: false
                };
            } else {
                // Serious lead
                return {
                    message: "¡Excelente decisión! Para coordinar la visita o reunión técnica, necesito registrar tus datos básicos.\n\n¿Cuál es tu *Nombre Completo*?",
                    nextState: STATES.ASK_CONTACT_DATA,
                    requiresInput: true
                };
            }

        // --- 6. ASK_CONTACT_DATA ---
        case STATES.ASK_CONTACT_DATA:
            if (!session.nombre) {
                session.nombre = msg;
                return {
                    message: `Gracias ${session.nombre}. \n\nPor favor indícame tu número de *Celular/WhatsApp* para contacto:`,
                    nextState: STATES.ASK_CONTACT_DATA,
                    requiresInput: true
                };
            } else if (!session.telefono) {
                session.telefono = msg;
                return {
                    message: "Perfecto. Finalmente, ¿Cuál es tu *Correo Electrónico* corporativo/personal? (O escribe 'omitir')",
                    nextState: STATES.ASK_CONTACT_DATA,
                    requiresInput: true
                };
            } else {
                session.correo = msg;
                return {
                    message: "Datos registrados. 📝\n\n¿Cuándo te gustaría agendar la evaluación técnica? (Día/Hora preferida)",
                    nextState: STATES.ASK_APPOINTMENT,
                    requiresInput: true
                };
            }

        // --- 7. ASK_APPOINTMENT ---
        case STATES.ASK_APPOINTMENT:
            session.cita = msg;
            return {
                message: `Perfecto. Resumen de tu solicitud:\n\n👤 ${session.nombre}\n🏗️ ${session.tipo_proyecto}\n📊 ${session.etapa}\n🛠️ ${session.servicios}\n📅 Cita: ${session.cita}\n\n¿Es correcto?`,
                nextState: STATES.CONFIRM_APPOINTMENT,
                options: [
                    "Sí, confirmar solicitud",
                    "Corregir datos"
                ]
            };

        // --- 8. CONFIRM_APPOINTMENT ---
        case STATES.CONFIRM_APPOINTMENT:
            if (lowerMsg.includes("corregir")) {
                session.nombre = null;
                session.telefono = null;
                return {
                    message: "Entendido. Empecemos de nuevo con tus datos. ¿Cuál es tu Nombre Completo?",
                    nextState: STATES.ASK_CONTACT_DATA,
                    requiresInput: true
                };
            } else {
                const whatsappLink = generateWhatsAppLink(session);
                return {
                    message: "¡Excelente! Solicitud generada con éxito. ✅\n\nComo paso final, **haz clic en el botón de abajo** para enviar la ficha a nuestro Ingeniero Especialista vía WhatsApp y confirmar tu cita.",
                    nextState: STATES.LEAD_CONFIRMED,
                    whatsappLink: whatsappLink
                };
            }

        // --- Default ---
        default:
            return {
                message: "¡Hola! ¿En qué puedo ayudarte?",
                nextState: STATES.START,
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
