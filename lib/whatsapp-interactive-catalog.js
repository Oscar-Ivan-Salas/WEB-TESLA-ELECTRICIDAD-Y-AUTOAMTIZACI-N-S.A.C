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
                text: 'Estimada Dirección / Gerencia de Proyecto, le invitamos a seleccionar la especialidad técnica de su interés para consultar la ficha ejecutiva y casos de éxito:'
            },
            footer: {
                text: 'TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.'
            },
            action: {
                button: '📑 Catálogo Ejecutivo',
                sections: [
                    {
                        title: 'Especialidades de Ingeniería & Construcción',
                        rows: [
                            { id: 'cat_electricidad', title: '1. Elec. & Pozos Tierra', description: 'Tableros IEC 61439/NEMA, Pozos <25Ω CNE' },
                            { id: 'cat_automatizacion', title: '2. BMS & Control HVAC', description: 'Integración Modbus/BACnet/KNX' },
                            { id: 'cat_incendios', title: '3. Redes Contra Incendio', description: 'Centrales NFPA 72, Bombas UL/FM' },
                            { id: 'cat_seguridad', title: '4. CCTV IP 4K & Accesos', description: 'Videovigilancia analítica con IA' },
                            { id: 'cat_acabados', title: '5. Acabados Técnicos', description: 'Drywall RF/RH, Cielos Acústicos Data Center' },
                            { id: 'cat_itse', title: '6. Expedientes ITSE', description: 'Defensa Civil Riesgo Alto/Muy Alto' },
                            { id: 'cat_bim_mep', title: '7. Coordinación BIM MEP', description: 'Modelado 3D Revit/Navisworks LOD 400' },
                            { id: 'cat_integral', title: '8. Llave en Mano 360°', description: 'Gestión Unificada EPC / Contratista Único' }
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

/**
 * 0. Genera el Payload de Texto Inicial con PREVIEW_URL activado para cargar la Tarjeta Corporativa con Logo
 */
function buildWhatsAppWelcomeTextPayload(toPhoneNumber) {
    return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhoneNumber,
        type: 'text',
        text: {
            preview_url: true,
            body: `${TESLA_WEB_URL}\n\n🏢 *TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.*\n🏛️ *DIRECCIÓN DE INGENIERÍA & PROYECTOS CORPORATIVOS*\n\nHola 👋 Gracias por contactar a *TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.*\nSomos integradores estratégicos de soluciones técnicas para tu proyecto.\n\nPara orientarle de forma inmediata, responda con el número de la opción o seleccione de nuestro menú:\n\n1️⃣ *Elec. & Pozos Tierra* (<25Ω CNE)\n2️⃣ *Automatización & BMS* (Modbus/BACnet)\n3️⃣ *Sistemas Incendios* (NFPA 72/13)\n4️⃣ *Seguridad 24/7 CCTV IP 4K*\n5️⃣ *Acabados Técnicos & Cielos Rasos*\n6️⃣ *Expediente Técnico ITSE / Defensa Civil*\n7️⃣ *Coordinación BIM MEP 3D* (LOD 400)\n8️⃣ *Solución Llave en Mano 360°* (EPC)`
        }
    };
}

module.exports = {
    buildWhatsAppWelcomeTextPayload,
    buildWhatsAppListPayload,
    buildWhatsAppCtaButtonPayload,
    buildTelegramKeyboardPayload
};
