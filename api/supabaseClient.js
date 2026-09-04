const { createClient } = require('@supabase/supabase-js');

// Configuración estricta mediante variables de entorno (Vercel / .env)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error Crítico: SUPABASE_URL o SUPABASE_ANON_KEY no han sido configurados en las variables de entorno.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

module.exports = supabase;
