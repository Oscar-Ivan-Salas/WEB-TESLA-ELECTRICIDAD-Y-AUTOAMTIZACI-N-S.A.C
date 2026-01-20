
const { createClient } = require('@supabase/supabase-js');

// Credenciales proporcionadas
const SUPABASE_URL = 'https://bgwovsuyjajxrmkvcggn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K-BlssTGWsG5uzY9bAnwfg_M7Zwheap'; // User provided "sb_publishable_..." key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
