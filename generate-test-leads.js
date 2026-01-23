
const supabase = require('./api/supabaseClient');

// 20 usuarios de prueba realistas
const testLeads = [
    { nombre: 'Juan Carlos Pérez Rodríguez', telefono: '+51987654321', servicio: '🏗️ Obra en ejecución', etapa: '🚧 En ejecución', necesidad: '⚡ Ejecutar instalación', ubicacion: 'Lima', cita: '🌅 Mañana' },
    { nombre: 'María Elena Gonzales Torres', telefono: '+51976543210', servicio: '🤖 Automatización / Domótica', etapa: '💡 Idea / Perfil', necesidad: '📋 Evaluar solución técnica', ubicacion: 'Arequipa', cita: '🕐 Tarde' },
    { nombre: 'Roberto Carlos Sánchez Vega', telefono: '+51965432109', servicio: '🚨 Sistemas contra incendios', etapa: '🚧 En ejecución', necesidad: '⚡ Ejecutar instalación', ubicacion: 'Cusco', cita: '📅 Fin de semana' },
    { nombre: 'Ana Patricia Flores Mendoza', telefono: '+51954321098', servicio: '🔧 Mantenimiento / Remodelación', etapa: '🔧 Mantenimiento', necesidad: '🔧 Resolver fallas', ubicacion: 'Trujillo', cita: '🌅 Mañana' },
    { nombre: 'Luis Alberto Ramírez Castro', telefono: '+51943210987', servicio: '🏗️ Acabados técnicos', etapa: '✅ Etapa final / Cierre', necesidad: '🔑 Solución completa llave en mano', ubicacion: 'Chiclayo', cita: '🕐 Tarde' },
    { nombre: 'Carmen Rosa Díaz Paredes', telefono: '+51932109876', servicio: '🧩 Solución integral TESLA', etapa: '💡 Idea / Perfil', necesidad: '📋 Evaluar solución técnica', ubicacion: 'Piura', cita: '🌅 Mañana' },
    { nombre: 'Jorge Luis Vargas Huamán', telefono: '+51921098765', servicio: '🏗️ Obra en ejecución', etapa: '🚧 En ejecución', necesidad: '⚡ Ejecutar instalación', ubicacion: 'Iquitos', cita: '📅 Fin de semana' },
    { nombre: 'Rosa María Quispe Mamani', telefono: '+51910987654', servicio: '🤖 Automatización / Domótica', etapa: '💡 Idea / Perfil', necesidad: '📋 Evaluar solución técnica', ubicacion: 'Puno', cita: '🕐 Tarde' },
    { nombre: 'Pedro Pablo Chávez Rojas', telefono: '+51909876543', servicio: '🚨 Sistemas contra incendios', etapa: '🚧 En ejecución', necesidad: '⚡ Ejecutar instalación', ubicacion: 'Tacna', cita: '🌅 Mañana' },
    { nombre: 'Lucía Fernanda Torres Silva', telefono: '+51998765432', servicio: '🔧 Mantenimiento / Remodelación', etapa: '🔧 Mantenimiento', necesidad: '🔧 Resolver fallas', ubicacion: 'Huancayo', cita: '📅 Fin de semana' },
    { nombre: 'Miguel Ángel Herrera Campos', telefono: '+51987654320', servicio: '🏗️ Acabados técnicos', etapa: '✅ Etapa final / Cierre', necesidad: '🔑 Solución completa llave en mano', ubicacion: 'Cajamarca', cita: '🕐 Tarde' },
    { nombre: 'Patricia Isabel Morales Cruz', telefono: '+51976543219', servicio: '🧩 Solución integral TESLA', etapa: '💡 Idea / Perfil', necesidad: '📋 Evaluar solución técnica', ubicacion: 'Ayacucho', cita: '🌅 Mañana' },
    { nombre: 'Carlos Eduardo Rojas Medina', telefono: '+51965432108', servicio: '🏗️ Obra en ejecución', etapa: '🚧 En ejecución', necesidad: '⚡ Ejecutar instalación', ubicacion: 'Huaraz', cita: '📅 Fin de semana' },
    { nombre: 'Sofía Alejandra Castillo Ramos', telefono: '+51954321097', servicio: '🤖 Automatización / Domótica', etapa: '💡 Idea / Perfil', necesidad: '📋 Evaluar solución técnica', ubicacion: 'Ica', cita: '🕐 Tarde' },
    { nombre: 'Fernando José Gutiérrez Luna', telefono: '+51943210986', servicio: '🚨 Sistemas contra incendios', etapa: '🚧 En ejecución', necesidad: '⚡ Ejecutar instalación', ubicacion: 'Tumbes', cita: '🌅 Mañana' },
    { nombre: 'Gabriela Beatriz Salazar Ortiz', telefono: '+51932109875', servicio: '🔧 Mantenimiento / Remodelación', etapa: '🔧 Mantenimiento', necesidad: '🔧 Resolver fallas', ubicacion: 'Pucallpa', cita: '📅 Fin de semana' },
    { nombre: 'Ricardo Manuel Vásquez Peña', telefono: '+51921098764', servicio: '🏗️ Acabados técnicos', etapa: '✅ Etapa final / Cierre', necesidad: '🔑 Solución completa llave en mano', ubicacion: 'Tarapoto', cita: '🕐 Tarde' },
    { nombre: 'Daniela Carolina Mendoza Ríos', telefono: '+51910987653', servicio: '🧩 Solución integral TESLA', etapa: '💡 Idea / Perfil', necesidad: '📋 Evaluar solución técnica', ubicacion: 'Juliaca', cita: '🌅 Mañana' },
    { nombre: 'Andrés Felipe Núñez Salas', telefono: '+51909876542', servicio: '🏗️ Obra en ejecución', etapa: '🚧 En ejecución', necesidad: '⚡ Ejecutar instalación', ubicacion: 'Sullana', cita: '📅 Fin de semana' },
    { nombre: 'Valeria Cristina Paredes Flores', telefono: '+51998765431', servicio: '🤖 Automatización / Domótica', etapa: '💡 Idea / Perfil', necesidad: '📋 Evaluar solución técnica', ubicacion: 'Chimbote', cita: '🕐 Tarde' }
];

async function insertTestLeads() {
    console.log('🚀 Iniciando inserción de 20 leads de prueba...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < testLeads.length; i++) {
        const lead = testLeads[i];

        const leadData = {
            nombre: lead.nombre,
            telefono: lead.telefono,
            servicio_interes: lead.servicio,
            etapa: lead.etapa,
            ubicacion: lead.ubicacion,
            resumen_chat: `Proyecto: ${lead.servicio}. Etapa: ${lead.etapa}. Necesidad: ${lead.necesidad}.`,
            estado: 'Nuevo'
        };

        try {
            const { data, error } = await supabase
                .from('leads')
                .insert([leadData])
                .select();

            if (error) {
                console.error(`❌ Error insertando lead ${i + 1} (${lead.nombre}):`, error.message);
                errorCount++;
            } else {
                console.log(`✅ Lead ${i + 1}/20: ${lead.nombre} - ${lead.ubicacion}`);
                successCount++;
            }
        } catch (err) {
            console.error(`❌ Excepción en lead ${i + 1}:`, err.message);
            errorCount++;
        }

        // Pequeño delay para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n📊 Resumen:');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📈 Total: ${testLeads.length}`);
}

// Ejecutar
insertTestLeads()
    .then(() => {
        console.log('\n✅ Proceso completado.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Error fatal:', err);
        process.exit(1);
    });
