
const supabase = require('./api/supabaseClient');

// Datos de prueba para generación
const services = [
    'Instalación eléctrica domiciliaria',
    'Instalación eléctrica industrial',
    'Mantenimiento de tableros',
    'Pozo a tierra',
    'Automatización de bombas',
    'Cámaras de seguridad',
    'Sistema contra incendios',
    'Cableado estructurado',
    'Certificación INDECI'
];

const ubicacionesHuancayo = ['Huancayo', 'El Tambo', 'Chilca', 'San Carlos', 'Pilcomayo', 'Huancan', 'Sapallanga'];
const ubicacionesOtros = ['Lima', 'Arequipa', 'Trujillo', 'Jauja', 'Concepción', 'La Oroya', 'Tarma'];

const nombres = ['Juan', 'Carlos', 'Pedro', 'Luis', 'Maria', 'Ana', 'Lucia', 'Jorge', 'Miguel', 'Rosa', 'Carmen', 'Jose', 'Manuel', 'David', 'Sofia', 'Fernando', 'Patricia', 'Diego', 'Andrea', 'Gabriel'];
const apellidos = ['Perez', 'Garcia', 'Martinez', 'Rodriguez', 'Lopez', 'Sanchez', 'Quispe', 'Mamani', 'Rojas', 'Torres', 'Flores', 'Gutierrez', 'Huaman', 'Castillo', 'Vasquez', 'Espinoza', 'Diaz'];

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

async function seed() {
    const leads = [];
    const TOTAL = 220; // Generar un poco más para asegurar

    console.log(`🚀 Generando ${TOTAL} leads de prueba...`);
    console.log(`🎯 Criterios: 60% Huancayo, Rubro Electricidad, 10% Trabajos Realizados`);

    for (let i = 0; i < TOTAL; i++) {
        // 1. Ubicación: 60% Huancayo
        const isHuancayo = Math.random() < 0.6;
        const ubicacion = isHuancayo
            ? ubicacionesHuancayo[Math.floor(Math.random() * ubicacionesHuancayo.length)]
            : ubicacionesOtros[Math.floor(Math.random() * ubicacionesOtros.length)];

        // 2. Estado/Etapa: 10% Trabajos ya realizados (Ganado)
        let etapa, estado;
        const rEstado = Math.random();

        if (rEstado < 0.10) {
            etapa = 'Ganado';
            estado = 'convertido'; // o Cerrado
        } else {
            // Distribuir el resto
            const r = Math.random();
            if (r < 0.4) { etapa = 'Contacto inicial'; estado = 'Nuevo'; }
            else if (r < 0.7) { etapa = 'Propuesta enviada'; estado = 'Contactado'; }
            else { etapa = 'Negociación'; estado = 'Calificado'; }
        }

        // Datos Personales
        const nombre = nombres[Math.floor(Math.random() * nombres.length)] + ' ' + apellidos[Math.floor(Math.random() * apellidos.length)];
        const telefono = '+51 9' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        const servicio = services[Math.floor(Math.random() * services.length)];

        // Fecha: Enero 2026 (Desde inicio de año hasta hoy)
        const fecha = randomDate(new Date('2026-01-01'), new Date('2026-01-25')); // Asumiendo fecha actual user

        // Leads Object
        leads.push({
            nombre: nombre,
            telefono: telefono,
            // email: Eliminado, columna no existe
            servicio_interes: servicio,
            resumen_chat: `Solicito cotización para ${servicio} en ${ubicacion}.`, // Antes mensaje
            ubicacion: ubicacion,
            etapa: etapa,
            estado: estado,
            created_at: fecha,
            // fuente: Eliminado, columna no existe probablemente
            contactado_whatsapp: estado !== 'Nuevo',
            respondio_whatsapp: ['Contactado', 'Calificado', 'convertido'].includes(estado) && Math.random() < 0.7,
            cita_agendada: ['Calificado', 'convertido'].includes(estado) && Math.random() < 0.8,
            fecha_cita: ['Calificado', 'convertido'].includes(estado) && Math.random() < 0.8 ? randomDate(new Date(fecha), new Date()) : null
        });
    }

    // Insertar en lotes
    const batchSize = 50;
    for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        console.log(`📦 Insertando lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(TOTAL / batchSize)}...`);

        const { error } = await supabase.from('leads').insert(batch);

        if (error) {
            console.error('❌ Error insertando lote:', error.message);
        } else {
            console.log(`✅ ${batch.length} leads insertados.`);
        }
    }

    console.log('✨ ¡Carga masiva completada exitosamente!');
    console.log('💡 Las "Vistas a la Web" aumentarán automáticamente en el dashboard al recargar.');
}

seed();
