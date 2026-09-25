import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  MapPin, 
  Calendar, 
  Package, 
  DollarSign, 
  Users, 
  Truck, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ManureType, MANURE_TYPES, ProductionRecord } from '../types';
import { formatRupiah, formatNumber, formatDateIndonesian, getIndonesianDayName, getTodayString } from '../utils/formatters';

interface Props {
  onSaveRecord: (record: Omit<ProductionRecord, 'id' | 'createdAt'>) => void;
  savedLocations: string[];
  savedDestinations: string[];
  onAddLocation: (loc: string) => void;
  onAddDestination: (dest: string) => void;
  editingRecord?: ProductionRecord | null;
  onCancelEdit?: () => void;
}

export const ProductionCalculator: React.FC<Props> = ({
  onSaveRecord,
  savedLocations,
  savedDestinations,
  onAddLocation,
  onAddDestination,
  editingRecord,
  onCancelEdit,
}) => {
  // 1. Waktu & Lokasi
  const [date, setDate] = useState<string>(getTodayString());
  const [location, setLocation] = useState<string>('');
  const [newLocationInput, setNewLocationInput] = useState<string>('');
  const [isAddingLocation, setIsAddingLocation] = useState<boolean>(false);

  // 2. Karung & Jenis Kotoran
  const [totalBags, setTotalBags] = useState<number>(400);
  const [sackPricePerPiece, setSackPricePerPiece] = useState<number>(1500);
  const [manureType, setManureType] = useState<ManureType>('broiler');
  const [manureCostPerBag, setManureCostPerBag] = useState<number>(4000);

  // 3. Tenaga Kerja & Operasional
  const [workerRatePerBag, setWorkerRatePerBag] = useState<number>(2500);
  const [mealAllowance, setMealAllowance] = useState<number>(75000);
  const [hasForeman, setHasForeman] = useState<boolean>(true);
  const [foremanSalary, setForemanSalary] = useState<number>(50000);
  const [additionalCost, setAdditionalCost] = useState<number>(20000);
  const [notes, setNotes] = useState<string>('');

  // 4. Penjualan & Tujuan Kirim
  const [sellingPricePerBag, setSellingPricePerBag] = useState<number>(20000);
  const [destination, setDestination] = useState<string>('');
  const [newDestinationInput, setNewDestinationInput] = useState<string>('');
  const [isAddingDestination, setIsAddingDestination] = useState<boolean>(false);
  const [bagsDeliveredToday, setBagsDeliveredToday] = useState<number>(400);

  const [notification, setNotification] = useState<string | null>(null);

  // Inisialisasi lokasi & tujuan awal
  useEffect(() => {
    if (savedLocations.length > 0 && !location) {
      setLocation(savedLocations[0]);
    }
    if (savedDestinations.length > 0 && !destination) {
      setDestination(savedDestinations[0]);
    }
  }, [savedLocations, savedDestinations, location, destination]);

  // Handle edit mode
  useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setLocation(editingRecord.location);
      setTotalBags(editingRecord.totalBags);
      setSackPricePerPiece(editingRecord.sackPricePerPiece);
      setManureType(editingRecord.manureType);
      setManureCostPerBag(editingRecord.manureCostPerBag);
      setWorkerRatePerBag(editingRecord.workerRatePerBag);
      setMealAllowance(editingRecord.mealAllowance);
      setHasForeman(editingRecord.foremanSalary > 0);
      setForemanSalary(editingRecord.foremanSalary);
      setAdditionalCost(editingRecord.additionalCost);
      setSellingPricePerBag(editingRecord.sellingPricePerBag);
      setDestination(editingRecord.destination);
      setBagsDeliveredToday(editingRecord.bagsDeliveredToday);
      setNotes(editingRecord.notes || '');
    }
  }, [editingRecord]);

  // Sinkronisasi karung kirim jika total karung berubah (jika default sama)
  const handleTotalBagsChange = (val: number) => {
    const valid = Math.max(0, val);
    setTotalBags(valid);
    if (bagsDeliveredToday > valid || bagsDeliveredToday === totalBags) {
      setBagsDeliveredToday(valid);
    }
  };

  // Perhitungan Keuangan Real-Time
  const actualForeman = hasForeman ? foremanSalary : 0;
  const totalSackCost = totalBags * sackPricePerPiece;
  const totalManureCost = totalBags * manureCostPerBag;
  const totalWorkerWages = totalBags * workerRatePerBag;
  const totalCost = totalSackCost + totalManureCost + totalWorkerWages + mealAllowance + actualForeman + additionalCost;
  const costPerBag = totalBags > 0 ? totalCost / totalBags : 0;

  const validBagsDelivered = Math.min(totalBags, Math.max(0, bagsDeliveredToday));
  const bagsInStock = Math.max(0, totalBags - validBagsDelivered);
  const totalRevenue = validBagsDelivered * sellingPricePerBag;

  // Laba bersih terealisasi dari penjualan karung yang dikirim
  const costOfDeliveredBags = validBagsDelivered * costPerBag;
  const netProfit = totalRevenue - costOfDeliveredBags;
  const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Nilai aset stok kandang yang belum dikirim
  const stockInventoryValue = bagsInStock * costPerBag;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert('Mohon pilih atau masukkan lokasi ternak/kandang!');
      return;
    }
    if (!destination.trim()) {
      alert('Mohon pilih atau masukkan tujuan pengiriman!');
      return;
    }
    if (totalBags <= 0) {
      alert('Total karung hasil ngarungi harus lebih dari 0!');
      return;
    }

    const [year, month] = date.split('-').map(Number);
    const dayName = getIndonesianDayName(date);

    onSaveRecord({
      date,
      dayName,
      year: year || new Date().getFullYear(),
      month: month || new Date().getMonth() + 1,
      location: location.trim(),
      totalBags,
      sackPricePerPiece,
      manureType,
      manureCostPerBag,
      workerRatePerBag,
      totalWorkerWages,
      mealAllowance,
      foremanSalary: actualForeman,
      additionalCost,
      sellingPricePerBag,
      destination: destination.trim(),
      bagsDeliveredToday: validBagsDelivered,
      bagsInStock,
      totalCost,
      costPerBag: Math.round(costPerBag),
      totalRevenue,
      netProfit: Math.round(netProfit),
      profitMarginPercent: Number(profitMarginPercent.toFixed(1)),
      notes,
    });

    setNotification('Data ngarungi & kalkulasi laba berhasil disimpan!');
    setTimeout(() => setNotification(null), 3500);

    if (editingRecord && onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span className="font-semibold text-sm">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Hero Brand & Description Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center">
          <img src="/logo.jpg" alt="Logo Watermark" className="w-96 h-96 object-cover -mr-16 rounded-full" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-700/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kalkulator Cerdas Borongan & Laba Kohe</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
            {editingRecord ? 'Edit Data Ngarungi & Keuangan' : 'Input Data Ngarungi Kohe & Hitung Laba Otomatis'}
          </h2>
          <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
            Sistem otomatis menghitung total modal pengeluaran (karung, upah borongan, bahan kotoran, uang makan, gaji mandor) 
            dan keuntungan bersih berdasarkan harga jual serta tujuan pengiriman hari ini.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GRID LAYOUT: INPUT FORM + LIVE FINANCIAL SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: FORM INPUT SECTIONS (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* SEKSI 1: WAKTU & LOKASI TERNAK */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-100 text-emerald-900">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">1. Waktu & Lokasi Ternak (Kandang Ngarungi)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tanggal */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                    <span>Hari, Tanggal & Tahun</span>
                    <span className="text-[11px] text-emerald-700 font-normal">{getIndonesianDayName(date)}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                    <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">{formatDateIndonesian(date)}</p>
                </div>

                {/* Lokasi Ternak */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-700">Lokasi Ngarungi / Kandang</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingLocation(!isAddingLocation)}
                      className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {isAddingLocation ? 'Pilih Yang Ada' : 'Tambah Kandang Baru'}
                    </button>
                  </div>

                  {isAddingLocation ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: Kandang Berkah - Blok B"
                        value={newLocationInput}
                        onChange={(e) => setNewLocationInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newLocationInput.trim()) {
                            onAddLocation(newLocationInput.trim());
                            setLocation(newLocationInput.trim());
                            setNewLocationInput('');
                            setIsAddingLocation(false);
                          }
                        }}
                        className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                      >
                        Simpan
                      </button>
                    </div>
                  ) : (
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    >
                      <option value="" disabled>-- Pilih Lokasi Kandang --</option>
                      {savedLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[11px] text-stone-500 mt-1">Tempat karyawan mengarungi kotoran ayam</p>
                </div>
              </div>
            </div>

            {/* SEKSI 2: JENIS KOTORAN, HARGA KARUNG & BAHAN BAKU */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-100 text-emerald-900">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">2. Jenis Kotoran, Karung & Bahan Baku</h3>
              </div>

              {/* 3 Jenis Kotoran Ayam (Sesuai Permintaan) */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Pilih Jenis Kotoran Ayam (Pilih Terlebih Dahulu Sebelum Input Harga):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(MANURE_TYPES) as ManureType[]).map((typeKey) => {
                    const info = MANURE_TYPES[typeKey];
                    const isSelected = manureType === typeKey;
                    return (
                      <button
                        type="button"
                        key={typeKey}
                        onClick={() => setManureType(typeKey)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/70 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${info.badgeColor}`}>
                            {info.shortLabel}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="font-bold text-xs text-stone-900 mt-1">{info.label}</p>
                        <p className="text-[11px] text-stone-500 mt-1 leading-snug">{info.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Karung & Harga Karung */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                {/* Total Karung Hasil Ngarungi */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Hasil Ngarungi Karyawan (Total Karung)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={totalBags || ''}
                      onChange={(e) => handleTotalBagsChange(Number(e.target.value))}
                      required
                      placeholder="Contoh: 400"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                    <span className="absolute right-3 top-3 text-xs font-semibold text-stone-400">Karung</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[100, 200, 300, 400, 500, 750].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => handleTotalBagsChange(preset)}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium ${
                          totalBags === preset ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {preset} krg
                      </button>
                    ))}
                  </div>
                </div>

                {/* Harga Karung Per Pcs (0 - 3000) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-700">
                      Harga Karung per Pcs (Rp 0 - 3.000)
                    </label>
                    <span className="text-[11px] font-bold text-emerald-800">
                      Subtotal: {formatRupiah(totalSackCost)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-semibold text-stone-400">Rp</span>
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      step="100"
                      value={sackPricePerPiece}
                      onChange={(e) => setSackPricePerPiece(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[
                      { label: 'Gratis (0)', val: 0 },
                      { label: '1.000', val: 1000 },
                      { label: '1.200', val: 1200 },
                      { label: '1.500', val: 1500 },
                      { label: '2.000', val: 2000 },
                      { label: '3.000', val: 3000 },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.val}
                        onClick={() => setSackPricePerPiece(item.val)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                          sackPricePerPiece === item.val
                            ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                            : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Harga Beli Kotoran per Karung (0 - 15.000) */}
              <div className="mt-4 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    Harga Kotoran {MANURE_TYPES[manureType].shortLabel} per Karung (Rp 0 - 15.000)
                  </label>
                  <span className="text-[11px] font-bold text-emerald-800">
                    Subtotal Bahan: {formatRupiah(totalManureCost)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-semibold text-stone-400">Rp</span>
                    <input
                      type="number"
                      min="0"
                      max="25000"
                      step="500"
                      value={manureCostPerBag}
                      onChange={(e) => setManureCostPerBag(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: 'Gratis (0)', val: 0 },
                      { label: '3.000', val: 3000 },
                      { label: '4.000', val: 4000 },
                      { label: '5.000', val: 5000 },
                      { label: '8.000', val: 8000 },
                      { label: '10.000', val: 10000 },
                      { label: '15.000', val: 15000 },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.val}
                        onClick={() => setManureCostPerBag(item.val)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                          manureCostPerBag === item.val
                            ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                            : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Biaya tebus/beli kotoran hewan mentah dari peternak (dari gratis sampai 15rb/karung)
                </p>
              </div>
            </div>

            {/* SEKSI 3: UPAH BORONGAN, UANG MAKAN & MANDOR */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-100 text-emerald-900">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">3. Gaji Karyawan Borongan, Uang Makan & Mandor</h3>
              </div>

              <div className="space-y-4">
                {/* Tarif Borongan per Karung (1.000 - 5.000) */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div>
                      <label className="text-xs font-bold text-stone-800">
                        Tarif Gaji Karyawan Borongan per Karung (Rp 1.000 - 5.000)
                      </label>
                      <p className="text-[11px] text-stone-500">
                        Total tergantung berapa banyak karung yang dikarungi ({totalBags} karung × {formatRupiah(workerRatePerBag)})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-stone-500">Total Upah Borongan:</span>
                      <p className="text-base font-black text-emerald-800">{formatRupiah(totalWorkerWages)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                    <div className="relative w-full sm:w-44">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-stone-400">Rp</span>
                      <input
                        type="number"
                        min="1000"
                        max="10000"
                        step="100"
                        value={workerRatePerBag}
                        onChange={(e) => setWorkerRatePerBag(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 font-bold text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {[1500, 2000, 2500, 3000, 3500, 4000, 5000].map((rate) => (
                        <button
                          type="button"
                          key={rate}
                          onClick={() => setWorkerRatePerBag(rate)}
                          className={`text-xs px-2 py-1 rounded-lg border font-semibold ${
                            workerRatePerBag === rate
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {rate.toLocaleString()} /krg
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Uang Makan & Gaji Mandor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Uang Makan */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Uang Makan Karyawan (Total Hari Ini)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-stone-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={mealAllowance}
                        onChange={(e) => setMealAllowance(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[50000, 75000, 100000, 125000, 150000].map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setMealAllowance(preset)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 hover:bg-stone-200"
                        >
                          {preset / 1000}rb
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gaji Mandor (Kadang ada kadang tidak ada) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-700">Gaji Mandor</label>
                      <button
                        type="button"
                        onClick={() => setHasForeman(!hasForeman)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                          hasForeman ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {hasForeman ? 'Ada Mandor' : 'Tanpa Mandor'}
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-stone-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        disabled={!hasForeman}
                        value={hasForeman ? foremanSalary : 0}
                        onChange={(e) => setForemanSalary(Number(e.target.value))}
                        className={`w-full pl-9 pr-3 py-2.5 border rounded-xl font-semibold text-sm transition-all ${
                          hasForeman
                            ? 'bg-stone-50 border-stone-300 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white'
                            : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">Disiapkan jika mandor lapangan bertugas</p>
                  </div>
                </div>

                {/* Biaya Lain & Catatan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Biaya Operasional Lain (Tali Rafia/BBM)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-stone-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={additionalCost}
                        onChange={(e) => setAdditionalCost(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Catatan Lapangan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Kondisi kohe kering super, tali rafia merah"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEKSI 4: PENJUALAN & TUJUAN PENGIRIMAN */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-100 text-emerald-900">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">4. Penjualan & Tujuan Pengiriman Hari Ini</h3>
              </div>

              <div className="space-y-4">
                {/* Tujuan Pengiriman */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-700">Tujuan Pengiriman / Nama Pembeli</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingDestination(!isAddingDestination)}
                      className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {isAddingDestination ? 'Pilih Yang Ada' : 'Tambah Tujuan Baru'}
                    </button>
                  </div>

                  {isAddingDestination ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: Perkebunan Sayur Cangar / Toko Tani Jaya"
                        value={newDestinationInput}
                        onChange={(e) => setNewDestinationInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newDestinationInput.trim()) {
                            onAddDestination(newDestinationInput.trim());
                            setDestination(newDestinationInput.trim());
                            setNewDestinationInput('');
                            setIsAddingDestination(false);
                          }
                        }}
                        className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                      >
                        Simpan
                      </button>
                    </div>
                  ) : (
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    >
                      <option value="" disabled>-- Pilih Tujuan Pengiriman --</option>
                      {savedDestinations.map((dest) => (
                        <option key={dest} value={dest}>
                          {dest}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[11px] text-stone-500 mt-1">
                    Data hari ini akan disimpan dan dikelompokkan ke dalam tujuan pengiriman ini
                  </p>
                </div>

                {/* Harga Jual per Karung & Jumlah Kirim Hari Ini */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Harga Jual Kohe per Karung
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-stone-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={sellingPricePerBag}
                        onChange={(e) => setSellingPricePerBag(Number(e.target.value))}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[18000, 20000, 22000, 25000, 28000, 30000].map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setSellingPricePerBag(preset)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium"
                        >
                          {preset / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-700">Karung Langsung Dikirim Hari Ini</label>
                      <button
                        type="button"
                        onClick={() => setBagsDeliveredToday(totalBags)}
                        className="text-[11px] text-emerald-700 font-semibold hover:underline"
                      >
                        Kirim Semua ({totalBags})
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={totalBags}
                        value={bagsDeliveredToday}
                        onChange={(e) => setBagsDeliveredToday(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                      <span className="absolute right-3 top-3 text-xs font-semibold text-stone-400">Karung</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] bg-stone-100 px-3 py-1.5 rounded-lg">
                      <span className="text-stone-600">Sisa Masuk Stok Ternak:</span>
                      <span className={`font-bold ${bagsInStock > 0 ? 'text-amber-800' : 'text-stone-700'}`}>
                        {bagsInStock} karung ({bagsInStock > 0 ? 'Belum Dikirim' : 'Semua Terkirim'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE FINANCIAL COMPUTATION CARD & PROFIT BREAKDOWN (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

            {/* HASIL OTOMATIS: MODAL, PENDAPATAN & LABA BERSIH */}
            <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-emerald-950 text-white rounded-3xl p-6 shadow-2xl border border-stone-800 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-white">Hasil Kalkulasi Laba Rugi</h3>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </div>

              {/* PROFIT HIGHLIGHT BOX */}
              <div className="mt-5 p-5 bg-gradient-to-br from-emerald-800/80 to-green-700/80 rounded-2xl border border-emerald-400/30 text-center relative overflow-hidden">
                <p className="text-xs uppercase tracking-wider font-extrabold text-emerald-200">
                  Keuntungan Bersih (Laba Bersih Hari Ini)
                </p>
                <p className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                  {formatRupiah(netProfit)}
                </p>

                <div className="mt-3 flex items-center justify-center gap-3 text-xs">
                  <div className="bg-black/20 px-2.5 py-1 rounded-lg">
                    <span className="text-emerald-200">Margin: </span>
                    <span className="font-bold text-white">{profitMarginPercent.toFixed(1)}%</span>
                  </div>
                  <div className="bg-black/20 px-2.5 py-1 rounded-lg">
                    <span className="text-emerald-200">Laba/Krg: </span>
                    <span className="font-bold text-white">
                      {formatRupiah(validBagsDelivered > 0 ? netProfit / validBagsDelivered : 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* FINANCIAL BREAKDOWN */}
              <div className="mt-6 space-y-3 text-xs">
                {/* Total Omzet */}
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-stone-300">Total Pendapatan (Omzet Penjualan):</span>
                  <span className="text-sm font-bold text-emerald-300">{formatRupiah(totalRevenue)}</span>
                </div>

                {/* Total Modal HPP */}
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <div>
                    <span className="text-stone-300">Total Modal (HPP Produksi):</span>
                    <span className="text-[10px] text-stone-400 block">
                      HPP per karung: {formatRupiah(costPerBag)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-rose-300">{formatRupiah(totalCost)}</span>
                </div>

                {/* Rincian Komponen Biaya */}
                <div className="bg-white/5 rounded-xl p-3 space-y-1.5 text-[11px] text-stone-300">
                  <div className="flex justify-between">
                    <span>• Biaya Karung ({totalBags} × {formatRupiah(sackPricePerPiece)}):</span>
                    <span className="font-medium text-white">{formatRupiah(totalSackCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Bahan Kohe ({totalBags} × {formatRupiah(manureCostPerBag)}):</span>
                    <span className="font-medium text-white">{formatRupiah(totalManureCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Borongan Karyawan ({totalBags} × {formatRupiah(workerRatePerBag)}):</span>
                    <span className="font-medium text-white">{formatRupiah(totalWorkerWages)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Uang Makan Karyawan:</span>
                    <span className="font-medium text-white">{formatRupiah(mealAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Gaji Mandor Lapangan:</span>
                    <span className="font-medium text-white">{formatRupiah(actualForeman)}</span>
                  </div>
                  {additionalCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Operasional Lain:</span>
                      <span className="font-medium text-white">{formatRupiah(additionalCost)}</span>
                    </div>
                  )}
                </div>

                {/* Sisa Stok Ternak */}
                {bagsInStock > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold">{bagsInStock} Karung Masuk Stok Ternak</span>
                      <p className="text-[10px] text-amber-300/80">Aset modal tersimpan: {formatRupiah(stockInventoryValue)}</p>
                    </div>
                    <span className="text-[10px] bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                      Siap Kirim Nanti
                    </span>
                  </div>
                )}
              </div>

              {/* ACTION SUBMIT BUTTON */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-950" />
                  <span>{editingRecord ? 'Perbarui Data Ngarungi' : 'Simpan Data & Laba Hari Ini'}</span>
                </button>

                {editingRecord && onCancelEdit && (
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="w-full py-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-800">Prinsip Borongan L.A Kompos:</p>
                <p className="mt-0.5 leading-relaxed">
                  Total borongan karyawan otomatis terhitung dari perkalian jumlah karung dengan tarif per karung ({formatRupiah(workerRatePerBag)}). 
                  Data akan otomatis tersimpan dalam kelompok tujuan pengiriman dan siap dianalisis pada grafik bulanan di bawah.
                </p>
              </div>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
};
