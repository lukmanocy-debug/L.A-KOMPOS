import React from 'react';
import { X, Printer, Truck, FileText, CheckCircle } from 'lucide-react';
import { ProductionRecord, MANURE_TYPES } from '../types';
import { formatRupiah, formatNumber, formatDateIndonesian } from '../utils/formatters';

interface Props {
  record: ProductionRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryReceiptModal: React.FC<Props> = ({ record, isOpen, onClose }) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = `LK-${record.date.replace(/-/g, '')}-${record.id.slice(-4)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-emerald-200 flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="bg-stone-100 p-4 border-b border-stone-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-stone-800">
            <FileText className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm">Surat Jalan & Nota Pengiriman Kohe</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div id="printable-receipt" className="p-8 overflow-y-auto space-y-6 text-stone-800 font-sans print:p-0">
          
          {/* Document Header with Logo & Brand */}
          <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-4">
            <div className="flex items-center gap-4">
              <img
                src="/logo.jpg"
                alt="Logo L.A Kompos"
                className="w-16 h-16 rounded-full border border-emerald-600 object-cover shadow-xs"
              />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-emerald-950 font-serif">
                  L.A KOMPOS
                </h1>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                  ORGANIK & BERKUALITAS
                </p>
                <p className="text-[11px] text-stone-500">
                  Penyedia Pupuk Kandang & Kotoran Hewan (Kohe) Unggas
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                SURAT JALAN & NOTA
              </span>
              <p className="text-xs font-mono font-bold text-stone-700 mt-1">{receiptNumber}</p>
              <p className="text-[11px] text-stone-500">{formatDateIndonesian(record.date)}</p>
            </div>
          </div>

          {/* Info Grid: Pengirim & Tujuan */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <p className="text-stone-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                ASAL PENGAMBILAN KOHE:
              </p>
              <p className="font-bold text-stone-900">{record.location}</p>
              <p className="text-stone-600 mt-0.5">L.A Kompos Management Unit</p>
            </div>

            <div>
              <p className="text-stone-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                TUJUAN PENGIRIMAN / PENERIMA:
              </p>
              <p className="font-bold text-emerald-900 text-sm">{record.destination}</p>
              <p className="text-stone-600 mt-0.5">Tanggal: {formatDateIndonesian(record.date, false)}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Deskripsi Barang</th>
                  <th className="py-2.5 px-3">Jenis Kotoran</th>
                  <th className="py-2.5 px-3 text-center">Jumlah</th>
                  <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="py-3 px-3 font-medium">1</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-stone-900">Kotoran Hewan (Kohe) Dikarungi</p>
                    <p className="text-[11px] text-stone-500">
                      Karung standar isi penuh, kondisi kering dan siap pakai
                    </p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-emerald-800">
                      {MANURE_TYPES[record.manureType].shortLabel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-stone-900">
                    {formatNumber(record.bagsDeliveredToday)} Karung
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {formatRupiah(record.sellingPricePerBag)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-stone-900">
                    {formatRupiah(record.bagsDeliveredToday * record.sellingPricePerBag)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-stone-50 border-t border-stone-200 font-bold text-stone-900">
                <tr>
                  <td colSpan={3} className="py-3 px-3 text-right text-stone-600">
                    Total Karung Terkirim:
                  </td>
                  <td className="py-3 px-3 text-center text-emerald-800 font-black">
                    {record.bagsDeliveredToday} Krg
                  </td>
                  <td className="py-3 px-3 text-right text-stone-600">
                    Total Pembayaran:
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-900 text-sm font-black">
                    {formatRupiah(record.totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Sisa Stok Info jika ada */}
          {record.bagsInStock > 0 && (
            <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between">
              <span>Status Stok di Ternak: {record.bagsInStock} karung sisa belum dikirim (tersimpan di kandang).</span>
              <span className="font-bold">Total Produksi: {record.totalBags} Karung</span>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="font-bold text-stone-800">Catatan Khusus: </span>
              {record.notes}
            </div>
          )}

          {/* Signatures Area */}
          <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
            <div className="space-y-12">
              <p className="font-medium text-stone-500">Petugas / Mandor L.A Kompos</p>
              <div className="border-t border-stone-400 mx-4 pt-1 font-bold text-stone-800">
                ( .................................... )
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-medium text-stone-500">Sopir / Pengangkut</p>
              <div className="border-t border-stone-400 mx-4 pt-1 font-bold text-stone-800">
                ( .................................... )
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-medium text-stone-500">Penerima / Pembeli</p>
              <div className="border-t border-stone-400 mx-4 pt-1 font-bold text-stone-800">
                ( {record.destination.slice(0, 20)} )
              </div>
            </div>
          </div>

          {/* Footer watermark */}
          <div className="text-center pt-4 border-t border-stone-200 text-[10px] text-stone-400">
            Dokumen resmi tanda terima pupuk organik L.A Kompos • Terima kasih atas kerjasamanya
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak Nota
          </button>
        </div>
      </div>
    </div>
  );
};
