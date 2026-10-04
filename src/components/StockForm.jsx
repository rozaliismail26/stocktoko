import { useState } from 'react';

// Form pencatatan stok masuk / keluar untuk satu barang
export default function StockForm({ product, onSubmit, onCancel }) {
  const [tipe, setTipe] = useState('MASUK');
  const [jumlah, setJumlah] = useState('');
  const [catatan, setCatatan] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const n = Number(jumlah) || 0;
  const stokBaru = product.stok + (tipe === 'MASUK' ? n : -n);

  async function simpan(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit({ tipe, jumlah: n, catatan });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={simpan} className="form">
      <p className="modal-sub">
        {product.nama} &middot; stok saat ini <strong>{product.stok}</strong>
      </p>
      <label>
        Jenis pencatatan
        <select value={tipe} onChange={(e) => setTipe(e.target.value)}>
          <option value="MASUK">Stok masuk (barang datang)</option>
          <option value="KELUAR">Stok keluar (barang terjual / dipakai)</option>
        </select>
      </label>
      <label>
        Jumlah
        <input type="number" min="1" step="1" value={jumlah} onChange={(e) => setJumlah(e.target.value)} required autoFocus />
      </label>
      <label>
        Catatan (opsional)
        <input value={catatan} onChange={(e) => setCatatan(e.target.value)} maxLength={255} placeholder="Contoh: Pembelian dari supplier" />
      </label>

      {n > 0 && (
        <p className={stokBaru < 0 ? 'form-error' : 'preview'}>
          {stokBaru < 0 ? 'Stok tidak cukup untuk jumlah ini.' : `Stok setelah dicatat: ${stokBaru}`}
        </p>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Batal</button>
        <button type="submit" className="btn primary" disabled={saving || n < 1 || stokBaru < 0}>
          {saving ? 'Menyimpan...' : 'Simpan pencatatan'}
        </button>
      </div>
    </form>
  );
}
