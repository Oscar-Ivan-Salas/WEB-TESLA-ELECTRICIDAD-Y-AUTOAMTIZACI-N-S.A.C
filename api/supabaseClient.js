
const { createClient } = require('@supabase/supabase-js');

// Use environment variables (configured in Vercel Dashboard)
// Proyecto: Aterrizaje de Tesla en agosto de 2026
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fckbbohlxfqoyiomyxqm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_lbRx3jVpe9P7gzl3B5gFEg_5GbQXXF0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
