const STATES = {
    START: 'START',
    ASK_PROJECT_TYPE: 'ASK_PROJECT_TYPE',
    ASK_STAGE: 'ASK_STAGE',
    ASK_NEED: 'ASK_NEED',
    ASK_NAME: 'ASK_NAME',
    ASK_PHONE: 'ASK_PHONE',
    ASK_LOCATION: 'ASK_LOCATION',
    ASK_APPOINTMENT: 'ASK_APPOINTMENT',
    END: 'END'
};

const OPTIONS = {
    PROJECT_TYPE: [
        "🏗️ Obra en ejecución",
        "🤖 Automatización / Domótica",
        "🚨 Sistemas contra incendios",
        "🔧 Mantenimiento / Remodelación",
        "🏗️ Acabados técnicos",
        "🧩 Solución integral TESLA"
    ],
    STAGE: [
        "💡 Idea / Perfil",
        "🚧 En ejecución",
        "🔧 Mantenimiento",
        "✅ Etapa final / Cierre"
    ],
    NEED: [
        "📋 Evaluar solución técnica",
        "⚡ Ejecutar instalación",
        "� Resolver fallas",
        "🔑 Solución completa llave en mano"
    ]
};

function generateWhatsAppLink(session) {
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
    if (!input || !options) return false;
    const normalizedInput = input.toString().toLowerCase().trim();
    return options.some(opt => opt.toLowerCase().includes(normalizedInput) || normalizedInput.includes(opt.toLowerCase()));
}

