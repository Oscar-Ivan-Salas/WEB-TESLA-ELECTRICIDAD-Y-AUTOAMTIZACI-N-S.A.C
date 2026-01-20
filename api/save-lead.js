
const supabase = require('./supabaseClient');

module.exports = async (req, res) => {
    console.log('>>> [SAVE-LEAD] Endpoint invocado');
    console.log('>>> [SAVE-LEAD] Request body:', JSON.stringify(req.body, null, 2));
    console.log('>>> [SAVE-LEAD] Endpoint invocado');
    console.log('>>> [SAVE-LEAD] Request body:', JSON.stringify(req.body, null, 2));

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { session } = req.body;

        if (!session || !session.telefono) {
            return res.status(400).json({ error: 'Datos incompletos. Se requiere al menos teléfono.' });
        }

        // Preparar datos para inserción
        const leadData = {
            created_at: new Date().toISOString(),
            nombre: session.nombre || 'Desconocido',
            telefono: session.telefono,
            servicio_interes: session.tipo_proyecto || session.necesidad || 'General',
            etapa: session.etapa || 'No especificada',
            ubicacion: session.ubicacion || 'No especificada',
            resumen_chat: `Interés en: ${session.tipo_proyecto}. Etapa: ${session.etapa}.`,
            estado: 'Nuevo'
        };

        // Insertar en Supabase
        const { data, error } = await supabase
            .from('leads')
            .insert([leadData])
            .select();

        if (error) {
            console.error('Error Supabase:', error);
            // No fallar visiblemente al usuario si es error de BD, pero registrarlo
            return res.status(500).json({ error: 'Error guardando lead', details: error.message });
        }

        return res.status(200).json({ success: true, lead: data });

    } catch (err) {
        console.error('Error interno saving lead:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
