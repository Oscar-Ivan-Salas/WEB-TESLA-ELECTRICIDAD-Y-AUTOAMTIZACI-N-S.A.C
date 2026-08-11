
const supabase = require('./api/supabaseClient');

const TOTAL = 200;

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

// Últimos 3 meses: 03/05/2026 -> 03/08/2026
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

function randomDateBetween(a, b) {
    const t0 = a.getTime();
    const t1 = b.getTime();
    if (t1 <= t0) return new Date(t0 + 3600000);
    return new Date(t0 + Math.random() * (t1 - t0));
}

function randomName() {
    return pick(nombres) + ' ' + pick(apellidos) + ' ' + pick(apellidos);
}

function randomPhone() {
    return '+51 9' + rand(10000000, 99999999);
}

function buildLeads() {
    const leads = [];
    for (let i = 0; i < TOTAL; i++) {
        const created = randomDateInRange();
        const servicio = pick(services);
        const ubicacion = pick(ciudades);
        const fuente = pick(fuentes);

        // Distribución del pipeline
        const r = Math.random();
        let estado, etapa;
        if (r < 0.40) { estado = 'Nuevo'; etapa = 'Contacto inicial'; }
        else if (r < 0.65) { estado = 'Contactado'; etapa = 'Propuesta enviada'; }
        else if (r < 0.85) { estado = 'Calificado'; etapa = 'Negociación'; }
        else { estado = 'convertido'; etapa = 'Ganado'; }

        const contactadoWhatsapp = estado !== 'Nuevo' && Math.random() < 0.85;
        const respondioWhatsapp = contactadoWhatsapp && Math.random() < 0.7;
        const citaAgendada = (estado === 'Calificado' || estado === 'convertido') && Math.random() < 0.8;

        const lead = {
            nombre: randomName(),
            telefono: randomPhone(),
            servicio_interes: servicio,
            etapa: etapa,
            estado: estado,
            ubicacion: ubicacion,
            fuente: fuente,
            resumen_chat: `Solicitó información sobre ${servicio} en ${ubicacion}. Atendido por el asistente PILI.`,
            created_at: created.toISOString(),
            contactado_whatsapp: contactadoWhatsapp,
            respondio_whatsapp: respondioWhatsapp,
            cita_agendada: citaAgendada
        };

        if (contactadoWhatsapp) {
            lead.fecha_contacto = randomDateBetween(created, new Date()).toISOString();
            if (respondioWhatsapp) {
                lead.fecha_respuesta = randomDateBetween(new Date(lead.fecha_contacto), new Date()).toISOString();
            }
        }
        if (citaAgendada) {
            const base = new Date(created);
            lead.fecha_cita = new Date(base.getTime() + Math.random() * (7 * 86400000)).toISOString();
        }

        leads.push(lead);
    }
    return leads;
}

async function seed() {
    const leads = buildLeads();
    console.log(`🚀 Insertando ${leads.length} leads repartidos entre May 2026 - Ago 2026...`);

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
