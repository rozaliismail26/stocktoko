// src/format.js - fungsi bantu untuk tampilan
const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export const formatRupiah = (angka) => rupiah.format(Number(angka) || 0);

export const formatWaktu = (iso) =>
  new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

// Status stok: habis, menipis (<= stok minimum), atau aman
export function statusStok(produk) {
  if (produk.stok <= 0) return { label: 'Habis', kelas: 'habis' };
  if (produk.stok <= produk.stok_minimum) return { label: 'Menipis', kelas: 'menipis' };
  return { label: 'Aman', kelas: 'aman' };
}
