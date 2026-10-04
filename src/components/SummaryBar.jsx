import { formatRupiah } from '../format';

export default function SummaryBar({ summary }) {
  if (!summary) return null;
  const item = [
    { label: 'Jenis barang', nilai: summary.total_produk },
    { label: 'Total unit di gudang', nilai: summary.total_unit },
    { label: 'Nilai stok', nilai: formatRupiah(summary.nilai_stok) },
    { label: 'Perlu restok', nilai: summary.perlu_restok, peringatan: summary.perlu_restok > 0 },
  ];
  return (
    <dl className="summary">
      {item.map((i) => (
        <div key={i.label} className={i.peringatan ? 'summary-item warn' : 'summary-item'}>
          <dt>{i.label}</dt>
          <dd>{i.nilai}</dd>
        </div>
      ))}
    </dl>
  );
}
