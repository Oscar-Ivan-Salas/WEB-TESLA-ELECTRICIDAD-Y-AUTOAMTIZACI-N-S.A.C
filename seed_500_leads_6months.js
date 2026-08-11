
const supabase = require('./api/supabaseClient');

const TOTAL = 500;

const services = [
    '🏗️ Obra en ejecución',
    '🤖 Automatización / Domótica',
    '🚨 Sistemas contra incendios',
    '🔧 Mantenimiento / Remodelación',
    '🏗️ Acabados técnicos',
    '🧩 Solución integral TESLA'
];

const fuentes = ['PILi_Bot', 'Web', 'WhatsApp', 'Referido'];

const ciudades = [
    'Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Chiclayo', 'Piura',
    'Iquitos', 'Puno', 'Tacna', 'Huancayo', 'Cajamarca', 'Ayacucho',
    'Huaraz', 'Ica', 'Tumbes', 'Pucallpa', 'Tarapoto', 'Juliaca',
    'Sullana', 'Chimbote', 'Moyobamba', 'Puerto Maldonado'
];

const nombres = ['Juan', 'Carlos', 'Pedro', 'Luis', 'Maria', 'Ana', 'Lucia', 'Jorge', 'Miguel', 'Rosa',
    'Carmen', 'Jose', 'Manuel', 'David', 'Sofia', 'Fernando', 'Patricia', 'Diego', 'Andrea', 'Gabriel',
    'Daniel', 'Paola', 'Oscar', 'Vanessa', 'Cristian', 'Karla', 'Raul', 'Miluska', 'Edwin', 'Yolanda',
    'Ricardo', 'Fernanda', 'Sergio', 'Natalia', 'Hugo', 'Alejandra', 'Marco', 'Eliana', 'Pablo', 'Xiomara',
    'Renzo', 'Camila', 'Julio', 'Lorena', 'Esteban', 'Brenda', 'Alvaro', 'Katherine', 'Cesar', 'Fiorella'];

const apellidos = ['Perez', 'Garcia', 'Martinez', 'Rodriguez', 'Lopez', 'Sanchez', 'Quispe', 'Mamani',
    'Rojas', 'Torres', 'Flores', 'Gutierrez', 'Huaman', 'Castillo', 'Vasquez', 'Espinoza', 'Diaz',
    'Ramos', 'Cruz', 'Salazar', 'Vilca', 'Chavez', 'Aguilar', 'Cardenas', 'Silva'];

// Últimos 6 meses: 03/02/2026 -> 03/08/2026 (puntos de corte mensuales)
const CUTS = [
    new Date('2026-02-03T00:00:00Z').getTime(),
    new Date('2026-03-03T00:00:00Z').getTime(),
    new Date('2026-04-03T00:00:00Z').getTime(),
    new Date('2026-05-03T00:00:00Z').getTime(),
    new Date('2026-06-03T00:00:00Z').getTime(),
    new Date('2026-07-03T00:00:00Z').getTime(),
    new Date('2026-08-03T23:59:59Z').getTime()
];

// Peso por mes: más reciente = más volumen (12,14,15,17,20,22)
const MONTH_WEIGHTS = [0.12, 0.14, 0.15, 0.17, 0.20, 0.22];

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[rand(0, arr.length - 1)];
}

function randomDateInRange() {
    // Elegir mes ponderado
    const totalW = MONTH_WEIGHTS.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalW;
    let monthIdx = 0;
    for (let i = 0; i < MONTH_WEIGHTS.length; i++) {
        r -= MONTH_WEIGHTS[i];
        if (r <= 0) { monthIdx = i; break; }
    }
    const t0 = CUTS[monthIdx];
    const t1 = CUTS[monthIdx + 1];
    return new Date(t0 + Math.random() * (t1 - t0));
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

// Formato sin espacios: +519XXXXXXXX (requerido por el enlace wa.me del dashboard)
function randomPhone() {
    return '+519' + rand(10000000, 99999999);
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
        else if (r < 0.63) { estado = 'Contactado'; etapa = 'Propuesta enviada'; }
        else if (r < 0.80) { estado = 'Calificado'; etapa = 'Negociación'; }
        else if (r < 0.93) { estado = 'convertido'; etapa = 'Ganado'; }
        else { estado = 'perdido'; etapa = 'Perdido'; }

        const contactadoWhatsapp = estado !== 'Nuevo' && estado !== 'perdido' && Math.random() < 0.85;
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
            resumen_chat: `Solicitó información sobre ${servicio} en ${ubicacion}. Atendido por el asistente PILI y derivado al área comercial de TESLA.`,
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
            const fechaCita = new Date(base.getTime() + Math.random() * (7 * 86400000));
            lead.fecha_cita = fechaCita.toISOString();
            lead.cita = 'Si';
        }

        leads.push(lead);
    }
    return leads;
}

async function seed() {
    const leads = buildLeads();
    console.log(`🚀 Insertando ${leads.length} leads repartidos entre Feb 2026 - Ago 2026...`);

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
