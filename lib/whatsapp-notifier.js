/**
 * WhatsApp Notifier
 * Generates WhatsApp links with pre-filled messages for advisors
 */

const TESLA_WHATSAPP = '51906315961'; // Peru country code + number

/**
 * Generate WhatsApp notification link for advisor
 */
export function generateWhatsAppLink(client) {
    const message = formatLeadMessage(client);
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${TESLA_WHATSAPP}?text=${encodedMessage}`;
}

/**
 * Format lead information for WhatsApp message
 */
function formatLeadMessage(client) {
    const {
        nombre = 'No proporcionado',
        telefono = 'No proporcionado',
        tipo_proyecto = 'No especificado',
        sistemas = [],
        ciudad = 'No especificada'
    } = client;

    const sistemasText = Array.isArray(sistemas)
        ? sistemas.join(', ')
        : 'No especificados';

    return `🔔 *Nuevo lead TESLA*

*Nombre:* ${nombre}
*Proyecto:* ${tipo_proyecto}
*Sistemas:* ${sistemasText}
*Ciudad:* ${ciudad}
*WhatsApp:* ${telefono}

_Lead generado desde PILI - ${new Date().toLocaleString('es-PE')}_`;
}

/**
 * Generate client confirmation link (for client to contact TESLA)
 */
export function generateClientWhatsAppLink(nombre = '') {
    const message = `Hola, soy ${nombre}. Me gustaría coordinar una evaluación técnica para mi proyecto.`;
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${TESLA_WHATSAPP}?text=${encodedMessage}`;
}
