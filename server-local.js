// Simple Local Server for Testing PILI
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

// Mock PILI Memory (in-memory for testing)
const sessions = new Map();

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

// Mock PILI Brain
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

// API Endpoint
app.post('/api/chat', (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || !sessionId) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Get or create session
        let session = sessions.get(sessionId);
        if (!session) {
            session = {
                id: sessionId,
                estado: STATES.BIENVENIDA,
                conversacion: []
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

        // Return response
        res.json({
            message: response.message,
            state: response.nextState,
            options: response.options || null,
            requiresInput: response.requiresInput || false,
            whatsappLink: response.whatsappLink || null
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Error procesando mensaje',
            message: 'Lo siento, hubo un error. Por favor intenta nuevamente.'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 SERVIDOR LOCAL PILI INICIADO                    ║
║                                                       ║
║   📍 URL: http://localhost:${PORT}                      ║
║   🤖 API: http://localhost:${PORT}/api/chat            ║
║                                                       ║
║   ✅ Abre tu navegador en: http://localhost:${PORT}    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});
