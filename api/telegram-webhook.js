/**
 * Webhook Serverless Telegram Bot API
 * TESLA Electricidad y Automatización S.A.C.
 * Endpoint: /api/telegram-webhook
 */

const { getAgentForMessage, generatePiliResponse } = require('../lib/pili-multi-agent-rag.js');
const { buildTelegramKeyboardPayload } = require('../lib/whatsapp-interactive-catalog.js');

export default async function handler(req, res) {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    if (req.method === 'POST') {
        try {
            const update = req.body;

            let chatId = null;
            let textMessage = '';

            // 1. Mensaje de Texto Normal en Telegram
            if (update.message) {
                chatId = update.message.chat.id;
                textMessage = update.message.text || '';
            } 
            // 2. Clic en Botón de Inline Keyboard (Callback Query)
            else if (update.callback_query) {
                chatId = update.callback_query.message.chat.id;
                textMessage = update.callback_query.data || '';
            }

            if (chatId && textMessage) {
                const agente = getAgentForMessage(textMessage);
                const respuestaPili = generatePiliResponse(agente, textMessage);

                const payload = buildTelegramKeyboardPayload(chatId, respuestaPili);

                if (TELEGRAM_BOT_TOKEN) {
                    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }
            }

            return res.status(200).json({ status: 'OK' });
        } catch (error) {
            console.error('❌ Error procesando webhook de Telegram:', error);
            return res.status(500).json({ error: 'Error interno del webhook de Telegram' });
        }
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
