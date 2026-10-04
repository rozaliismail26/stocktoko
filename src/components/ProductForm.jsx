import { useState } from 'react';

// Dipakai untuk tambah barang (product kosong) dan edit barang (product terisi)
export default function ProductForm({ product, kategoriList, onSubmit, onCancel }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState({
    sku: product?.sku ?? '',
    nama: product?.nama ?? '',
    kategori: product?.kategori ?? '',
    harga: product?.harga ?? '',
    stok: 0,
    stok_minimum: product?.stok_minimum ?? 5,
    image_url: product?.image_url ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const ubah = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function simpan(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        ...form,
        harga: Number(form.harga),
        stok: Number(form.stok),
        stok_minimum: Number(form.stok_minimum),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={simpan} className="form">
      <label>
        SKU (kode barang)
        <input name="sku" value={form.sku} onChange={ubah} disabled={isEdit} maxLength={30} required />
      </label>
      <label>
        Nama barang
        <input name="nama" value={form.nama} onChange={ubah} maxLength={120} required />
      </label>
      <label>
        Kategori
        <input name="kategori" value={form.kategori} onChange={ubah} list="daftar-kategori" maxLength={60} required />
        <datalist id="daftar-kategori">
          {kategoriList.map((k) => (
            <option key={k} value={k} />
          ))}
        </datalist>
      </label>
      <div className="form-row">
        <label>
          Harga (Rp)
          <input name="harga" type="number" min="0" step="1" value={form.harga} onChange={ubah} required />
        </label>
        <label>
          Stok minimum
          <input name="stok_minimum" type="number" min="0" step="1" value={form.stok_minimum} onChange={ubah} required />
        </label>
      </div>
      {!isEdit && (
        <label>
          Stok awal
          <input name="stok" type="number" min="0" step="1" value={form.stok} onChange={ubah} required />
        </label>
      )}
      <label>
        URL gambar (opsional)
        <input name="image_url" value={form.image_url} onChange={ubah} placeholder="/images/panci.svg atau https://..." />
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Batal</button>
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Tambah barang'}
        </button>
      </div>
    </form>
  );
}
