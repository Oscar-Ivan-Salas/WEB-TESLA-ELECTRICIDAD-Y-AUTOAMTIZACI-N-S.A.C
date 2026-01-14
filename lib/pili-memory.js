/**
 * PILI Memory - Database Operations
 * Handles client data storage and retrieval using Vercel KV
 */

import { kv } from '@vercel/kv';

export class PILIMemory {
    constructor() {
        this.prefix = 'pili:client:';
    }

    /**
     * Get client data by session ID
     */
    async getClient(sessionId) {
        try {
            const key = `${this.prefix}${sessionId}`;
            const client = await kv.get(key);
            return client;
        } catch (error) {
            console.error('Error getting client:', error);
            return null;
        }
    }

    /**
     * Create new client session
     */
    async createClient(sessionId) {
        try {
            const client = {
                sessionId,
                estado: 'INICIO',
                fecha_primer_contacto: new Date().toISOString(),
                ultima_interaccion: new Date().toISOString(),
                conversacion: []
            };

            const key = `${this.prefix}${sessionId}`;
            await kv.set(key, client);

            return client;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    }

    /**
     * Update client data
     */
    async updateClient(sessionId, updates) {
        try {
            const key = `${this.prefix}${sessionId}`;
            const client = await kv.get(key);

            if (!client) {
                throw new Error('Client not found');
            }

            const updatedClient = {
                ...client,
                ...updates,
                ultima_interaccion: new Date().toISOString()
            };

            await kv.set(key, updatedClient);

            return updatedClient;
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    }

    /**
     * Get all clients (for admin/reporting)
     */
    async getAllClients() {
        try {
            const keys = await kv.keys(`${this.prefix}*`);
            const clients = await Promise.all(
                keys.map(key => kv.get(key))
            );
            return clients.filter(c => c !== null);
        } catch (error) {
            console.error('Error getting all clients:', error);
            return [];
        }
    }

    /**
     * Get qualified leads (estado = LEAD_CALIFICADO)
     */
    async getQualifiedLeads() {
        try {
            const allClients = await this.getAllClients();
            return allClients.filter(c => c.estado === 'LEAD_CALIFICADO');
        } catch (error) {
            console.error('Error getting qualified leads:', error);
            return [];
        }
    }

    /**
     * Delete client data (GDPR compliance)
     */
    async deleteClient(sessionId) {
        try {
            const key = `${this.prefix}${sessionId}`;
            await kv.del(key);
            return true;
        } catch (error) {
            console.error('Error deleting client:', error);
            return false;
        }
    }
}
