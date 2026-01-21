
const supabase = require('./supabaseClient');

module.exports = async (req, res) => {
    try {
        // Check basic node env
        const info = {
            message: 'Diagnostic OK',
            node_version: process.version,
            env_keys: Object.keys(process.env || {}),
            supabase_con: !!supabase
        };

        // Try a simple select (should return empty or list)
        // Since we enabled public select for anon, this should work.
        const { data, error } = await supabase.from('leads').select('count').limit(1);

        info.db_check = {
            success: !error,
            data_sample: data,
            error_msg: error ? error.message : null,
            error_code: error ? error.code : null
        };

        res.status(200).json(info);
    } catch (e) {
        res.status(200).json({
            message: 'Diagnostic CRASH',
            error_stack: e.stack,
            error_msg: e.message
        });
    }
};
