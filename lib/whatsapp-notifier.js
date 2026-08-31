/**
 * WhatsApp Notifier & Integration Module
 * TESLA Electricidad y Automatización S.A.C.
 * WhatsApp Business Official: +51 906 315 961
 */

const TESLA_WHATSAPP = '51906315961';
const TESLA_WEB_URL = 'https://web-tesla-electricidad-y-autoamtiza-psi.vercel.app/';

/**
 * Genera el enlace de consulta formal del cliente hacia WhatsApp Business TESLA
 */
export function generateClientWhatsAppLink(servicio = 'Evaluación Técnica', nombre = '') {
    const saludoNombre = nombre ? `, le saluda ${nombre}` : '';
    const message = `Estimados TESLA Electricidad y Automatización S.A.C.${saludoNombre}.\n\nDeseo solicitar asistencia e información técnica formal respecto al servicio de: *${servicio}*.\n\n🌐 Portal Web: ${TESLA_WEB_URL}`;
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${TESLA_WHATSAPP}?text=${encodedMessage}`;
}

/**
 * Genera la notificación de lead estructurada para los ingenieros de TESLA S.A.C.
 */
export function generateWhatsAppLink(client) {
    const message = formatLeadMessage(client);
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${TESLA_WHATSAPP}?text=${encodedMessage}`;
}

/**
 * Formato Corporativo de Lead para WhatsApp
 */
function formatLeadMessage(client) {
    const {
        nombre = 'No especificado',
        telefono = 'No especificado',
        tipo_proyecto = 'Proyecto Eléctrico / Automatización',
        sistemas = [],
        ciudad = 'Perú'
    } = client;

    const sistemasText = Array.isArray(sistemas) && sistemas.length > 0
        ? sistemas.join(', ')
        : 'Sistemas Integrados NEMA / NFPA';

    return `🏢 *TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.*
📋 *SOLICITUD DE EVALUACIÓN TÉCNICA - LEAD WEB*

▪️ *Cliente:* ${nombre}
▪️ *Empresa / Proyecto:* ${tipo_proyecto}
▪️ *Sistemas Requeridos:* ${sistemasText}
▪️ *Ubicación:* ${ciudad}
▪️ *WhatsApp Contacto:* ${telefono}

🌐 *Catálogo Oficial:* ${TESLA_WEB_URL}
_Generado vía Agente PILI | TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C. ${new Date().toLocaleDateString('es-PE')}_`;
}
