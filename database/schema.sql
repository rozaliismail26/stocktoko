-- Struktur database aplikasi stok gudang
-- Dijalankan otomatis oleh server saat start (aman diulang karena IF NOT EXISTS).
-- Bisa juga diimpor manual lewat phpMyAdmin.

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(30) NOT NULL UNIQUE,
  nama VARCHAR(120) NOT NULL,
  kategori VARCHAR(60) NOT NULL,
  harga INT UNSIGNED NOT NULL DEFAULT 0,
  stok INT NOT NULL DEFAULT 0,
  stok_minimum INT NOT NULL DEFAULT 5,
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  tipe ENUM('MASUK','KELUAR') NOT NULL,
  jumlah INT UNSIGNED NOT NULL,
  catatan VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_movement_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;
