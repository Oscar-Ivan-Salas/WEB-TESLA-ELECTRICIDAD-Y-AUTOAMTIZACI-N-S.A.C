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
        "⚡ Infraestructura Eléctrica",
        "🤖 Automatización y BMS",
        "🚨 Sistemas Contra Incendios",
        "🛡️ Vigilancia y Control 24/7",
        "🏗️ Acabados Funcionales",
        "📜 Inspección ITSE / INDECI",
        "📐 Coordinación BIM / MEP 3D",
        "🔑 Solución Llave en Mano TESLA"
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
        "🔧 Resolver fallas",
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

// Contenido profesional por categoría de proyecto — una entrada por cada opción real de OPTIONS.PROJECT_TYPE.
// Mantener esta lista sincronizada con OPTIONS.PROJECT_TYPE: cada opción debe tener su propia entrada aquí.
const PROJECT_TYPE_INFO = {
    "⚡ Infraestructura Eléctrica": {
        specialist: "Perfecto. En TESLA abordamos la electricidad como un sistema completo: desde la puesta a tierra y el diseño de tableros hasta la certificación final ante el CNE. No instalamos por partes sueltas, integramos todo para evitar fallas y sobrecostos futuros.",
        technical: "Perfecto. En estos casos revisamos la carga instalada, las protecciones eléctricas y el estado de la puesta a tierra, para evitar reprocesos y garantizar la seguridad de la instalación."
    },
    "🤖 Automatización y BMS": {
        specialist: "Excelente elección. Integramos sistemas de automatización y BMS (Schneider, Siemens, Honeywell) para climatización, iluminación y accesos, logrando ahorros de hasta 30% en consumo eléctrico con una gestión centralizada y confiable.",
        technical: "Perfecto. En estos casos evaluamos la integración de protocolos (BACnet, Modbus, KNX) y la configuración de los equipos, para que aproveche al máximo el sistema."
    },
    "🚨 Sistemas Contra Incendios": {
        specialist: "Perfecto. En TESLA diseñamos e instalamos sistemas de detección y extinción bajo normativa NFPA 72 / NFPA 13, asegurando que su edificación cumpla con todos los requisitos para proteger vidas y evitar observaciones municipales.",
        technical: "Perfecto. En estos casos revisamos el cumplimiento normativo (NFPA/INDECI), el diseño de la red contra incendios y la documentación necesaria para su certificación."
    },
    "🛡️ Vigilancia y Control 24/7": {
        specialist: "Perfecto. Implementamos videovigilancia IP 4K con analítica inteligente, control de accesos y monitoreo centralizado 24/7, para que su propiedad esté protegida en todo momento, incluso a distancia.",
        technical: "Perfecto. En estos casos evaluamos la cobertura de cámaras, los puntos ciegos y la integración con su central de monitoreo, para una protección completa."
    },
    "🏗️ Acabados Funcionales": {
        specialist: "Perfecto. Coordinamos acabados técnicos (drywall RF/RH, cielos rasos, estructuras metálicas) integrados con las instalaciones eléctricas y de seguridad, para un resultado funcional y estético sin reprocesos.",
        technical: "Perfecto. En estos casos coordinamos las instalaciones técnicas junto con el acabado final, evitando retrabajos entre especialidades."
    },
    "📜 Inspección ITSE / INDECI": {
        specialist: "Perfecto. Elaboramos el expediente técnico completo para su Certificado ITSE y acompañamos la inspección municipal, evitando observaciones, retrasos y multas.",
        technical: "Perfecto. En estos casos revisamos los planos de evacuación, señalética y aforo, para asegurar que el expediente cumpla con todos los requisitos municipales."
    },
    "📐 Coordinación BIM / MEP 3D": {
        specialist: "Excelente. Modelamos digitalmente en 3D (Revit / Navisworks) las instalaciones eléctricas, sanitarias y de climatización antes de construir, eliminando interferencias en obra y garantizando presupuestos exactos.",
        technical: "Perfecto. En estos casos realizamos la detección de interferencias (clash detection) entre especialidades antes de iniciar la obra, evitando retrabajos costosos."
    },
    "🔑 Solución Llave en Mano TESLA": {
        specialist: "Excelente decisión. Con la Solución Llave en Mano de TESLA usted tiene un solo contrato y un solo responsable para todo su proyecto — nosotros coordinamos cada especialidad para que usted no tenga que hacerlo.",
        technical: "Perfecto. En estos casos coordinamos todas las especialidades bajo un solo equipo técnico, con un único responsable del proyecto de principio a fin."
    }
};

// Encuentra la entrada de PROJECT_TYPE_INFO que corresponde al texto recibido (match exacto o parcial),
// y si no encuentra ninguna, cae a la Solución Llave en Mano para nunca dejar la respuesta vacía.
function getProjectTypeInfo(msg) {
    const text = (msg || "").toLowerCase();
    for (const key of Object.keys(PROJECT_TYPE_INFO)) {
        if (key.toLowerCase().includes(text) || text.includes(key.toLowerCase())) {
            return PROJECT_TYPE_INFO[key];
        }
    }
    return PROJECT_TYPE_INFO["🔑 Solución Llave en Mano TESLA"];
}