function processMessage(session, message) {
    const state = session.estado || STATES.START;
    const msg = message ? message.toString().trim() : "";

    switch (state) {
        case STATES.START:
            return {
                message: "Hola, soy PILI, asistente técnica de TESLA Electricidad y Automatización.\\nTe ayudo a evaluar tu proyecto y orientarte con la mejor solución técnica, sin que tengas que coordinar múltiples proveedores.\\n\\nPara comenzar, dime en qué área necesitas apoyo:",
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

            // Mensaje de especialista según servicio (DOCUMENTO FINAL)
            let specialistMessage = "";
            if (msg.includes("Obra en ejecución") || msg.includes("eléctrica")) {
                specialistMessage = "Perfecto. En TESLA abordamos la electricidad como un sistema completo, desde puesta a tierra y tableros hasta tomacorrientes, iluminación y certificación final.\\nNo instalamos por partes sueltas, integramos todo correctamente para evitar fallas futuras.\\n\\n";
            } else if (msg.includes("incendios")) {
                specialistMessage = "Perfecto. En TESLA gestionamos detección, alarma y cumplimiento normativo para proteger vidas y activos.\\nNo solo instalamos equipos, aseguramos que el sistema cumpla con todas las normativas vigentes.\\n\\n";
            } else if (msg.includes("Automatización") || msg.includes("Domótica")) {
                specialistMessage = "Perfecto. En TESLA implementamos control inteligente de iluminación, accesos y energía para viviendas y edificios.\\nNo solo conectamos dispositivos, creamos sistemas que realmente funcionen de forma integrada.\\n\\n";
            } else if (msg.includes("Mantenimiento") || msg.includes("Remodelación")) {
                specialistMessage = "Perfecto. En TESLA no solo corregimos fallas, identificamos la causa raíz y solucionamos el problema de forma definitiva.\\nEvitamos que los mismos problemas se repitan.\\n\\n";
            } else if (msg.includes("Acabados")) {
                specialistMessage = "Perfecto. En TESLA coordinamos amoblados y acabados técnicos alineados al diseño del proyecto.\\nIntegramos la parte técnica con la estética para un resultado profesional.\\n\\n";
            } else if (msg.includes("integral") || msg.includes("TESLA")) {
                specialistMessage = "Perfecto. Con la solución integral TESLA obtienes un solo contrato, un solo responsable y todo resuelto.\\nNosotros coordinamos todo para que tú no tengas que hacerlo.\\n\\n";
            }

            return {
                message: specialistMessage + "¿En qué etapa se encuentra tu proyecto?",
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
                technicalContext = "Perfecto. En estos casos revisamos carga, protecciones, puesta a tierra y el estado real de la instalación para evitar reprocesos.\\n\\n";
            } else if (projectType.includes("incendios")) {
                technicalContext = "Perfecto. En estos casos revisamos normativa INDECI, diseño de red y certificación para evitar observaciones.\\n\\n";
            } else if (projectType.includes("Automatización") || projectType.includes("Domótica")) {
                technicalContext = "Perfecto. En estos casos revisamos integración de sistemas, protocolos y configuración para garantizar aprovechamiento completo.\\n\\n";
            } else if (projectType.includes("Mantenimiento") || projectType.includes("Remodelación")) {
                technicalContext = "Perfecto. En estos casos realizamos diagnóstico de causa raíz y plan preventivo para soluciones duraderas.\\n\\n";
            } else if (projectType.includes("Acabados")) {
                technicalContext = "Perfecto. En estos casos coordinamos instalaciones técnicas y acabado final para evitar retrabajos.\\n\\n";
            } else if (projectType.includes("integral") || projectType.includes("TESLA")) {
                technicalContext = "Perfecto. En estos casos gestionamos el proyecto completo con un solo responsable técnico.\\n\\n";
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
                message: "Con esta información podemos orientarte correctamente y evitar reprocesos o sobrecostos.\\nPara continuar, necesito registrar tus datos y que un especialista continúe el proceso.\\n\\n¿Cuál es tu nombre completo?",
                nextState: STATES.ASK_NAME
            };

        case STATES.ASK_NAME:
            // Validación de nombre
            if (!msg || msg.length < 3) {
                return {
                    message: "Por favor, ingresa tu nombre completo.",
                    nextState: STATES.ASK_NAME
                };
            }

            // Detectar si es solo números
            if (/^\d+$/.test(msg)) {
                return {
                    message: "Por favor, ingresa tu nombre completo (no solo números).",
                    nextState: STATES.ASK_NAME
                };
            }

            // Detectar si tiene al menos 2 palabras (nombre y apellido)
            const palabras = msg.trim().split(/\s+/);
            if (palabras.length < 2) {
                return {
                    message: "Por favor, ingresa tu nombre completo (nombre y apellido).",
                    nextState: STATES.ASK_NAME
                };
            }

            // Detectar caracteres inválidos o gibberish
            if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(msg)) {
                return {
                    message: "Por favor, ingresa un nombre válido (solo letras).",
                    nextState: STATES.ASK_NAME
                };
            }

            session.nombre = msg;
            return {
                message: `Gracias ${msg}.\\n\\n¿Cuál es tu número de *WhatsApp*? (para confirmación de evaluación técnica)`,
                nextState: STATES.ASK_PHONE
            };

        case STATES.ASK_PHONE:
            // Validación de teléfono peruano
            if (!msg || msg.length < 9) {
                return {
                    message: "Por favor, ingresa un número de WhatsApp válido.",
                    nextState: STATES.ASK_PHONE
                };
            }

            // Limpiar el número (quitar espacios, guiones, paréntesis)
            let cleanPhone = msg.replace(/[\s\-\(\)]/g, '');

            // Quitar prefijo +51 o 51 si lo ingresó
            cleanPhone = cleanPhone.replace(/^\+?51/, '');

            // Validar que sea solo números
            if (!/^\d+$/.test(cleanPhone)) {
                return {
                    message: "Por favor, ingresa solo números (ejemplo: 987654321).",
                    nextState: STATES.ASK_PHONE
                };
            }

            // Validar longitud (9 dígitos para celular peruano)
            if (cleanPhone.length !== 9) {
                return {
                    message: "Por favor, ingresa un número válido de 9 dígitos (ejemplo: 987654321).",
                    nextState: STATES.ASK_PHONE
                };
            }

            // Validar que empiece con 9 (celulares en Perú)
            if (!cleanPhone.startsWith('9')) {
                return {
                    message: "Por favor, ingresa un número de celular válido (debe empezar con 9).",
                    nextState: STATES.ASK_PHONE
                };
            }

            // Guardar con prefijo +51
            session.telefono = `+51${cleanPhone}`;
            return {
                message: "Perfecto.\\n\\n¿En qué *ciudad o región* se ubica el proyecto? (ejemplo: Huancayo, Lima, Junín)",
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

            // SAVE LEAD TO SUPABASE (Background)
            // No await to avoid blocking response
            // We use standard fetch if available, or construct a request if internal
            // In Vercel serverless we can just fire and forget, but to be safe we use a try-catch block wrapping a fetch
            // But since we are inside the same API structure, we can call the handler? 
            // Better to keep it decoupled via HTTP or direct save if we imported the client.
            // Let's use direct import of save logic to keep it simple and robust, OR use fetch.
            // Given Vercel restrictions on self-calling URLs during execution sometimes, 
            // and that we are already in node, let's keep it simple: 
            // We'll add a helper function `saveLeadInBackground` at the top or bottom of this file that imports the save logic or client.
            // Actually, we can just fetch the localhost URL if dev or relative URL.
            // BUT simpler: let's just create a small async function here to save.

            // (Background save removed - moved to sync handler below)

            return {
                message: `Gracias. Un especialista de TESLA continuará contigo para definir la mejor solución.\\n\\n*Resumen de tu solicitud:*\\n• Proyecto: ${session.tipo_proyecto}\\n• Etapa: ${session.etapa}\\n• Necesidad: ${session.necesidad}\\n• Ubicación: ${session.ubicacion}\\n• Contacto: ${session.telefono}\\n• Cita preferida: ${session.cita}\\n\\nEstás en buenas manos.`,
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

// Almacenamiento temporal de sesiones (en memoria)
const sessions = new Map();

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { sessionId, message } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId es requerido' });
        }

        let session = sessions.get(sessionId) || { estado: STATES.START };
        const response = processMessage(session, message);

        session.estado = response.nextState;
        sessions.set(sessionId, session);

        // SYNC SAVE: If conversation ended, save to Supabase before returning response
        if (response.nextState === STATES.END) {
            console.log('>>> [PILI] Conversation ended. Saving lead synchronously...');
            try {
                const saveLead = require('./save-lead');
                const reqSave = { body: { session }, method: 'POST' };
                const resSave = {
                    setHeader: () => { },
                    status: (code) => ({ json: (data) => console.log(`[PILI] Save result: ${code}`, data) }),
                    json: (data) => console.log(`[PILI] Save data:`, data)
                };
                await saveLead(reqSave, resSave);
                console.log('>>> [PILI] Lead saved.');
            } catch (err) {
                console.error('>>> [PILI] Error saving lead:', err);
            }
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error en /api/chat:', error);
        return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};
