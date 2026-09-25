import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  MapPin, 
  Calendar, 
  Truck, 
  Package, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Filter, 
  AlertTriangle,
  FileText,
  Trash2,
  Send
} from 'lucide-react';
import { ProductionRecord, StockDispatch, MANURE_TYPES, ManureType } from '../types';
import { calculateStockSummary } from '../utils/storage';
import { formatRupiah, formatNumber, formatDateIndonesian, getIndonesianDayName, getTodayString } from '../utils/formatters';

interface Props {
  productions: ProductionRecord[];
  dispatches: StockDispatch[];
  onAddDispatch: (dispatch: Omit<StockDispatch, 'id' | 'createdAt'>) => void;
  onDeleteDispatch: (id: string) => void;
  savedDestinations: string[];
  onAddDestination: (dest: string) => void;
}

export const StockOpnamePage: React.FC<Props> = ({
  productions,
  dispatches,
  onAddDispatch,
  onDeleteDispatch,
  savedDestinations,
  onAddDestination,
}) => {
  const todayStr = getTodayString();
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State untuk Pengiriman Stok Tersisa
  const [dispatchDate, setDispatchDate] = useState<string>(todayStr);
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [selectedManureType, setSelectedManureType] = useState<ManureType>('broiler');
  const [destination, setDestination] = useState<string>(savedDestinations[0] || '');
  const [newDestinationInput, setNewDestinationInput] = useState<string>('');
  const [isAddingNewDest, setIsAddingNewDest] = useState<boolean>(false);
  const [bagsToShip, setBagsToShip] = useState<number>(50);
  const [sellingPrice, setSellingPrice] = useState<number>(20000);
  const [dispatchNotes, setDispatchNotes] = useState<string>('');

  // Rekapitulasi Stok Otomatis berdasarkan formula user:
  // Hasil Ngarungi diambil dari total ngarungi karyawan
  // Sisa stok = Hasil Ngarungi - Yang Sudah Dikirim
  const stockSummaries = useMemo(() => {
    return calculateStockSummary(productions, dispatches);
  }, [productions, dispatches]);

  // Total Keseluruhan Karung
  const grandTotals = useMemo(() => {
    const totalProduced = stockSummaries.reduce((acc, cur) => acc + cur.totalProduced, 0);
    const totalShipped = stockSummaries.reduce((acc, cur) => acc + cur.totalShipped, 0);
    const totalStockRemaining = stockSummaries.reduce((acc, cur) => acc + cur.currentStock, 0);
    return { totalProduced, totalShipped, totalStockRemaining };
  }, [stockSummaries]);

  // Filter tampilan stok
  const filteredSummaries = useMemo(() => {
    return stockSummaries.filter((item) => {
      if (selectedLocationFilter !== 'all' && item.location !== selectedLocationFilter) {
        return false;
      }
      if (selectedTypeFilter !== 'all' && item.manureType !== selectedTypeFilter) {
        return false;
      }
      return true;
    });
  }, [stockSummaries, selectedLocationFilter, selectedTypeFilter]);

  // Daftar lokasi unik yang punya stok
  const uniqueFarmLocations = useMemo(() => {
    return Array.from(new Set(stockSummaries.map((s) => s.location)));
  }, [stockSummaries]);

  // Cek stok maksimum yang tersedia di lokasi & jenis terpilih untuk modal
  const activeStockAvailability = useMemo(() => {
    if (!selectedFarm) return 0;
    const match = stockSummaries.find(
      (s) => s.location === selectedFarm && s.manureType === selectedManureType
    );
    return match ? match.currentStock : 0;
  }, [stockSummaries, selectedFarm, selectedManureType]);

  const handleOpenDispatchModal = (farmLocation?: string, mType?: ManureType) => {
    if (farmLocation) setSelectedFarm(farmLocation);
    else if (uniqueFarmLocations.length > 0) setSelectedFarm(uniqueFarmLocations[0]);

    if (mType) setSelectedManureType(mType);
    setDispatchDate(todayStr);
    setIsModalOpen(true);
  };

  const handleSubmitDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarm) {
      alert('Pilih lokasi kandang ternak!');
      return;
    }
    if (!destination.trim()) {
      alert('Pilih atau masukkan tujuan pengiriman!');
      return;
    }
    if (bagsToShip <= 0) {
      alert('Jumlah karung yang dikirim harus lebih dari 0!');
      return;
    }
    if (bagsToShip > activeStockAvailability) {
      alert(`Stok di kandang ini hanya tersisa ${activeStockAvailability} karung!`);
      return;
    }

    const dayName = getIndonesianDayName(dispatchDate);
    const revenue = bagsToShip * sellingPrice;

    onAddDispatch({
      date: dispatchDate,
      dayName,
      location: selectedFarm,
      manureType: selectedManureType,
      destination: destination.trim(),
      bagsShipped: bagsToShip,
      sellingPricePerBag: sellingPrice,
      revenue,
      notes: dispatchNotes,
    });

    setIsModalOpen(false);
    setDispatchNotes('');
    alert(`Pengiriman ${bagsToShip} karung dari ${selectedFarm} berhasil dicatat! Sisa stok otomatis diperbarui.`);
  };

  return (
    <div className="space-y-6">
      {/* HERO BANNER STOK OPNAM */}
      <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-green-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-700/80 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-500/30 mb-3">
              <Boxes className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Manajemen Stok Opnam Kohe</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
              Stok Opnam Kotoran Hewan di Ternak
            </h2>
            <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
              Memantau kotoran hewan yang sudah dikarungi di lokasi kandang tetapi belum dikirim. 
              Data hasil ngarungi diambil otomatis dari input borongan karyawan, dikurangi yang sudah dikirim ke pembeli.
            </p>
          </div>

          <button
            onClick={() => handleOpenDispatchModal()}
            className="self-start md:self-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Send className="w-4 h-4 text-stone-950" />
            <span>Kirim Stok Tersisa dari Kandang</span>
          </button>
        </div>
      </div>

      {/* 3 STAT KARTU: HASIL NGARUNGI, SUDAH DIKIRIM & SISA STOK TINGGAL BERAPA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* HASIL NGARUNGI (DITARIK DARI INPUTAN) */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Hasil Ngarungi</span>
            <Package className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {formatNumber(grandTotals.totalProduced)} <span className="text-sm font-medium text-stone-400">Karung</span>
          </p>
          <p className="text-xs text-stone-500 mt-2">
            Total produksi dari {productions.length} kegiatan ngarungi karyawan
          </p>
        </div>

        {/* SUDAH DIKIRIM */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hasil Ngarungi Terkirim</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-800">
            {formatNumber(grandTotals.totalShipped)} <span className="text-sm font-medium text-stone-400">Karung</span>
          </p>
          <p className="text-xs text-stone-500 mt-2">
            Sudah diangkut armada & tiba di lokasi pembeli
          </p>
        </div>

        {/* SISA STOK BELUM DIKIRIM (HIGHLIGHT UTAMA) */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-md shadow-amber-600/20">
          <div className="flex items-center justify-between opacity-90 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-950">
              Sisa Stok Belum Dikirim di Ternak
            </span>
            <Boxes className="w-5 h-5 text-amber-950" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-950">
            {formatNumber(grandTotals.totalStockRemaining)} <span className="text-sm font-bold text-amber-950">Karung</span>
          </p>
          <p className="text-xs text-amber-950/80 mt-2 font-semibold">
            Tersimpan di kandang & siap diberangkatkan kapan saja
          </p>
        </div>
      </div>

      {/* FILTER STOK PER KANDANG & JENIS KOHE */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-lg font-black text-stone-900 font-serif flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              Sisa Stok Kohe di Masing-Masing Lokasi Ternak
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Rincian karung yang belum dikirim per kandang & per jenis kotoran ayam
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedLocationFilter}
              onChange={(e) => setSelectedLocationFilter(e.target.value)}
              className="px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
            >
              <option value="all">Semua Lokasi Kandang ({uniqueFarmLocations.length})</option>
              {uniqueFarmLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
            >
              <option value="all">Semua Jenis Kohe</option>
              <option value="broiler">Ayam Broiler</option>
              <option value="doc">Ayam DOC</option>
              <option value="layer">Ayam Petelur</option>
            </select>
          </div>
        </div>

        {/* LIST KARTU STOK PER LOKASI TERNAK */}
        {filteredSummaries.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500">
            <Boxes className="w-10 h-10 mx-auto text-stone-400 mb-2 opacity-60" />
            <p className="font-bold text-stone-700">Tidak Ada Data Stok di Ternak</p>
            <p className="text-xs text-stone-500 mt-1">
              Semua karung kotoran ayam di lokasi terpilih telah dikirim atau belum ada data ngarungi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSummaries.map((item) => {
              const typeInfo = MANURE_TYPES[item.manureType];
              const shippedPercent = item.totalProduced > 0 ? (item.totalShipped / item.totalProduced) * 100 : 0;
              const hasStock = item.currentStock > 0;

              return (
                <div
                  key={`${item.location}-${item.manureType}`}
                  className={`rounded-2xl p-5 border-2 transition-all shadow-xs ${
                    hasStock
                      ? 'bg-white border-stone-200 hover:border-emerald-400'
                      : 'bg-stone-50/70 border-stone-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${typeInfo.badgeColor}`}>
                        {typeInfo.shortLabel}
                      </span>
                      <h4 className="font-extrabold text-stone-900 text-base mt-1.5">{item.location}</h4>
                      <p className="text-[11px] text-stone-500">
                        Aktivitas Terakhir: {formatDateIndonesian(item.lastActivityDate, false)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">Sisa di Kandang:</span>
                      <span className={`text-2xl font-black ${hasStock ? 'text-amber-700' : 'text-stone-400'}`}>
                        {formatNumber(item.currentStock)}
                      </span>
                      <span className="text-xs text-stone-500 block">Karung Belum Kirim</span>
                    </div>
                  </div>

                  {/* Progress Bar Persentase Terkirim vs Sisa */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span>Progres Pengiriman:</span>
                      <span className="font-semibold text-stone-800">
                        {item.totalShipped} dari {item.totalProduced} Karung ({shippedPercent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${shippedPercent}%` }}
                        className="bg-blue-600 h-full transition-all duration-500"
                        title={`Terkirim: ${item.totalShipped} Karung`}
                      />
                      <div
                        style={{ width: `${100 - shippedPercent}%` }}
                        className="bg-amber-500 h-full transition-all duration-500"
                        title={`Sisa Belum Dikirim: ${item.currentStock} Karung`}
                      />
                    </div>
                  </div>

                  {/* Action button: Kirim dari stok kandang ini */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div className="text-[11px] text-stone-500">
                      {hasStock ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Siap diangkut armada
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">Semua karung telah terkirim</span>
                      )}
                    </div>

                    {hasStock && (
                      <button
                        onClick={() => handleOpenDispatchModal(item.location, item.manureType)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Kirim Stok Ini</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIWAYAT PENGIRIMAN SUSULAN DARI STOK KANDANG */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-stone-900 text-base">
              Riwayat Pengiriman Susulan dari Sisa Stok Kandang
            </h3>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {dispatches.length} Pengiriman Terdata
          </span>
        </div>

        {dispatches.length === 0 ? (
          <p className="text-xs text-stone-500 italic text-center py-6">
            Belum ada pengiriman susulan dari sisa stok kandang. Saat truk mengangkut karung yang tersisa, catat melalui tombol "Kirim Stok Tersisa".
          </p>
        ) : (
          <div className="divide-y divide-stone-100">
            {dispatches.map((disp) => {
              const typeInfo = MANURE_TYPES[disp.manureType];
              return (
                <div key={disp.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{formatDateIndonesian(disp.date)}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${typeInfo.badgeColor}`}>
                        {typeInfo.shortLabel}
                      </span>
                    </div>
                    <p className="text-stone-600">
                      Asal: <strong className="text-stone-800">{disp.location}</strong> ➔ Tujuan: <strong className="text-emerald-800">{disp.destination}</strong>
                    </p>
                    {disp.notes && <p className="text-stone-400 italic">"{disp.notes}"</p>}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="font-black text-stone-900 text-sm">{disp.bagsShipped} Karung</span>
                      <p className="text-[11px] text-stone-500">
                        {formatRupiah(disp.sellingPricePerBag)}/krg ({formatRupiah(disp.revenue)})
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Batalkan pengiriman susulan ini? Stok kandang akan dikembalikan.')) {
                          onDeleteDispatch(disp.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Batalkan pengiriman ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL INPUT PENGIRIMAN STOK TERSISA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-200 flex flex-col">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-base">Kirim Stok Tersisa dari Kandang</h3>
                  <p className="text-xs text-emerald-200">Catat karung kohe yang diangkut ke pembeli</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDispatch} className="p-6 space-y-4 text-xs">
              {/* Tanggal Kirim */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tanggal Pengiriman Armada</label>
                <input
                  type="date"
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                />
              </div>

              {/* Lokasi Kandang Asal */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Kandang Asal Stok</label>
                <select
                  value={selectedFarm}
                  onChange={(e) => setSelectedFarm(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                >
                  {uniqueFarmLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jenis Kotoran */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Jenis Kotoran Ayam</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['broiler', 'doc', 'layer'] as ManureType[]).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setSelectedManureType(t)}
                      className={`p-2 rounded-xl border text-center font-bold text-[11px] ${
                        selectedManureType === t
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      {MANURE_TYPES[t].shortLabel}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 p-2 bg-amber-50 text-amber-900 rounded-lg flex justify-between font-medium">
                  <span>Stok Tersedia di Kandang Ini:</span>
                  <strong className="text-amber-950">{activeStockAvailability} Karung</strong>
                </div>
              </div>

              {/* Tujuan Pengiriman */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-700">Tujuan Pengiriman / Pembeli</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewDest(!isAddingNewDest)}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    {isAddingNewDest ? 'Pilih Yang Ada' : '+ Baru'}
                  </button>
                </div>

                {isAddingNewDest ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan nama tujuan/pembeli"
                      value={newDestinationInput}
                      onChange={(e) => setNewDestinationInput(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newDestinationInput.trim()) {
                          onAddDestination(newDestinationInput.trim());
                          setDestination(newDestinationInput.trim());
                          setNewDestinationInput('');
                          setIsAddingNewDest(false);
                        }
                      }}
                      className="px-3 py-2 bg-emerald-700 text-white rounded-xl font-bold"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                  >
                    {savedDestinations.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Jumlah Karung & Harga Jual */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">Jumlah Karung</label>
                    <button
                      type="button"
                      onClick={() => setBagsToShip(activeStockAvailability)}
                      className="text-[10px] text-emerald-700 font-semibold hover:underline"
                    >
                      Semua ({activeStockAvailability})
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={activeStockAvailability}
                    value={bagsToShip}
                    onChange={(e) => setBagsToShip(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Harga Jual per Karung</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-sm"
                  />
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Catatan Armada / Sopir (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Truk Engkel No Pol N 8821 AB - Sopir Pak Joko"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              {/* Estimasi Pendapatan */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-900">Total Pendapatan Terbayar:</span>
                <span className="font-black text-emerald-950 text-sm">
                  {formatRupiah(bagsToShip * sellingPrice)}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={activeStockAvailability <= 0}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl font-bold shadow-md"
                >
                  Catat & Potong Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
