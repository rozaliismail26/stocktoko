// server/api.js - semua endpoint API (/api/...)
const express = require('express');
const { pool } = require('./db');

const router = express.Router();

// Error dengan kode HTTP, supaya pesan bisa dikirim ke browser
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Membungkus handler async agar error otomatis diteruskan ke error handler Express
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Ubah nilai menjadi bilangan bulat >= 0, atau null jika tidak valid
function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

// URL gambar harus diawali / (file lokal) atau http(s)://
function cleanImageUrl(value) {
  const url = String(value || '').trim();
  if (!url) return null;
  if (!/^(\/|https?:\/\/)/i.test(url)) {
    throw new HttpError(400, 'URL gambar harus diawali / atau http(s)://');
  }
  return url.slice(0, 255);
}

// ---------- Produk ----------

router.get('/products', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY nama ASC');
  res.json(rows);
}));

router.get('/summary', wrap(async (req, res) => {
  const [[row]] = await pool.query(`
    SELECT
      COUNT(*) AS total_produk,
      COALESCE(SUM(stok), 0) AS total_unit,
      COALESCE(SUM(stok * harga), 0) AS nilai_stok,
      COALESCE(SUM(stok <= stok_minimum), 0) AS perlu_restok
    FROM products
  `);
  // SUM() dari MySQL bisa berupa teks, jadi diubah ke angka
  res.json({
    total_produk: Number(row.total_produk),
    total_unit: Number(row.total_unit),
    nilai_stok: Number(row.nilai_stok),
    perlu_restok: Number(row.perlu_restok),
  });
}));

router.post('/products', wrap(async (req, res) => {
  const sku = String(req.body.sku || '').trim().toUpperCase();
  const nama = String(req.body.nama || '').trim();
  const kategori = String(req.body.kategori || '').trim();
  const harga = toInt(req.body.harga);
  const stok = toInt(req.body.stok ?? 0);
  const stokMinimum = toInt(req.body.stok_minimum ?? 5);
  const imageUrl = cleanImageUrl(req.body.image_url);

  if (!sku || !nama || !kategori) throw new HttpError(400, 'SKU, nama, dan kategori wajib diisi.');
  if (harga === null) throw new HttpError(400, 'Harga harus berupa angka bulat 0 atau lebih.');
  if (stok === null) throw new HttpError(400, 'Stok awal harus berupa angka bulat 0 atau lebih.');
  if (stokMinimum === null) throw new HttpError(400, 'Stok minimum harus berupa angka bulat 0 atau lebih.');

  const conn = await pool.getConnection();
  try {
    // Transaksi: produk dan riwayat stok awal tersimpan bersama, atau batal bersama
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO products (sku, nama, kategori, harga, stok, stok_minimum, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sku, nama, kategori, harga, stok, stokMinimum, imageUrl]
    );
    if (stok > 0) {
      await conn.query(
        "INSERT INTO stock_movements (product_id, tipe, jumlah, catatan) VALUES (?, 'MASUK', ?, 'Stok awal')",
        [result.insertId, stok]
      );
    }
    await conn.commit();
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, `SKU ${sku} sudah dipakai.`);
    throw err;
  } finally {
    conn.release();
  }
}));

// Edit data barang (jumlah stok hanya berubah lewat pencatatan stok masuk/keluar)
router.put('/products/:id', wrap(async (req, res) => {
  const id = toInt(req.params.id);
  const nama = String(req.body.nama || '').trim();
  const kategori = String(req.body.kategori || '').trim();
  const harga = toInt(req.body.harga);
  const stokMinimum = toInt(req.body.stok_minimum);
  const imageUrl = cleanImageUrl(req.body.image_url);

  if (id === null) throw new HttpError(400, 'ID tidak valid.');
  if (!nama || !kategori) throw new HttpError(400, 'Nama dan kategori wajib diisi.');
  if (harga === null) throw new HttpError(400, 'Harga harus berupa angka bulat 0 atau lebih.');
  if (stokMinimum === null) throw new HttpError(400, 'Stok minimum harus berupa angka bulat 0 atau lebih.');

  const [found] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
  if (found.length === 0) throw new HttpError(404, 'Barang tidak ditemukan.');

  await pool.query(
    'UPDATE products SET nama = ?, kategori = ?, harga = ?, stok_minimum = ?, image_url = ? WHERE id = ?',
    [nama, kategori, harga, stokMinimum, imageUrl, id]
  );
  res.json({ message: 'Barang diperbarui.' });
}));

router.delete('/products/:id', wrap(async (req, res) => {
  const id = toInt(req.params.id);
  if (id === null) throw new HttpError(400, 'ID tidak valid.');
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  if (result.affectedRows === 0) throw new HttpError(404, 'Barang tidak ditemukan.');
  res.json({ message: 'Barang dihapus.' });
}));

// ---------- Riwayat stok ----------

router.get('/movements', wrap(async (req, res) => {
  const limit = Math.min(Math.max(toInt(req.query.limit) || 20, 1), 100);
  const [rows] = await pool.query(
    `SELECT m.id, m.tipe, m.jumlah, m.catatan, m.created_at, p.nama, p.sku
     FROM stock_movements m
     JOIN products p ON p.id = m.product_id
     ORDER BY m.created_at DESC, m.id DESC
     LIMIT ?`,
    [limit]
  );
  res.json(rows);
}));

// Catat stok masuk / keluar untuk satu barang
router.post('/products/:id/movements', wrap(async (req, res) => {
  const id = toInt(req.params.id);
  const tipe = req.body.tipe;
  const jumlah = toInt(req.body.jumlah);
  const catatan = String(req.body.catatan || '').trim().slice(0, 255) || null;

  if (id === null) throw new HttpError(400, 'ID tidak valid.');
  if (!['MASUK', 'KELUAR'].includes(tipe)) throw new HttpError(400, 'Tipe harus MASUK atau KELUAR.');
  if (jumlah === null || jumlah < 1) throw new HttpError(400, 'Jumlah harus bilangan bulat minimal 1.');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // FOR UPDATE mengunci baris ini, sehingga dua pencatatan bersamaan tidak saling menimpa
    const [rows] = await conn.query('SELECT id, stok FROM products WHERE id = ? FOR UPDATE', [id]);
    if (rows.length === 0) throw new HttpError(404, 'Barang tidak ditemukan.');

    const stokBaru = rows[0].stok + (tipe === 'MASUK' ? jumlah : -jumlah);
    if (stokBaru < 0) {
      throw new HttpError(400, `Stok tidak cukup. Stok saat ini ${rows[0].stok}.`);
    }

    await conn.query('UPDATE products SET stok = ? WHERE id = ?', [stokBaru, id]);
    await conn.query(
      'INSERT INTO stock_movements (product_id, tipe, jumlah, catatan) VALUES (?, ?, ?, ?)',
      [id, tipe, jumlah, catatan]
    );
    await conn.commit();
    res.status(201).json({ stok: stokBaru });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

// Endpoint /api yang tidak dikenal
router.use((req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' }));

module.exports = router;
