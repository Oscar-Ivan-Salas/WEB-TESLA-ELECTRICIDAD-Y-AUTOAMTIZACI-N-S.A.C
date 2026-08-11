
const supabase = require('./api/supabaseClient');

const TOTAL = 300;

const services = [
    '🏗️ Obra en ejecución',
    '🤖 Automatización / Domótica',
    '🚨 Sistemas contra incendios',
    '🔧 Mantenimiento / Remodelación',
    '🏗️ Acabados técnicos',
    '🧩 Solución integral TESLA'
];

const fuentes = ['PILi_Bot', 'Web', 'WhatsApp'];

const ciudades = [
    'Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Chiclayo', 'Piura',
    'Iquitos', 'Puno', 'Tacna', 'Huancayo', 'Cajamarca', 'Ayacucho',
    'Huaraz', 'Ica', 'Tumbes', 'Pucallpa', 'Tarapoto', 'Juliaca',
    'Sullana', 'Chimbote'
];

const nombres = ['Juan', 'Carlos', 'Pedro', 'Luis', 'Maria', 'Ana', 'Lucia', 'Jorge', 'Miguel', 'Rosa',
    'Carmen', 'Jose', 'Manuel', 'David', 'Sofia', 'Fernando', 'Patricia', 'Diego', 'Andrea', 'Gabriel',
    'Daniel', 'Paola', 'Oscar', 'Vanessa', 'Cristian', 'Karla', 'Raul', 'Miluska', 'Edwin', 'Yolanda'];
const apellidos = ['Perez', 'Garcia', 'Martinez', 'Rodriguez', 'Lopez', 'Sanchez', 'Quispe', 'Mamani',
    'Rojas', 'Torres', 'Flores', 'Gutierrez', 'Huaman', 'Castillo', 'Vasquez', 'Espinoza', 'Diaz',
    'Ramos', 'Cruz', 'Salazar'];

const START = new Date('2026-05-03T00:00:00Z').getTime();
const END = new Date('2026-08-03T23:59:59Z').getTime();

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[rand(0, arr.length - 1)];
}

function randomDateInRange() {
    return new Date(START + Math.random() * (END - START));
}

function randomName() {
    return pick(nombres) + ' ' + pick(apellidos) + ' ' + pick(apellidos);
}

// Sin espacios para que wa.me funcione: +519XXXXXXXX
function randomPhone() {
    return '+519' + rand(10000000, 99999999);
}

async function seed() {
    console.log(`🚀 Insertando ${TOTAL} leads PENDIENTES de contacto por WhatsApp...`);

    const leads = [];
    for (let i = 0; i < TOTAL; i++) {
        const servicio = pick(services);
        const ubicacion = pick(ciudades);
        const created = randomDateInRange();

        leads.push({
            nombre: randomName(),
            telefono: randomPhone(),
            servicio_interes: servicio,
            etapa: 'Contacto inicial',
            estado: 'Nuevo',
            ubicacion: ubicacion,
            fuente: pick(fuentes),
            resumen_chat: `Solicitó información sobre ${servicio} en ${ubicacion}. Pendiente de contacto por WhatsApp.`,
            created_at: created.toISOString(),
            contactado_whatsapp: false,
            respondio_whatsapp: false,
            cita_agendada: false
        });
    }

    let ok = 0;
    const batchSize = 50;
    for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        const { error } = await supabase.from('leads').insert(batch);
        if (error) {
            console.error(`❌ Lote ${Math.floor(i / batchSize) + 1}:`, error.message);
        } else {
            ok += batch.length;
            console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} insertado (${ok} acumulados).`);
        }
    }
    console.log(`\n✨ Completado: ${ok}/${leads.length} leads insertados.`);
}

seed()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Error fatal:', err);
        process.exit(1);
    });
