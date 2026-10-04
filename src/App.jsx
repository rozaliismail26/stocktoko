import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import Modal from './components/Modal';
import SummaryBar from './components/SummaryBar';
import ProductCard from './components/ProductCard';
import ProductForm from './components/ProductForm';
import StockForm from './components/StockForm';
import MovementTable from './components/MovementTable';

export default function App() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('Semua');
  const [modal, setModal] = useState(null); // { jenis: 'tambah' | 'edit' | 'stok', produk }
  const [toast, setToast] = useState('');

  // Ambil semua data dari server
  const muatData = useCallback(async () => {
    try {
      const [p, s, m] = await Promise.all([api.getProducts(), api.getSummary(), api.getMovements(12)]);
      setProducts(p);
      setSummary(s);
      setMovements(m);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muatData();
  }, [muatData]);

  // Pesan sukses hilang sendiri setelah 3 detik
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const tutupModal = useCallback(() => setModal(null), []);

  const kategoriList = useMemo(
    () => [...new Set(products.map((p) => p.kategori))].sort(),
    [products]
  );

  const tampil = useMemo(() => {
    const kata = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (kategori === 'Semua' || p.kategori === kategori) &&
        (!kata || p.nama.toLowerCase().includes(kata) || p.sku.toLowerCase().includes(kata))
    );
  }, [products, search, kategori]);

  async function simpanBarang(data) {
    if (modal.jenis === 'edit') {
      await api.updateProduct(modal.produk.id, data);
      setToast('Barang diperbarui.');
    } else {
      await api.createProduct(data);
      setToast('Barang ditambahkan.');
    }
    setModal(null);
    muatData();
  }

  async function simpanStok(data) {
    await api.addMovement(modal.produk.id, data);
    setToast('Stok berhasil dicatat.');
    setModal(null);
    muatData();
  }

  async function hapusBarang(produk) {
    if (!window.confirm(`Hapus "${produk.nama}" beserta seluruh riwayat stoknya?`)) return;
    try {
      await api.deleteProduct(produk.id);
      setToast('Barang dihapus.');
      muatData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <header className="top">
        <div>
          <h1>Stok Gudang</h1>
          <p className="subtitle">Toko perabot rumah tangga</p>
        </div>
        <button type="button" className="btn primary" onClick={() => setModal({ jenis: 'tambah' })}>
          Tambah barang
        </button>
      </header>

      {error && (
        <div className="alert" role="alert">
          {error} <button type="button" className="link" onClick={muatData}>Coba lagi</button>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}

      <SummaryBar summary={summary} />

      <section aria-labelledby="judul-barang">
        <div className="section-head">
          <h2 id="judul-barang">Daftar barang</h2>
          <div className="filters">
            <input
              type="search"
              placeholder="Cari nama atau SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Cari barang"
            />
            <select value={kategori} onChange={(e) => setKategori(e.target.value)} aria-label="Filter kategori">
              <option>Semua</option>
              {kategoriList.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="empty">Memuat data...</p>
        ) : tampil.length === 0 ? (
          <p className="empty">
            {products.length === 0
              ? 'Belum ada barang. Klik "Tambah barang" untuk mulai.'
              : 'Tidak ada barang yang cocok dengan pencarian.'}
          </p>
        ) : (
          <div className="grid">
            {tampil.map((p) => (
              <ProductCard
                key={p.id}
                produk={p}
                onStock={(produk) => setModal({ jenis: 'stok', produk })}
                onEdit={(produk) => setModal({ jenis: 'edit', produk })}
                onDelete={hapusBarang}
              />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="judul-riwayat" className="history">
        <h2 id="judul-riwayat">Riwayat stok terbaru</h2>
        <MovementTable movements={movements} />
      </section>

      {modal?.jenis === 'tambah' && (
        <Modal title="Tambah barang" onClose={tutupModal}>
          <ProductForm kategoriList={kategoriList} onSubmit={simpanBarang} onCancel={tutupModal} />
        </Modal>
      )}
      {modal?.jenis === 'edit' && (
        <Modal title="Edit barang" onClose={tutupModal}>
          <ProductForm product={modal.produk} kategoriList={kategoriList} onSubmit={simpanBarang} onCancel={tutupModal} />
        </Modal>
      )}
      {modal?.jenis === 'stok' && (
        <Modal title="Catat stok" onClose={tutupModal}>
          <StockForm product={modal.produk} onSubmit={simpanStok} onCancel={tutupModal} />
        </Modal>
      )}
    </div>
  );
}