function processMessage(session, message) {
    const state = session.estado || STATES.START;
    const msg = message ? message.toString().trim() : "";

    switch (state) {
        case STATES.START:
            return {
                message: "Hola, soy PILi, asistente técnica de TESLA Electricidad y Automatización.\nTe ayudo a evaluar tu proyecto y orientarte hacia la mejor solución técnica, sin que tengas que coordinar múltiples proveedores.\n\nPara comenzar, cuéntame en qué área necesitas apoyo:",
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

            const specialistMessage = getProjectTypeInfo(msg).specialist;

            return {
                message: specialistMessage + "\n\n¿En qué etapa se encuentra tu proyecto?",
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

            const technicalContext = getProjectTypeInfo(session.tipo_proyecto).technical;

            return {
                message: technicalContext + "\n\n¿Qué necesitas resolver principalmente ahora? 👇",
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
                message: "Con esta información puedo orientarte correctamente y evitar reprocesos o sobrecostos.\nPara continuar, necesito registrar tus datos para que un especialista de TESLA te contacte.\n\n¿Cuál es tu nombre completo?",
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
                message: `Gracias, ${msg}.\n\n¿Cuál es tu número de *WhatsApp*? (para confirmar la evaluación técnica)`,
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
                message: `Gracias. Un especialista de TESLA se pondrá en contacto contigo para definir la mejor solución.\n\n*Resumen de tu solicitud:*\n• Proyecto: ${session.tipo_proyecto}\n• Etapa: ${session.etapa}\n• Necesidad: ${session.necesidad}\n• Ubicación: ${session.ubicacion}\n• Contacto: ${session.telefono}\n• Cita preferida: ${session.cita}\n\nEstás en buenas manos.`,
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

const https = require('https');
const { getAgentForMessage } = require('../lib/pili-multi-agent-rag');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function callGeminiAI(userPrompt, session) {
    return new Promise((resolve) => {
        const agent = getAgentForMessage(userPrompt, session ? session.agentId : null);
        if (session) {
            session.agentId = agent.id;
            session.agentName = agent.name;
        }

        const payload = JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: `${agent.systemPrompt}\n\nConsulta del cliente: "${userPrompt}"` }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 250,
                temperature: 0.7
            }
        });

        const req = https.request(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                },
                timeout: 4000
            },
            (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(body);
                        if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts[0]) {
                            const text = json.candidates[0].content.parts[0].text.trim();
                            resolve({ text, agent });
                        } else {
                            resolve(null);
                        }
                    } catch (e) {
                        resolve(null);
                    }
                });
            }
        );

        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.write(payload);
        req.end();
    });
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
        const msgStr = message ? message.toString().trim() : "";

        // CAPA HÍBRIDA IA: Si el usuario escribe una pregunta abierta fuera de las opciones fijas
        let isOptionClick = false;
        let currentOptions = null;
        if (session.estado === STATES.ASK_PROJECT_TYPE) currentOptions = OPTIONS.PROJECT_TYPE;
        else if (session.estado === STATES.ASK_STAGE) currentOptions = OPTIONS.STAGE;
        else if (session.estado === STATES.ASK_NEED) currentOptions = OPTIONS.NEED;
        else if (session.estado === STATES.ASK_APPOINTMENT) currentOptions = ["🌅 Mañana", "🕐 Tarde", "📅 Fin de semana"];

        if (currentOptions && isValidOption(msgStr, currentOptions)) {
            isOptionClick = true;
        }

        // Si es pregunta abierta (más de 5 caracteres y no es clic en botón de lista previa ni estado de captura de datos como teléfono/nombre)
        const isCapturingData = [STATES.ASK_NAME, STATES.ASK_PHONE, STATES.ASK_LOCATION].includes(session.estado);
        if (!isOptionClick && !isCapturingData && msgStr.length > 4 && msgStr.toLowerCase() !== 'hola') {
            console.log(`>>> [PILI IA] Invocando Gemini AI para consulta abierta: "${msgStr}"`);
            const aiResult = await callGeminiAI(msgStr, session);
            if (aiResult && aiResult.text) {
                console.log(`>>> [PILI IA] Respuesta de ${aiResult.agent.name} obtenida con éxito.`);
                return res.status(200).json({
                    message: aiResult.text,
                    agentName: aiResult.agent.name,
                    agentBadge: aiResult.agent.badge,
                    nextState: session.estado,
                    options: currentOptions || OPTIONS.PROJECT_TYPE,
                    whatsappLink: generateWhatsAppLink(session)
                });
            }
        }

        // Si no aplica IA o falla, procesar por autómata determinístico
        const agent = getAgentForMessage(msgStr, session.agentId);
        session.agentId = agent.id;
        session.agentName = agent.name;

        const response = processMessage(session, message);
        response.agentName = agent.name;
        response.agentBadge = agent.badge;

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
