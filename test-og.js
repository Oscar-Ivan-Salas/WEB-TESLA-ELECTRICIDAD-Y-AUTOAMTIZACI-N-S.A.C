const https = require('https');

https.get('https://web-tesla-electricidad-y-autoamtiza-psi.vercel.app/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const ogTitle = data.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
        const ogImage = data.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
        const ogDesc = data.match(/<meta property="og:description" content="([^"]+)"/)?.[1];
        
        console.log('=== VERIFICACIÓN EN VIVO DE METADATOS DE WHATSAPP ===');
        console.log('1. Título Og:', ogTitle || 'NO ENCONTRADO');
        console.log('2. Imagen Logo Og:', ogImage || 'NO ENCONTRADO');
        console.log('3. Descripción Og:', ogDesc || 'NO ENCONTRADO');
        console.log('=====================================================');
    });
}).on('error', err => console.error(err));
