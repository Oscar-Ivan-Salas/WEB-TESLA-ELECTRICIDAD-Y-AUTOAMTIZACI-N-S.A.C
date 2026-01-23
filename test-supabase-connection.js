
const supabase = require('./api/supabaseClient');

async function testConnection() {
    console.log('>>> [TEST] Iniciando prueba de conexión a Supabase...');

    const testLead = {
        nombre: 'Test User Debug',
        telefono: '+51999999999',
        servicio_interes: 'Prueba de Conexión',
        etapa: 'Debug',
        ubicacion: 'Localhost',
        resumen_chat: 'Prueba manual desde script',
        estado: 'Test'
    };

    try {
        const { data, error } = await supabase
            .from('leads')
            .insert([testLead])
            .select();

        if (error) {
            console.error('>>> [TEST] ❌ ERROR de Supabase:', error);
            console.error('>>> [TEST] Detalle:', error.message);
            console.log('>>> [TEST] Verifica si la KEY es correcta (debe ser la "anon public" - suele empezar por eyJ...)');
        } else {
            console.log('>>> [TEST] ✅ ÉXITO: Lead guardado correctamente.');
            console.log('>>> [TEST] Data:', data);
        }
    } catch (err) {
        console.error('>>> [TEST] ❌ Excepción crítica:', err);
    }
}

testConnection();
