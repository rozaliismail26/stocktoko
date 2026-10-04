import { formatRupiah, statusStok } from '../format';

export default function ProductCard({ produk, onStock, onEdit, onDelete }) {
  const status = statusStok(produk);
  return (
    <article className="product">
      {produk.image_url ? (
        <img src={produk.image_url} alt={produk.nama} loading="lazy" />
      ) : (
        <div className="no-image">Belum ada gambar</div>
      )}
      <div className="product-body">
        <p className="product-meta">
          {produk.sku} &middot; {produk.kategori}
        </p>
        <h3>{produk.nama}</h3>
        <p className="price">{formatRupiah(produk.harga)}</p>
        <div className="stock-row">
          <span className="stock-number">{produk.stok} unit</span>
          <span className={`badge ${status.kelas}`}>{status.label}</span>
        </div>
        <p className="min-note">Batas minimum: {produk.stok_minimum}</p>
        <div className="actions">
          <button type="button" className="btn primary" onClick={() => onStock(produk)}>
            Catat stok
          </button>
          <button type="button" className="btn" onClick={() => onEdit(produk)}>
            Edit
          </button>
          <button type="button" className="btn danger" onClick={() => onDelete(produk)}>
            Hapus
          </button>
        </div>
      </div>
    </article>
  );
}
