// server/db.js - koneksi MySQL dan inisialisasi tabel + data contoh
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Pool = kumpulan koneksi yang dipakai bergantian oleh banyak request
const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 5,
  timezone: 'Z', // waktu dibaca/ditulis sebagai UTC, browser yang mengubah ke waktu lokal
});

// Setiap koneksi baru memakai zona waktu UTC supaya konsisten
pool.pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'", () => {});
});

// Jalankan schema.sql, lalu seed.sql jika tabel produk masih kosong
async function initDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');

  // multipleStatements: boleh menjalankan banyak perintah SQL sekaligus (hanya untuk koneksi init ini)
  const conn = await mysql.createConnection({ ...config, multipleStatements: true });
  try {
    await conn.query(schema);

    if (process.env.AUTO_SEED !== 'false') {
      const [[{ total }]] = await conn.query('SELECT COUNT(*) AS total FROM products');
      if (total === 0) {
        await conn.query(seed);
        console.log('Data contoh (5 barang) berhasil dimasukkan.');
      }
    }
  } finally {
    await conn.end();
  }
}

module.exports = { pool, initDatabase };
