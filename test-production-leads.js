
const https = require('https');

const PI_API_URL = 'https://web-tesla-electricidad-y-autoamtiza-psi.vercel.app/api/chat';

const USERS = [
    { name: 'Usuario Prueba 1', phone: '+51900000001', service: 'Automatización' },
    { name: 'Usuario Prueba 2', phone: '+51900000002', service: 'Electricidad Industrial' },
    { name: 'Usuario Prueba 3', phone: '+51900000003', service: 'Pozos a Tierra' },
    { name: 'Usuario Prueba 4', phone: '+51900000004', service: 'Tableros Eléctricos' },
    { name: 'Usuario Prueba 5', phone: '+51900000005', service: 'Domótica' },
    { name: 'Usuario Prueba 6', phone: '+51900000006', service: 'Cámaras de Seguridad' },
    { name: 'Usuario Prueba 7', phone: '+51900000007', service: 'Cableado Estructurado' },
    { name: 'Usuario Prueba 8', phone: '+51900000008', service: 'Certificaciones INDECI' },
    { name: 'Usuario Prueba 9', phone: '+51900000009', service: 'Montaje Electromecánico' },
    { name: 'Usuario Prueba 10', phone: '+51900000010', service: 'Consultoría Técnica' },
];

function sendChatData(user, index) {
    return new Promise((resolve, reject) => {
        const sessionId = `stress-test-${Date.now()}-${index}`;

        // Simular sesión finalizada
        const payload = JSON.stringify({
            sessionId: sessionId,
            message: "Mañana", // Finaliza con "Agendar Cita"
        });

        // Necesitamos 'pre-calentar' la sesión o enviar el estado directamente?
        // El endpoint api/chat espera un objeto de sesión existente para saber el estado.
        // Pero en la implementación actual, api/chat.js obtiene el estado de `sessions.get(sessionId)`.
        // Como es serverless (o local memory), si envío una sesión NUEVA, empezará en START.

        // ¡OJO! El servidor en Vercel NO mantiene memoria entre peticiones (Memory cache is ephemeral).
        // Así que api/chat.js usando `const sessions = new Map()` NO FUNCIONARÁ bien en Vercel para mantener estado entre llamadas http distintas si la instancia se recicla.
        // PERO para la prueba de guardado, necesitamos llegar al estado END.

        // En Vercel, si queremos probar el guardado, tenemos que simular el paso final.
        // PERO si el servidor no tiene persistencia (Redis/DB), el flujo de chat multi-step fallará en deploy.
        // Ese es otro problema potencial de arquitectura.

        // SIN EMBARGO, para probar HOY el guardado, el flujo de chat debe funcionar en una sola instancia 'caliente' o necesitamos persistencia.
        // Si el usuario dice "no se guardan", es probable que porque el Map() se borra.

        // SOLUCIÓN RAPIDA PARA TEST: 
        // Vamos a modificar el script para enviar requests secuenciales rápidos para UN usuario a ver si logra mantener la sesión en la misma instancia de Vercel (a veces funciona si es seguido).
        // O MEJOR: Vamos a llamar directamente a `save-lead.js` si es posible? No, está protegido/interno en teoría. 
        // Pero `api/save-lead.js` exporta una función, y en Vercel se despliega como ruta `/api/save-lead`.
        // ¡Podemos llamar a `/api/save-lead` directamente para probar la base de datos!

        // Vamos a probar AMBOS:
        // 1. Llamada directa a /api/save-lead (Simulando lo que haría el chat internamente).

        const dataToSave = JSON.stringify({
            session: {
                nombre: user.name,
                telefono: user.phone,
                tipo_proyecto: user.service,
                etapa: 'Stress Test',
                necesidad: 'Verificar DB',
                ubicacion: 'Remote Test',
                cita: 'Prueba Automática'
            }
        });

        const options = {
            hostname: 'tesla-landing-self.vercel.app',
            path: '/api/save-lead',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataToSave.length,
            },
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => (responseBody += chunk));
            res.on('end', () => {
                const isSuccess = res.statusCode === 200 || res.statusCode === 201;
                // Check if body is error despite 200 status (Debug mode)
                if (responseBody.includes('"error"')) {
                    console.error(`❌ User ${index + 1} (${user.name}): ERROR (Debug 200). Body: ${responseBody}`);
                } else if (isSuccess) {
                    console.log(`✅ User ${index + 1} (${user.name}): GUARDADO. Status: ${res.statusCode}. Body: ${responseBody}`);
                    resolve();
                } else {
                    console.error(`❌ User ${index + 1} (${user.name}): FALLÓ. Status: ${res.statusCode}. Body: ${responseBody}`);
                    resolve(); // Resolvemos para seguir con los otros
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ User ${index + 1}: Error de red`, e);
            resolve();
        });

        req.write(dataToSave);
        req.end();
    });
}

async function runStressTest() {
    console.log('🚀 Iniciando Stress Test (10 Usuarios) hacia PROD...');
    console.log('Target: https://tesla-landing-self.vercel.app/api/save-lead');

    // Ejecutar secuencialmente para ver logs claros (o paralelo si quieres stress real)
    // Vamos paralelo con pequeño delay para no ser baneados por rate limit si hubiera.

    for (let i = 0; i < USERS.length; i++) {
        await sendChatData(USERS[i], i);
        // Pequeño delay de 500ms
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('🏁 Stress Test Finalizado.');
}

runStressTest();
