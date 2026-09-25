import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  Package, 
  Calendar, 
  ArrowUpRight, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { ProductionRecord, MANURE_TYPES, ManureType } from '../types';
import { formatRupiah, formatNumber, INDONESIAN_MONTHS } from '../utils/formatters';

interface Props {
  productions: ProductionRecord[];
}

export const FinancialCharts: React.FC<Props> = ({ productions }) => {
  // Filter tahun (default: tahun aktif atau tahun terbaru)
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(productions.map((p) => p.year)));
    if (years.length === 0) return [new Date().getFullYear()];
    return years.sort((a, b) => b - a);
  }, [productions]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || 2026);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Filter data berdasarkan tahun
  const yearProductions = useMemo(() => {
    return productions.filter((p) => p.year === selectedYear);
  }, [productions, selectedYear]);

  // Rekapitulasi per bulan untuk grafik bulanan
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((monthNum) => {
      const records = yearProductions.filter((p) => p.month === monthNum);
      const revenue = records.reduce((acc, cur) => acc + cur.totalRevenue, 0);
      const cost = records.reduce((acc, cur) => acc + cur.totalCost, 0);
      const profit = records.reduce((acc, cur) => acc + cur.netProfit, 0);
      const bags = records.reduce((acc, cur) => acc + cur.totalBags, 0);
      const bagsShipped = records.reduce((acc, cur) => acc + cur.bagsDeliveredToday, 0);

      return {
        month: monthNum,
        name: INDONESIAN_MONTHS[monthNum - 1],
        shortName: INDONESIAN_MONTHS[monthNum - 1].slice(0, 3),
        revenue,
        cost,
        profit,
        bags,
        bagsShipped,
        recordsCount: records.length,
      };
    });
  }, [yearProductions]);

  // Statistik Keseluruhan Tahun Ini
  const yearlyTotals = useMemo(() => {
    const revenue = yearProductions.reduce((acc, cur) => acc + cur.totalRevenue, 0);
    const cost = yearProductions.reduce((acc, cur) => acc + cur.totalCost, 0);
    const profit = yearProductions.reduce((acc, cur) => acc + cur.netProfit, 0);
    const totalBags = yearProductions.reduce((acc, cur) => acc + cur.totalBags, 0);
    const totalShipped = yearProductions.reduce((acc, cur) => acc + cur.bagsDeliveredToday, 0);
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, cost, profit, totalBags, totalShipped, margin };
  }, [yearProductions]);

  // Komposisi Pengeluaran Keseluruhan
  const costBreakdown = useMemo(() => {
    const sack = yearProductions.reduce((acc, cur) => acc + (cur.totalBags * cur.sackPricePerPiece), 0);
    const manure = yearProductions.reduce((acc, cur) => acc + (cur.totalBags * cur.manureCostPerBag), 0);
    const wages = yearProductions.reduce((acc, cur) => acc + cur.totalWorkerWages, 0);
    const meals = yearProductions.reduce((acc, cur) => acc + cur.mealAllowance, 0);
    const foreman = yearProductions.reduce((acc, cur) => acc + cur.foremanSalary, 0);
    const extra = yearProductions.reduce((acc, cur) => acc + cur.additionalCost, 0);
    const grandTotal = sack + manure + wages + meals + foreman + extra || 1;

    return [
      { name: 'Upah Borongan Karyawan', value: wages, color: '#16a34a', percent: (wages / grandTotal) * 100 },
      { name: 'Bahan Baku Kotoran Mentah', value: manure, color: '#d97706', percent: (manure / grandTotal) * 100 },
      { name: 'Biaya Pembelian Karung', value: sack, color: '#2563eb', percent: (sack / grandTotal) * 100 },
      { name: 'Uang Makan Karyawan', value: meals, color: '#9333ea', percent: (meals / grandTotal) * 100 },
      { name: 'Gaji Mandor Lapangan', value: foreman, color: '#e11d48', percent: (foreman / grandTotal) * 100 },
      { name: 'Operasional Lain (Tali/BBM)', value: extra, color: '#64748b', percent: (extra / grandTotal) * 100 },
    ].sort((a, b) => b.value - a.value);
  }, [yearProductions]);

  // Distribusi Berdasarkan Jenis Kotoran
  const manureStats = useMemo(() => {
    const types: ManureType[] = ['broiler', 'doc', 'layer'];
    return types.map((t) => {
      const recs = yearProductions.filter((p) => p.manureType === t);
      const bags = recs.reduce((acc, cur) => acc + cur.totalBags, 0);
      const profit = recs.reduce((acc, cur) => acc + cur.netProfit, 0);
      const rev = recs.reduce((acc, cur) => acc + cur.totalRevenue, 0);
      return {
        type: t,
        info: MANURE_TYPES[t],
        bags,
        profit,
        revenue: rev,
      };
    });
  }, [yearProductions]);

  // Skala Maksimum untuk Grafik Batang Keuntungan
  const maxProfitInMonth = Math.max(...monthlyData.map((m) => Math.max(m.profit, m.revenue)), 1000000);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-8">
      {/* HEADER SECTION WITH YEAR PICKER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Laporan & Diagram Analisis Keuangan L.A Kompos</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 font-serif">
            Diagram Keuntungan & Performa Bulanan
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Analisis grafik keuntungan bersih per bulan, modal borongan, dan omzet kohe
          </p>
        </div>

        {/* Year Filter Select */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
          <Calendar className="w-4 h-4 text-stone-500" />
          <span className="text-xs text-stone-600 font-medium">Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent font-bold text-stone-900 text-sm focus:outline-none cursor-pointer"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Keuntungan Bersih */}
        <div className="bg-gradient-to-br from-emerald-800 to-green-700 rounded-2xl p-4 sm:p-5 text-white shadow-md shadow-emerald-800/20">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Laba Bersih</span>
            <TrendingUp className="w-4 h-4 text-emerald-300" />
          </div>
          <p className="text-xl sm:text-2xl font-black">{formatRupiah(yearlyTotals.profit)}</p>
          <div className="mt-2 text-[11px] text-emerald-100 flex items-center gap-1">
            <span>Rata-rata Margin:</span>
            <span className="font-bold text-white bg-black/20 px-1.5 py-0.5 rounded">
              {yearlyTotals.margin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Total Pendapatan / Omzet */}
        <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Omzet Penjualan</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-900">{formatRupiah(yearlyTotals.revenue)}</p>
          <p className="text-[11px] text-stone-500 mt-2">
            {formatNumber(yearlyTotals.totalShipped)} karung terkirim
          </p>
        </div>

        {/* Total Modal / Pengeluaran */}
        <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Modal / HPP</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-700">{formatRupiah(yearlyTotals.cost)}</p>
          <p className="text-[11px] text-stone-500 mt-2">Borongan, bahan, karung, konsumsi</p>
        </div>

        {/* Total Karung Produksi */}
        <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Hasil Ngarungi</span>
            <Package className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-900">{formatNumber(yearlyTotals.totalBags)}</p>
          <p className="text-[11px] text-stone-500 mt-2">Karung kohe berhasil diproduksi</p>
        </div>
      </div>

      {/* GRAFIK UTAMA: DIAGRAM BATANG KEUNTUNGAN BULANAN (Setiap Bulan Kelihatan Keuntungan yang Didapat) */}
      <div className="bg-stone-50/70 rounded-2xl p-5 sm:p-6 border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Grafik Keuntungan Bersih per Bulan ({selectedYear})
            </h4>
            <p className="text-xs text-stone-500">
              Arahkan kursor atau sentuh diagram untuk melihat rincian laba, omzet, dan karung setiap bulan
            </p>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-600"></span>
              <span className="text-stone-700">Laba Bersih</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-stone-300"></span>
              <span className="text-stone-500">Total Modal</span>
            </div>
          </div>
        </div>

        {/* Custom SVG Responsive Interactive Bar Chart */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[650px] h-64 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-stone-200">
            {monthlyData.map((m) => {
              const profitHeight = m.profit > 0 ? (m.profit / maxProfitInMonth) * 100 : 0;
              const costHeight = m.cost > 0 ? (m.cost / maxProfitInMonth) * 100 : 0;
              const isHovered = hoveredMonth === m.month;
              const hasData = m.recordsCount > 0;

              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredMonth(m.month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Tooltip Popup on Hover */}
                  {isHovered && (
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-stone-900 text-white p-3 rounded-xl shadow-xl z-20 text-xs w-48 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <p className="font-bold text-emerald-400 border-b border-stone-700 pb-1 mb-1">
                        {m.name} {selectedYear}
                      </p>
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-stone-400">Keuntungan:</span>
                          <span className="font-bold text-emerald-300">{formatRupiah(m.profit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Omzet:</span>
                          <span className="text-stone-200">{formatRupiah(m.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Modal:</span>
                          <span className="text-rose-300">{formatRupiah(m.cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Hasil Ngarungi:</span>
                          <span className="text-stone-200">{m.bags} karung</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dual Bars: Modal & Laba Bersih */}
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    {/* Bar Modal */}
                    <div
                      style={{ height: `${Math.max(hasData ? 6 : 2, costHeight)}%` }}
                      className={`w-3 sm:w-4 rounded-t-sm transition-all duration-300 ${
                        hasData ? 'bg-stone-300 group-hover:bg-stone-400' : 'bg-stone-200/50'
                      }`}
                      title={`Modal: ${formatRupiah(m.cost)}`}
                    />

                    {/* Bar Keuntungan Bersih */}
                    <div
                      style={{ height: `${Math.max(hasData ? 8 : 2, profitHeight)}%` }}
                      className={`w-4 sm:w-6 rounded-t-md transition-all duration-300 relative shadow-sm ${
                        hasData
                          ? isHovered
                            ? 'bg-emerald-500 scale-105'
                            : 'bg-emerald-700 hover:bg-emerald-600'
                          : 'bg-stone-200/50'
                      }`}
                    >
                      {hasData && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-900 bg-white/90 px-1 rounded shadow-xs whitespace-nowrap hidden sm:inline">
                          {Math.round(m.profit / 1000)}k
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Month Label */}
                  <div className="mt-2 text-center">
                    <span className={`text-[11px] font-bold block ${hasData ? 'text-stone-800' : 'text-stone-400'}`}>
                      {m.shortName}
                    </span>
                    {hasData && (
                      <span className="text-[9px] text-emerald-700 font-semibold block sm:hidden">
                        {Math.round(m.profit / 1000)}k
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Keterangan Tambahan */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-stone-500 px-1">
          <span>* Angka di atas batang menunjukkan keuntungan bersih dalam ribuan rupiah (k = ×1.000).</span>
          <span className="font-semibold text-emerald-800">
            Bulan Terlaris: {monthlyData.reduce((prev, cur) => cur.profit > prev.profit ? cur : prev, monthlyData[0]).name}
          </span>
        </div>
      </div>

      {/* 2 SUB-DIAGRAM: KOMPOSISI PENGELUARAN MODAL & PERFORMA PER JENIS KOHE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* DIAGRAM 1: RINCIAN PENGELUARAN MODAL (7 Cols) */}
        <div className="lg:col-span-7 bg-stone-50/60 rounded-2xl p-5 sm:p-6 border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                Rincian Alokasi Modal & Biaya Operasional ({selectedYear})
              </h4>
              <span className="text-xs font-semibold text-stone-500">
                Total: {formatRupiah(yearlyTotals.cost)}
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {costBreakdown.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-stone-800">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{formatRupiah(item.value)}</span>
                      <span className="text-[11px] text-stone-500 w-12 text-right">
                        ({item.percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  {/* Progress bar visual */}
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percent, 1)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Sistem borongan memastikan upah sebanding dengan hasil karung yang didapat.</span>
          </div>
        </div>

        {/* DIAGRAM 2: PERFORMA BERDASARKAN 3 JENIS KOTORAN (5 Cols) */}
        <div className="lg:col-span-5 bg-stone-50/60 rounded-2xl p-5 sm:p-6 border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Performa per Jenis Kohe
            </h4>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              3 Kategori
            </span>
          </div>

          <div className="space-y-3.5 mt-2">
            {manureStats.map((item) => (
              <div key={item.type} className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${item.info.badgeColor}`}>
                    {item.info.shortLabel}
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    Laba: {formatRupiah(item.profit)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 mt-2 pt-2 border-t border-stone-100">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Produksi:</span>
                    <span className="font-bold text-stone-800">{formatNumber(item.bags)} Karung</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Omzet Penjualan:</span>
                    <span className="font-bold text-stone-800">{formatRupiah(item.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
            <strong>Catatan Kualitas:</strong> Setiap jenis kohe memiliki karakteristik kelembaban dan harga pasar yang berbeda untuk memaksimalkan laba.
          </div>
        </div>

      </div>
    </div>
  );
};
