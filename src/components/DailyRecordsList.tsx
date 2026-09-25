import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Calendar, 
  MapPin, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Search, 
  FileText, 
  Trash2, 
  Edit3, 
  Filter, 
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ProductionRecord, MANURE_TYPES, ManureType } from '../types';
import { formatRupiah, formatNumber, formatDateIndonesian, getTodayString } from '../utils/formatters';
import { DeliveryReceiptModal } from './DeliveryReceiptModal';

interface Props {
  records: ProductionRecord[];
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: ProductionRecord) => void;
}

export const DailyRecordsList: React.FC<Props> = ({
  records,
  onDeleteRecord,
  onEditRecord,
}) => {
  const todayStr = getTodayString();
  const [filterMode, setFilterMode] = useState<'all' | 'today'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [printingRecord, setPrintingRecord] = useState<ProductionRecord | null>(null);

  // List unik semua tujuan pengiriman
  const uniqueDestinations = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.destination))).sort();
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Filter hari ini vs semua
      if (filterMode === 'today' && r.date !== todayStr) {
        return false;
      }
      // Filter tujuan
      if (selectedDestinationFilter !== 'all' && r.destination !== selectedDestinationFilter) {
        return false;
      }
      // Filter jenis kohe
      if (selectedTypeFilter !== 'all' && r.manureType !== selectedTypeFilter) {
        return false;
      }
      // Pencarian teks
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchDest = r.destination.toLowerCase().includes(query);
        const matchLoc = r.location.toLowerCase().includes(query);
        const matchNotes = (r.notes || '').toLowerCase().includes(query);
        const matchDay = r.dayName.toLowerCase().includes(query);
        if (!matchDest && !matchLoc && !matchNotes && !matchDay) return false;
      }
      return true;
    });
  }, [records, filterMode, todayStr, selectedDestinationFilter, selectedTypeFilter, searchQuery]);

  // Kelompokkan data berdasarkan TUJUAN PENGIRIMAN (sesuai instruksi user)
  const groupedByDestination = useMemo(() => {
    const map: Record<string, ProductionRecord[]> = {};
    filteredRecords.forEach((r) => {
      if (!map[r.destination]) {
        map[r.destination] = [];
      }
      map[r.destination].push(r);
    });

    // Urutkan grup berdasarkan jumlah transaksi terbanyak atau tanggal terbaru
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [filteredRecords]);

  // Total angka untuk filter aktif
  const summaryTotals = useMemo(() => {
    const totalBags = filteredRecords.reduce((acc, cur) => acc + cur.totalBags, 0);
    const shippedBags = filteredRecords.reduce((acc, cur) => acc + cur.bagsDeliveredToday, 0);
    const stockBags = filteredRecords.reduce((acc, cur) => acc + cur.bagsInStock, 0);
    const revenue = filteredRecords.reduce((acc, cur) => acc + cur.totalRevenue, 0);
    const profit = filteredRecords.reduce((acc, cur) => acc + cur.netProfit, 0);
    const cost = filteredRecords.reduce((acc, cur) => acc + cur.totalCost, 0);
    return { totalBags, shippedBags, stockBags, revenue, profit, cost };
  }, [filteredRecords]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Penyimpanan Data Terpusat</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 font-serif">
            Data Ngarungi Dikelompokkan per Tujuan Pengiriman
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Setiap data tersimpan rapi berdasarkan pembeli/tujuan kirim, lengkap dengan rincian biaya, upah, dan keuntungan
          </p>
        </div>

        {/* Tab Filter: Semua vs Hari Ini */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl self-start md:self-auto border border-stone-200">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua Riwayat ({records.length})
          </button>
          <button
            onClick={() => setFilterMode('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'today'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Data Hari Ini ({records.filter((r) => r.date === todayStr).length})</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari tujuan, kandang, hari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Filter Tujuan Pengiriman */}
        <div>
          <select
            value={selectedDestinationFilter}
            onChange={(e) => setSelectedDestinationFilter(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Tujuan Pengiriman ({uniqueDestinations.length})</option>
            {uniqueDestinations.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Jenis Kotoran */}
        <div>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Jenis Kotoran Ayam</option>
            <option value="broiler">Ayam Broiler</option>
            <option value="doc">Ayam DOC</option>
            <option value="layer">Ayam Petelur</option>
          </select>
        </div>
      </div>

      {/* MINI STATS STRIP FOR ACTIVE FILTER */}
      <div className="bg-stone-50 p-3 sm:p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-stone-500 block text-[10px] uppercase font-bold">Total Transaksi</span>
            <span className="font-extrabold text-stone-900">{filteredRecords.length} Catatan</span>
          </div>
          <div className="border-l border-stone-300 pl-4">
            <span className="text-stone-500 block text-[10px] uppercase font-bold">Total Karung Ngarungi</span>
            <span className="font-extrabold text-stone-900">{formatNumber(summaryTotals.totalBags)} Krg</span>
          </div>
          <div className="border-l border-stone-300 pl-4 hidden sm:block">
            <span className="text-stone-500 block text-[10px] uppercase font-bold">Terkirim / Stok</span>
            <span className="font-bold text-stone-800">{summaryTotals.shippedBags} / {summaryTotals.stockBags}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="text-stone-500 block text-[10px] uppercase font-bold">Total Omzet</span>
            <span className="font-extrabold text-emerald-800">{formatRupiah(summaryTotals.revenue)}</span>
          </div>
          <div className="border-l border-stone-300 pl-4">
            <span className="text-stone-500 block text-[10px] uppercase font-bold">Total Laba Bersih</span>
            <span className="font-black text-emerald-700 text-sm">{formatRupiah(summaryTotals.profit)}</span>
          </div>
        </div>
      </div>

      {/* GROUPED LIST OF RECORDS BY DESTINATION */}
      {groupedByDestination.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500">
          <Truck className="w-10 h-10 mx-auto text-stone-400 mb-2 opacity-60" />
          <p className="font-bold text-stone-700">Belum Ada Data Sesuai Kriteria</p>
          <p className="text-xs text-stone-500 mt-1">
            Gunakan kalkulator di atas untuk menyimpan data ngarungi kohe hari ini.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDestination.map(([destName, recordsInGroup]) => {
            const groupShipped = recordsInGroup.reduce((acc, cur) => acc + cur.bagsDeliveredToday, 0);
            const groupRevenue = recordsInGroup.reduce((acc, cur) => acc + cur.totalRevenue, 0);
            const groupProfit = recordsInGroup.reduce((acc, cur) => acc + cur.netProfit, 0);

            return (
              <div
                key={destName}
                className="bg-white rounded-2xl border-2 border-stone-200/90 shadow-sm overflow-hidden"
              >
                {/* Destination Group Header */}
                <div className="bg-gradient-to-r from-stone-100 via-stone-50 to-emerald-50/40 p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400">
                          Tujuan Pengiriman:
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                          {recordsInGroup.length} Transaksi
                        </span>
                      </div>
                      <h4 className="font-black text-stone-900 text-base">{destName}</h4>
                    </div>
                  </div>

                  {/* Destination Group Aggregates */}
                  <div className="flex items-center gap-3 text-xs bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs self-start sm:self-auto">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Total Terkirim:</span>
                      <span className="font-bold text-stone-900">{formatNumber(groupShipped)} Karung</span>
                    </div>
                    <div className="border-l border-stone-200 pl-3">
                      <span className="text-[10px] text-stone-500 block">Total Omzet:</span>
                      <span className="font-bold text-stone-900">{formatRupiah(groupRevenue)}</span>
                    </div>
                    <div className="border-l border-stone-200 pl-3">
                      <span className="text-[10px] text-emerald-700 font-bold block">Total Laba:</span>
                      <span className="font-black text-emerald-800">{formatRupiah(groupProfit)}</span>
                    </div>
                  </div>
                </div>

                {/* Individual Transactions in this Destination */}
                <div className="divide-y divide-stone-100">
                  {recordsInGroup.map((record) => {
                    const typeInfo = MANURE_TYPES[record.manureType];
                    const isToday = record.date === todayStr;

                    return (
                      <div key={record.id} className="p-4 sm:p-5 hover:bg-stone-50/80 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          
                          {/* Left: Date, Farm Location, Manure details */}
                          <div className="space-y-1.5 max-w-xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-stone-900 text-sm">
                                {formatDateIndonesian(record.date)}
                              </span>
                              {isToday && (
                                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                                  HARI INI
                                </span>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeInfo.badgeColor}`}>
                                {typeInfo.shortLabel}
                              </span>
                            </div>

                            <p className="text-xs text-stone-600 flex items-center gap-1.5 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{record.location}</span>
                            </p>

                            {/* Quantitative details */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500 pt-1">
                              <span>
                                Ngarungi: <strong className="text-stone-800">{record.totalBags} krg</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Kirim: <strong className="text-emerald-800">{record.bagsDeliveredToday} krg</strong>
                              </span>
                              {record.bagsInStock > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-800 font-semibold">
                                    Stok Kandang: {record.bagsInStock} krg
                                  </span>
                                </>
                              )}
                              <span>•</span>
                              <span>
                                Borongan: <strong>{formatRupiah(record.workerRatePerBag)}/krg</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Jual: <strong>{formatRupiah(record.sellingPricePerBag)}/krg</strong>
                              </span>
                            </div>

                            {/* Extra cost chips */}
                            <div className="flex flex-wrap gap-1.5 text-[10px] text-stone-500 pt-0.5">
                              <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                Total Borongan: {formatRupiah(record.totalWorkerWages)}
                              </span>
                              <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                Makan: {formatRupiah(record.mealAllowance)}
                              </span>
                              {record.foremanSalary > 0 && (
                                <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                  Mandor: {formatRupiah(record.foremanSalary)}
                                </span>
                              )}
                              {record.notes && (
                                <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 italic">
                                  "{record.notes}"
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: Financial Profit & Actions */}
                          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                            <div className="text-left lg:text-right">
                              <span className="text-[10px] text-stone-400 uppercase font-bold block">
                                Laba Bersih Transaksi
                              </span>
                              <p className="text-lg font-black text-emerald-800 leading-tight">
                                {formatRupiah(record.netProfit)}
                              </p>
                              <div className="text-[10px] text-stone-500 flex items-center lg:justify-end gap-1 mt-0.5">
                                <span>Omzet: {formatRupiah(record.totalRevenue)}</span>
                                <span>•</span>
                                <span className="font-semibold text-emerald-700">Margin {record.profitMarginPercent}%</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setPrintingRecord(record)}
                                className="p-2 text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl border border-stone-200 transition-colors flex items-center gap-1 text-xs font-semibold"
                                title="Cetak Surat Jalan & Nota"
                              >
                                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                                <span className="hidden sm:inline">Surat Jalan</span>
                              </button>

                              <button
                                onClick={() => onEditRecord(record)}
                                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
                                title="Edit Transaksi Ini"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Hapus catatan produksi tanggal ${record.date} di ${record.location}?`)) {
                                    onDeleteRecord(record.id);
                                  }
                                }}
                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                                title="Hapus Data Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Print Surat Jalan / Nota Modal */}
      <DeliveryReceiptModal
        isOpen={!!printingRecord}
        record={printingRecord}
        onClose={() => setPrintingRecord(null)}
      />
    </div>
  );
};
