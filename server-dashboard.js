const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (dashboard.html)
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`📊 Dashboard Server running on http://localhost:${PORT}`);
    console.log(`🔗 Open: http://localhost:${PORT}/dashboard.html`);
});
