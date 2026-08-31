/**
 * Módulo de Catálogos Interactivos con Botones & Menús Desplegables
 * TESLA Electricidad y Automatización S.A.C.
 * Compatible con Meta WhatsApp Cloud API & Telegram Bot API
 */

const TESLA_WEB_URL = 'https://web-tesla-electricidad-y-autoamtiza-psi.vercel.app/';

/**
 * 1. Genera el Payload de MENÚ DESPLEGABLE DE LISTA INTERACTIVA para WhatsApp Meta Cloud API
 */
function buildWhatsAppListPayload(toPhoneNumber) {
    return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhoneNumber,
        type: 'interactive',
        interactive: {
            type: 'list',
            header: {
                type: 'text',
                text: '🏢 TESLA ELECTRICIDAD Y AUTOMATIZACIÓN'
            },
            body: {
                text: 'Estimado cliente, seleccione uno de nuestros 8 servicios de ingeniería para recibir la ficha técnica y la galeria de fotos de obras:'
            },
            footer: {
                text: 'TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.'
            },
            action: {
                button: '📑 Ver Catálogo',
                sections: [
                    {
                        title: 'Especialidades de Ingeniería',
                        rows: [
                            { id: 'cat_electricidad', title: '1. Elec. & Pozos Tierra', description: 'Tableros CNE/IEC, Pozo a tierra <5Ω' },
                            { id: 'cat_automatizacion', title: '2. Automatización & BMS', description: 'Control HVAC, Modbus/BACnet' },
                            { id: 'cat_incendios', title: '3. Sistemas Incendios', description: 'Centrales NFPA 72, Bombas UL/FM' },
                            { id: 'cat_seguridad', title: '4. Seguridad 24/7 CCTV', description: 'Cálculo de cámaras IP 4K con IA' },
                            { id: 'cat_acabados', title: '5. Acabados Técnicos', description: 'Drywall RF/RH, Cielos Acústicos' },
                            { id: 'cat_itse', title: '6. Certificación ITSE', description: 'Defensa Civil, Levantamiento Multas' },
                            { id: 'cat_bim_mep', title: '7. Coordinación BIM MEP', description: 'Navisworks 3D, Detección Choques' },
                            { id: 'cat_integral', title: '8. Llave en Mano 360°', description: 'Gestión Integral Unificada' }
                        ]
                    }
                ]
            }
        }
    };
}

/**
 * 2. Genera el Payload de BOTÓN CTA CON LINK A LA WEB ESPECÍFICA para WhatsApp
 */
function buildWhatsAppCtaButtonPayload(toPhoneNumber, headerTitle, bodyText, urlAnchor = '') {
    const fullUrl = `${TESLA_WEB_URL}${urlAnchor}`;

    return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhoneNumber,
        type: 'interactive',
        interactive: {
            type: 'cta_url',
            header: {
                type: 'text',
                text: headerTitle || '🏢 TESLA ELECTRICIDAD Y AUTOMATIZACIÓN'
            },
            body: {
                text: bodyText
            },
            footer: {
                text: 'TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.'
            },
            action: {
                name: 'cta_url',
                parameters: {
                    display_text: '🌐 Ver en Catálogo Web',
                    url: fullUrl
                }
            }
        }
    };
}

/**
 * 3. Genera la Estructura de BOTONES INTERACTIVOS (Inline Keyboard) para TELEGRAM
 */
function buildTelegramKeyboardPayload(chatId, textMessage) {
    return {
        chat_id: chatId,
        text: textMessage,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⚡ Eléctrica', callback_data: 'cat_electricidad' },
                    { text: '🤖 BMS & Control', callback_data: 'cat_automatizacion' }
                ],
                [
                    { text: '🚨 Incendios NFPA', callback_data: 'cat_incendios' },
                    { text: '🛡️ Seguridad 4K', callback_data: 'cat_seguridad' }
                ],
                [
                    { text: '📜 ITSE Defensa Civil', callback_data: 'cat_itse' },
                    { text: '📐 BIM MEP 3D', callback_data: 'cat_bim_mep' }
                ],
                [
                    { text: '🌐 Abrir Catálogo Web Oficial', url: `${TESLA_WEB_URL}#projects` }
                ]
            ]
        }
    };
}

module.exports = {
    buildWhatsAppListPayload,
    buildWhatsAppCtaButtonPayload,
    buildTelegramKeyboardPayload
};
