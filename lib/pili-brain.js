/**
 * PILI Brain - State Machine Logic
 * Handles conversation flow and state transitions
 */

import { generateWhatsAppLink } from './whatsapp-notifier.js';

// Conversation states
export const STATES = {
    INICIO: 'INICIO',
    TIPO_PROYECTO: 'TIPO_PROYECTO',
    SISTEMAS: 'SISTEMAS',
    UBICACION: 'UBICACION',
    DATOS_CLIENTE: 'DATOS_CLIENTE',
    AGENDA: 'AGENDA',
    LEAD_CALIFICADO: 'LEAD_CALIFICADO',
    ATENCION_HUMANA: 'ATENCION_HUMANA'
};

export class PILIBrain {
    constructor(memory) {
        this.memory = memory;
    }

    /**
     * Process user message based on current state
     */
    async processMessage(client, message) {
        const currentState = client.estado || STATES.INICIO;

        // Check if returning client
        if (currentState === STATES.INICIO && client.nombre) {
            return this.handleReturningClient(client);
        }

        // Route to appropriate state handler
        switch (currentState) {
            case STATES.INICIO:
                return this.handleInicio(client, message);

            case STATES.TIPO_PROYECTO:
                return this.handleTipoProyecto(client, message);

            case STATES.SISTEMAS:
                return this.handleSistemas(client, message);

            case STATES.UBICACION:
                return this.handleUbicacion(client, message);

            case STATES.DATOS_CLIENTE:
                return this.handleDatosCliente(client, message);

            case STATES.AGENDA:
                return this.handleAgenda(client, message);

            case STATES.LEAD_CALIFICADO:
                return this.handleLeadCalificado(client, message);

            case STATES.ATENCION_HUMANA:
                return this.handleAtencionHumana(client, message);

            default:
                return this.handleInicio(client, message);
        }
    }

    /**
     * INICIO - Welcome message
     */
    handleInicio(client, message) {
        return {
            message: `Hola, soy PILI, la asistente técnica de TESLA Electricidad y Automatización S.A.C.

Te ayudaré a evaluar tu proyecto y coordinar una revisión técnica.

¿Qué tipo de proyecto estás evaluando?`,
            nextState: STATES.TIPO_PROYECTO,
            options: ['Residencial', 'Comercial', 'Industrial', 'Otro'],
            requiresInput: true
        };
    }

    /**
     * TIPO_PROYECTO - Capture project type
     */
    handleTipoProyecto(client, message) {
        const validTypes = ['residencial', 'comercial', 'industrial', 'otro'];
        const tipo = message.toLowerCase().trim();

        if (!validTypes.includes(tipo)) {
            return {
                message: 'Por favor selecciona una opción válida: Residencial, Comercial, Industrial u Otro.',
                nextState: STATES.TIPO_PROYECTO,
                options: ['Residencial', 'Comercial', 'Industrial', 'Otro'],
                requiresInput: true
            };
        }

        return {
            message: `Perfecto, proyecto ${message}.

¿Qué sistemas necesitas integrar en tu proyecto?

Puedes seleccionar varios:`,
            nextState: STATES.SISTEMAS,
            options: [
                'Electricidad',
                'Automatización / Domótica',
                'Sistemas contra incendios',
                'Seguridad electrónica',
                'Acabados técnicos'
            ],
            requiresInput: true,
            data: { tipo_proyecto: message }
        };
    }

    /**
     * SISTEMAS - Capture required systems
     */
    handleSistemas(client, message) {
        // Accept comma-separated or numbered list
        const sistemas = message.split(/[,\n]/).map(s => s.trim()).filter(s => s);

        if (sistemas.length === 0) {
            return {
                message: 'Por favor indica al menos un sistema que necesites.',
                nextState: STATES.SISTEMAS,
                options: [
                    'Electricidad',
                    'Automatización / Domótica',
                    'Sistemas contra incendios',
                    'Seguridad electrónica',
                    'Acabados técnicos'
                ],
                requiresInput: true
            };
        }

        return {
            message: `Entendido. Sistemas: ${sistemas.join(', ')}.

¿En qué ciudad se desarrollará el proyecto?`,
            nextState: STATES.UBICACION,
            requiresInput: true,
            data: { sistemas }
        };
    }

