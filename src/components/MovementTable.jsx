import { formatWaktu } from '../format';

export default function MovementTable({ movements }) {
  if (movements.length === 0) {
    return <p className="empty">Belum ada riwayat stok.</p>;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Barang</th>
            <th>Jenis</th>
            <th className="num">Jumlah</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>{formatWaktu(m.created_at)}</td>
              <td>{m.nama}</td>
              <td>
                <span className={`badge ${m.tipe === 'MASUK' ? 'aman' : 'menipis'}`}>
                  {m.tipe === 'MASUK' ? 'Masuk' : 'Keluar'}
                </span>
              </td>
              <td className="num">{m.tipe === 'MASUK' ? '+' : '-'}{m.jumlah}</td>
              <td>{m.catatan || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
