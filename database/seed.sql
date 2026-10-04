-- Data contoh: 5 barang rumah tangga + riwayat keluar-masuk stok.
-- Jumlah stok di tabel products sama dengan total riwayat di stock_movements.

INSERT INTO products (id, sku, nama, kategori, harga, stok, stok_minimum, image_url) VALUES
  (1, 'PRC-001', 'Panci Stainless 24 cm', 'Dapur',      185000, 24, 10, '/images/panci.svg'),
  (2, 'EMB-001', 'Ember Plastik 15 Liter', 'Kebersihan',  32000,  6, 10, '/images/ember.svg'),
  (3, 'SPU-001', 'Sapu Lantai Ijuk',       'Kebersihan',  27500, 40, 15, '/images/sapu.svg'),
  (4, 'LMP-001', 'Lampu LED 12 Watt',      'Listrik',     22000,  0, 20, '/images/lampu.svg'),
  (5, 'GLS-001', 'Set Gelas Kaca 6 pcs',   'Dapur',       68000, 18,  8, '/images/gelas.svg');

INSERT INTO stock_movements (product_id, tipe, jumlah, catatan, created_at) VALUES
  (1, 'MASUK',  30, 'Pembelian dari supplier',   NOW() - INTERVAL 7 DAY),
  (1, 'KELUAR',  4, 'Penjualan toko',            NOW() - INTERVAL 5 DAY),
  (1, 'KELUAR',  2, 'Penjualan online',          NOW() - INTERVAL 1 DAY),
  (2, 'MASUK',  20, 'Pembelian dari supplier',   NOW() - INTERVAL 6 DAY),
  (2, 'KELUAR',  9, 'Penjualan toko',            NOW() - INTERVAL 4 DAY),
  (2, 'KELUAR',  5, 'Pesanan pelanggan',         NOW() - INTERVAL 1 DAY),
  (3, 'MASUK',  50, 'Pembelian dari supplier',   NOW() - INTERVAL 7 DAY),
  (3, 'KELUAR', 10, 'Penjualan toko',            NOW() - INTERVAL 3 DAY),
  (4, 'MASUK',  40, 'Pembelian dari supplier',   NOW() - INTERVAL 6 DAY),
  (4, 'KELUAR', 25, 'Penjualan toko',            NOW() - INTERVAL 3 DAY),
  (4, 'KELUAR', 15, 'Pesanan proyek renovasi',   NOW() - INTERVAL 2 DAY),
  (5, 'MASUK',  24, 'Pembelian dari supplier',   NOW() - INTERVAL 5 DAY),
  (5, 'KELUAR',  6, 'Penjualan toko',            NOW() - INTERVAL 2 DAY);
