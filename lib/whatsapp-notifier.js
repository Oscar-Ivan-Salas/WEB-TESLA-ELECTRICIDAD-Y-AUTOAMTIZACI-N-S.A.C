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
 * Genera la notificación de lead estructurada para los ingenieros de TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.
 */
export function generateWhatsAppLink(client) {
    const message = formatLeadMessage(client);
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${TESLA_WHATSAPP}?text=${encodedMessage}`;
}

/**
 * Formato Corporativo Institucional de Lead para WhatsApp Business
 */
function formatLeadMessage(client) {
    const {
        nombre = 'No especificado',
        telefono = 'No especificado',
        tipo_proyecto = 'Proyecto Eléctrico & Automatización Industrial',
        sistemas = [],
        ciudad = 'Perú'
    } = client;

    const sistemasText = Array.isArray(sistemas) && sistemas.length > 0
        ? sistemas.join(', ')
        : 'Soluciones Integradas MEP (IEC / NEMA / NFPA)';

    return `🏢 *TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.*
🏛️ *DIRECCIÓN DE INGENIERÍA & PROYECTOS CORPORATIVOS*

📋 *SOLICITUD DE EVALUACIÓN TÉCNICA - REGISTRO WEB*

▪️ *Empresa / Cliente:* ${nombre}
▪️ *Tipo de Infraestructura:* ${tipo_proyecto}
▪️ *Especialidades Requeridas:* ${sistemasText}
▪️ *Ubicación de Obra:* ${ciudad}
▪️ *Contacto Directo:* ${telefono}

🌐 *Portal Corporativo Oficial:* ${TESLA_WEB_URL}
⚡ *Garantía de Conformidad:* Medición Pozo a Tierra < 25 Ω (Regla 060-712 CNE) | Expediente ITSE

_Atendido por PILI_agente | Sistema Integrado de Gestión TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C._`;
}
