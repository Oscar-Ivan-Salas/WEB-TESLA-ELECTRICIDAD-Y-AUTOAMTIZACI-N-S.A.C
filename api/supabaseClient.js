
const { createClient } = require('@supabase/supabase-js');

// Use environment variables (configured in Vercel Dashboard)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bgwovsuyjajxrmkvcggn.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_K-BlssTGWsG5uzY9bAnwfg_M7Zwheap';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
