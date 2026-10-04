// server.js - entry file: menjalankan API + menyajikan hasil build React (folder dist)
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const { initDatabase } = require('./server/db');
const apiRouter = require('./server/api');

const app = express();
app.use(express.json());

// Cek cepat apakah aplikasi hidup
app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api', apiRouter);

// Sajikan frontend React hasil `npm run build`
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
} else {
  app.get('/', (req, res) => {
    res.status(200).send('Frontend belum di-build. Jalankan: npm run build');
  });
}

// Penangkap error terakhir
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Terjadi kesalahan pada server.' : err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
  // Server tetap hidup walau database bermasalah, supaya error terbaca di log
  initDatabase()
    .then(() => console.log('Database siap.'))
    .catch((err) => console.error('Gagal menyiapkan database:', err.message));
});
