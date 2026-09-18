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

                            // 🎯 FILTRO DE CLIENTE NUEVO vs. CLIENTE EXISTENTE (Supabase)
                            // Si el número ya existe en Supabase (lead guardado/atendido), se omite para permitir atención manual personal.
                            const supabase = require('./supabaseClient');
                            let isExistingCustomer = false;
                            if (supabase) {
                                try {
                                    const { data: existingLead } = await supabase
                                        .from('leads')
                                        .select('id, telefono')
                                        .eq('telefono', fromNumber)
                                        .limit(1);

                                    if (existingLead && existingLead.length > 0) {
                                        isExistingCustomer = true;
                                        console.log(`ℹ️ Cliente registrado/conocido (${fromNumber}). Omitiendo respuesta automática para atención personal.`);
                                        continue; // Pasar al siguiente mensaje sin responder automáticamente
                                    }
                                } catch (dbErr) {
                                    console.warn('⚠️ No se pudo verificar cliente en Supabase, se continuará con flujo normal:', dbErr.message);
                                }
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
                                const metaUrl = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
                                console.log(`📤 Enviando mensaje a Meta WhatsApp (${fromNumber})...`);
                                const metaResponse = await fetch(metaUrl, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(payloadToMeta)
                                });
                                const metaData = await metaResponse.json();
                                if (!metaResponse.ok) {
                                    console.error('❌ Error de Meta WhatsApp API:', JSON.stringify(metaData));
                                } else {
                                    console.log('✅ Mensaje despachado con éxito por Meta:', JSON.stringify(metaData));
                                    
                                    // 📝 Registrar el nuevo número en Supabase para que las siguientes interacciones sean atendidas manualmente
                                    if (supabase) {
                                        try {
                                            const customerName = (value.contacts && value.contacts[0] && value.contacts[0].profile) ? value.contacts[0].profile.name : 'Cliente WhatsApp';
                                            await supabase.from('leads').insert([
                                                {
                                                    nombre: customerName,
                                                    telefono: fromNumber,
                                                    origen: 'WhatsApp Cloud API',
                                                    especialidad: incomingQuery || 'Contacto Inicial',
                                                    mensaje: textBody || 'Primer contacto por WhatsApp'
                                                }
                                            ]);
                                            console.log(`📌 Nuevo cliente (${fromNumber}) registrado en Supabase para atención manual posterior.`);
                                        } catch (insertErr) {
                                            console.warn('⚠️ No se pudo registrar el lead en Supabase:', insertErr.message);
                                        }
                                    }
                                }
                            } else {
                                console.warn('⚠️ No se encontraron WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN en las variables de entorno de Vercel.');
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
