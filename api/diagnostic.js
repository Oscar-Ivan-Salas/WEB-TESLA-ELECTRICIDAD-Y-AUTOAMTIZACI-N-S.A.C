
// Safe Import Wrapper to diagnose crash
let supabase;
let importError = null;
try {
    supabase = require('./supabaseClient');
} catch (e) {
    importError = e.message;
}

module.exports = async (req, res) => {
    try {
        // Check basic node env
        const info = {
            message: 'Diagnostic v2',
            node_version: process.version,
            env_keys: Object.keys(process.env || {}),
            supabase_load_error: importError,
            supabase_con: !!supabase
        };

        // Try a simple select if client loaded
        if (supabase) {
            try {
                // Since we enabled public select for anon, this should work.
                const { data, error } = await supabase.from('leads').select('count').limit(1);
                info.db_check = {
                    success: !error,
                    data_sample: data,
                    error_msg: error ? error.message : null,
                    error_code: error ? error.code : null
                };
            } catch (dbErr) {
                info.db_check = { success: false, fatal_error: dbErr.message };
            }
        }

        res.status(200).json(info);
    } catch (e) {
        res.status(200).json({
            message: 'Diagnostic CRASH',
            error_stack: e.stack,
            error_msg: e.message
        });
    }
};
