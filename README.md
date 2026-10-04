# Stok Gudang - Toko Perabot Rumah Tangga

Aplikasi belajar: **React** (tampilan) + **Express** (API) + **MySQL** (database).

## Struktur proyek

```
toko-stok/
├── server.js            Entry file: jalankan API + sajikan hasil build React
├── server/
│   ├── db.js            Koneksi MySQL, buat tabel, isi data contoh
│   └── api.js           Endpoint /api/products, /api/summary, /api/movements
├── database/
│   ├── schema.sql       Struktur tabel (products, stock_movements)
│   └── seed.sql         Data contoh: 5 barang + riwayat stok
├── src/                 Kode React (App.jsx, components/, api.js, styles.css)
├── public/images/       Gambar contoh barang (SVG)
├── index.html           Halaman dasar untuk Vite
├── vite.config.mjs      Konfigurasi Vite
└── package.json
```

## Jalankan di komputer sendiri

1. Pasang Node.js 20 dan MySQL (atau pakai database MySQL dari hPanel jika akses remote diaktifkan).
2. `npm install`
3. Salin `.env.example` menjadi `.env`, lalu isi data database.
4. Buka dua terminal:
   - Terminal 1: `npm run dev:server` (API di http://localhost:3000)
   - Terminal 2: `npm run dev:client` (tampilan di http://localhost:5173)

Saat server pertama kali jalan, tabel dibuat otomatis dan 5 barang contoh dimasukkan
(hanya jika tabel produk masih kosong). Matikan dengan `AUTO_SEED=false`.

## Upload ke GitHub

```
git init
git add .
git commit -m "Aplikasi stok gudang"
git branch -M main
git remote add origin https://github.com/USERNAME/toko-stok.git
git push -u origin main
```

Pastikan `.env` **tidak** ikut ter-upload (sudah diatur di `.gitignore`).
Jalankan `npm install` sekali di lokal supaya `package-lock.json` terbentuk, lalu ikut di-commit.

## Deploy ke Hostinger dari GitHub

1. hPanel -> **Databases -> Management**: buat database, user, dan password.
2. hPanel -> **Websites -> Add Website -> Node.js Web App -> Import Git repository**, hubungkan GitHub, pilih repo.
3. Pengaturan build:

| Pengaturan | Isi |
|---|---|
| Framework preset | Other (atau Express jika terdeteksi) |
| Node version | 20.x |
| Build command | `npm run build` |
| Output directory | `dist` |
| Entry file | `server.js` |

4. Environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
5. Klik **Deploy**. Cek `domainmu.com/health` lalu buka halaman utama.

## Troubleshooting singkat

- Halaman putih / "Frontend belum di-build": cek build command dan output directory (`dist`).
- "Gagal menyiapkan database" di log: periksa environment variables database.
- Daftar barang kosong: cek log; tabel dibuat saat server start.
