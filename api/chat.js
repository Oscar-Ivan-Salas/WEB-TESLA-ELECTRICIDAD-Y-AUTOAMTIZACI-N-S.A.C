/**
 * PILI Chatbot - Main API Endpoint
 * Handles all chat interactions with state machine logic
 */

import { PILIBrain } from '../lib/pili-brain.js';
import { PILIMemory } from '../lib/pili-memory.js';

export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, sessionId } = req.body;

        // Validate input
        if (!message || !sessionId) {
            return res.status(400).json({
                error: 'Missing required fields: message and sessionId'
            });
        }

        // Initialize PILI components
        const memory = new PILIMemory();
        const brain = new PILIBrain(memory);

        // Get or create client session
        let client = await memory.getClient(sessionId);

        if (!client) {
            // New client - initialize
            client = await memory.createClient(sessionId);
        }

        // Process message through PILI brain
        const response = await brain.processMessage(client, message);

        // Update client state and conversation history
        await memory.updateClient(sessionId, {
            estado: response.nextState,
            ultima_interaccion: new Date().toISOString(),
            conversacion: [
                ...(client.conversacion || []),
                { role: 'user', message, timestamp: new Date().toISOString() },
                { role: 'pili', message: response.message, timestamp: new Date().toISOString() }
            ],
            ...response.data // Additional data collected (nombre, telefono, etc.)
        });

        // Return response to frontend
        return res.status(200).json({
            message: response.message,
            state: response.nextState,
            options: response.options || null,
            requiresInput: response.requiresInput || false,
            whatsappLink: response.whatsappLink || null
        });

    } catch (error) {
        console.error('PILI Chat Error:', error);
        return res.status(500).json({
            error: 'Error procesando mensaje',
            message: 'Lo siento, hubo un error. Por favor intenta nuevamente.'
        });
    }
}