    /**
     * UBICACION - Capture project location
     */
    handleUbicacion(client, message) {
        if (message.trim().length < 3) {
            return {
                message: 'Por favor indica la ciudad donde se desarrollará el proyecto.',
                nextState: STATES.UBICACION,
                requiresInput: true
            };
        }

        return {
            message: `Proyecto en ${message}.

Para continuar, indícame por favor tu nombre completo y un número de WhatsApp de contacto.

Ejemplo: Juan Pérez - 906315961`,
            nextState: STATES.DATOS_CLIENTE,
            requiresInput: true,
            data: { ciudad: message }
        };
    }

    /**
     * DATOS_CLIENTE - Capture client name and phone
     */
    handleDatosCliente(client, message) {
        // Try to extract name and phone
        const parts = message.split(/[-–—]/).map(p => p.trim());

        if (parts.length < 2) {
            return {
                message: 'Por favor proporciona tu nombre completo y WhatsApp separados por un guion.\n\nEjemplo: Juan Pérez - 906315961',
                nextState: STATES.DATOS_CLIENTE,
                requiresInput: true
            };
        }

        const nombre = parts[0];
        const telefono = parts[1].replace(/\D/g, ''); // Remove non-digits

        if (telefono.length < 9) {
            return {
                message: 'El número de WhatsApp parece incorrecto. Por favor verifica.\n\nEjemplo: Juan Pérez - 906315961',
                nextState: STATES.DATOS_CLIENTE,
                requiresInput: true
            };
        }

        return {
            message: `Gracias, ${nombre}.

Un asesor técnico puede comunicarse contigo para coordinar la evaluación.

¿Te parece bien?`,
            nextState: STATES.AGENDA,
            options: ['Sí', 'Más adelante'],
            requiresInput: true,
            data: { nombre, telefono }
        };
    }

    /**
     * AGENDA - Confirm contact
     */
    handleAgenda(client, message) {
        const response = message.toLowerCase().trim();

        if (response.includes('sí') || response.includes('si') || response === 's') {
            // Generate WhatsApp notification link
            const whatsappLink = generateWhatsAppLink(client);

            return {
                message: `Gracias. Tu información ha sido registrada.

Un asesor técnico de TESLA se comunicará contigo vía WhatsApp.`,
                nextState: STATES.LEAD_CALIFICADO,
                requiresInput: false,
                whatsappLink
            };
        } else {
            return {
                message: `Entendido. Tu información quedó registrada. Cuando estés listo, puedes contactarnos al 906 315 961.

¡Gracias por tu interés en TESLA!`,
                nextState: STATES.LEAD_CALIFICADO,
                requiresInput: false
            };
        }
    }

    /**
     * LEAD_CALIFICADO - Lead qualified, waiting for human attention
     */
    handleLeadCalificado(client, message) {
        return {
            message: `Tu solicitud ya fue registrada. Un asesor técnico se comunicará contigo pronto.

Si necesitas atención inmediata, puedes escribirnos al WhatsApp 906 315 961.`,
            nextState: STATES.ATENCION_HUMANA,
            requiresInput: false
        };
    }

    /**
     * ATENCION_HUMANA - Blocked until human advisor takes over
     */
    handleAtencionHumana(client, message) {
        return {
            message: `Un asesor técnico ya tiene tu información y se comunicará contigo.

WhatsApp TESLA: 906 315 961`,
            nextState: STATES.ATENCION_HUMANA,
            requiresInput: false
        };
    }

    /**
     * Handle returning client
     */
    handleReturningClient(client) {
        return {
            message: `Hola ${client.nombre}, retomamos la conversación sobre tu proyecto ${client.tipo_proyecto || ''} en ${client.ciudad || ''}.

¿En qué puedo ayudarte hoy?`,
            nextState: client.estado,
            requiresInput: true
        };
    }
}
