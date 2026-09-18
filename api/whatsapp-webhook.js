/**
 * Webhook Serverless Meta WhatsApp Cloud API
 * TESLA Electricidad y Automatización S.A.C.
 * Endpoint: /api/whatsapp-webhook
 */

export default async function handler(req, res) {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'TESLA_PILI_WHATSAPP_SECRET_2026';
    const TESLA_WEB_URL = 'https://web-tesla-electricidad-y-autoamtiza-psi.vercel.app/';

    // 1. Verificación GET requerida por Meta WhatsApp Cloud API
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('✅ Webhook de Meta WhatsApp verificado correctamente');
                return res.status(200).send(challenge);
            } else {
                return res.status(403).json({ error: 'Token de verificación inválido' });
            }
        }
        return res.status(400).json({ error: 'Parámetros incompletos' });
    }

    // 2. Recepción de Eventos de Mensajes POST
    if (req.method === 'POST') {
        try {
            // 🛡️ Verificación de firma HMAC (X-Hub-Signature-256)
            const appSecret = process.env.WHATSAPP_APP_SECRET;
            const signature = req.headers['x-hub-signature-256'];
            if (appSecret && signature) {
                const crypto = require('crypto');
                const expectedSignature = 'sha256=' + crypto.createHmac('sha256', appSecret).update(JSON.stringify(req.body)).digest('hex');
                if (signature !== expectedSignature) {
                    console.error('🚫 Firma HMAC de Meta WhatsApp inválida');
                    return res.status(403).json({ error: 'Firma de seguridad inválida' });
                }
            }

            const body = req.body;

            if (body.object && body.entry) {
                for (const entry of body.entry) {
                    for (const change of entry.changes) {
                        const value = change.value;
                        if (value && value.messages && value.messages.length > 0) {
                            const message = value.messages[0];
                            const fromNumber = message.from; // Número del cliente
                            const textBody = message.text ? message.text.body.trim() : '';

                            console.log(`📲 Mensaje recibido de ${fromNumber}: "${textBody}"`);

                            // 🛡️ Filtro de Exclusión (Blacklist o mensajes irrelevantes)
                            const blacklist = (process.env.WHATSAPP_BLACKLIST || '').split(',');
                            if (blacklist.includes(fromNumber)) {
                                console.log(`🚫 Número en lista de exclusión: ${fromNumber}. Omitiendo respuesta.`);
                                continue;
                            }

                            const { getAgentForMessage, generatePiliResponse } = require('../lib/pili-multi-agent-rag.js');
                            const { buildWhatsAppWelcomeTextPayload, buildWhatsAppListPayload, buildWhatsAppCtaButtonPayload } = require('../lib/whatsapp-interactive-catalog.js');

                            // Extraer texto o selección interactiva del cliente
                            let incomingQuery = textBody;
                            if (message.type === 'interactive') {
                                if (message.interactive.type === 'list_reply') {
                                    incomingQuery = message.interactive.list_reply.title || message.interactive.list_reply.id;
                                } else if (message.interactive.type === 'button_reply') {
                                    incomingQuery = message.interactive.button_reply.title;
                                }
                            }

                            // Si el cliente pide "catalogo", "menu", "servicios" o saluda por primera vez -> Enviar Mensaje con Preview Card + Menú
                            const isCatalogRequest = !textBody || ['hola', 'menu', 'catálogo', 'catalogo', 'servicios', 'inicio'].some(kw => incomingQuery.toLowerCase().includes(kw));

                            let payloadToMeta = null;

                            if (isCatalogRequest) {
                                // 1. Despachar Mensaje Corporativo con preview_url: true para cargar la tarjeta con el Logo oficial de TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.
                                payloadToMeta = buildWhatsAppWelcomeTextPayload(fromNumber);
                            } else {
                                // 2. Despachar Respuesta RAG de Especialista con Botón CTA directo a la Web
                                const agente = getAgentForMessage(incomingQuery);
                                const respuestaPili = generatePiliResponse(agente, incomingQuery);
                                payloadToMeta = buildWhatsAppCtaButtonPayload(fromNumber, `🤖 [${agente.name}]`, respuestaPili, '#projects');
                            }

                            // 📤 Enviar mensaje a través de Meta API
                            if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
                                await fetch(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(payloadToMeta)
                                });
                            }
                        }
                    }
                }
            }

            return res.status(200).json({ status: 'EVENT_RECEIVED' });
        } catch (error) {
            console.error('❌ Error procesando webhook de WhatsApp:', error);
            return res.status(500).json({ error: 'Error interno del webhook' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
