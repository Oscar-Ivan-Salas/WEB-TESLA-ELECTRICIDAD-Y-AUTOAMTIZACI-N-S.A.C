const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Configuración básica
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bgwovsuyjajxrmkvcggn.supabase.co';

console.log('🔐 Script de Reseteo de Contraseña Admin - TESLA Dashboard');
console.log('---------------------------------------------------------');
console.log('Para usar este script necesitas tu "service_role key" (llave secreta).');
console.log('La puedes encontrar en Supabase > Project Settings > API > service_role key.\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    try {
        const secretKey = await askQuestion('👉 Ingresa tu SERVICE_ROLE KEY: ');

        if (!secretKey || secretKey.length < 20) {
            throw new Error('La llave ingresada no parece válida.');
        }

        const supabaseAdmin = createClient(SUPABASE_URL, secretKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const email = await askQuestion('📧 Ingresa el correo del admin (default: admin@tesla-electricidad.com): ') || 'admin@tesla-electricidad.com';
        const newPassword = await askQuestion('🔑 Ingresa la NUEVA contraseña: ');

        if (!newPassword || newPassword.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }

        console.log(`\n⏳ Actualizando usuario ${email}...`);

        // 1. Intentar actualizar usuario existente
        const { data: userData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            email, // Ojo: updateUserById suele pedir ID, pero updateUserByEmail no existe en todas las versiones client
            // Primero busquemos el usuario por email para obtener su ID
            { password: newPassword }
        ).catch(() => ({ error: { message: 'Método update directo falló, intentando buscar ID...' } }));

        // Nota: La librería JS admin a veces cambia. La forma más segura es listar usuarios o usar updateUser si tenemos el ID.
        // Vamos a usar 'listUsers' para encontrar el ID.

        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) throw listError;

        const user = users.users.find(u => u.email === email);

        if (user) {
            // Usuario existe, actualizamos
            const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
                user.id,
                { password: newPassword, email_confirm: true }
            );

            if (error) throw error;
            console.log(`\n✅ ¡ÉXITO! La contraseña de ${email} ha sido actualizada.`);
            console.log(`Ahora puedes iniciar sesión en login.html con: ${newPassword}`);

        } else {
            // Usuario no existe, creamos
            console.log(`\n⚠️ El usuario ${email} no existe. Creando nuevo admin...`);

            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                password: newPassword,
                email_confirm: true
            });

            if (error) throw error;
            console.log(`\n✅ ¡ÉXITO! Usuario ${email} CREADO con la nueva contraseña.`);
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.message.includes('401') || error.message.includes('service_role')) {
            console.error('💡 Pista: Verifica que copiaste bien la SERVICE_ROLE KEY (no la anon key).');
        }
    } finally {
        rl.close();
    }
}

main();
