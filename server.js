const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));

// Dinamik .mcaddon indirme bağlantısı
app.get('/download', (req, res) => {
    res.attachment('VoidTPMachine.mcaddon');
    
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
        res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    if (fs.existsSync(path.join(__dirname, 'VoidTP_BP'))) {
        archive.directory('VoidTP_BP/', 'VoidTP_BP');
    }
    if (fs.existsSync(path.join(__dirname, 'VoidTP_RP'))) {
        archive.directory('VoidTP_RP/', 'VoidTP_RP');
    }

    archive.finalize();
});

// Durum kontrol API
app.get('/api/status', (req, res) => {
    res.json({
        status: "online",
        addon: "Void TP Machine",
        version: "1.0.0",
        minecraft_version: "1.21.100+"
    });
});

app.listen(PORT, () => {
    console.log(`Void TP Machine sunucusu ${PORT} portunda aktif!`);
});

