import React, { useState } from 'react';
import { 
  Calculator, 
  Boxes, 
  Download, 
  WifiOff, 
  RotateCcw, 
  Upload, 
  FileSpreadsheet,
  Menu,
  X
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { ProductionRecord, StockDispatch } from '../types';

interface HeaderProps {
  activeTab: 'calculator' | 'stock';
  onTabChange: (tab: 'calculator' | 'stock') => void;
  totalPendingStock: number;
  onResetData: () => void;
  productions: ProductionRecord[];
  dispatches: StockDispatch[];
  onImportData: (data: { productions: ProductionRecord[]; dispatches: StockDispatch[] }) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  totalPendingStock,
  onResetData,
  productions,
  dispatches,
  onImportData,
}) => {
  const isOnline = useOnlineStatus();
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleExportJSON = () => {
    const payload = {
      appName: 'L.A Kompos',
      exportDate: new Date().toISOString(),
      productions,
      dispatches,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `la-kompos-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowBackupMenu(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Tanggal',
      'Hari',
      'Lokasi Kandang',
      'Jenis Kohe',
      'Total Karung',
      'Harga Karung',
      'Harga Kotoran',
      'Tarif Borongan',
      'Gaji Karyawan',
      'Uang Makan',
      'Gaji Mandor',
      'Harga Jual',
      'Tujuan Kirim',
      'Karung Terkirim',
      'Karung Stok Kandang',
      'Total Modal',
      'Total Omzet',
      'Laba Bersih',
    ];

    const rows = productions.map((p) => [
      p.id,
      p.date,
      p.dayName,
      `"${p.location.replace(/"/g, '""')}"`,
      p.manureType,
      p.totalBags,
      p.sackPricePerPiece,
      p.manureCostPerBag,
      p.workerRatePerBag,
      p.totalWorkerWages,
      p.mealAllowance,
      p.foremanSalary,
      p.sellingPricePerBag,
      `"${p.destination.replace(/"/g, '""')}"`,
      p.bagsDeliveredToday,
      p.bagsInStock,
      p.totalCost,
      p.totalRevenue,
      p.netProfit,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `la-kompos-rekap-keuangan-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowBackupMenu(false);
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], 'UTF-8');
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (Array.isArray(parsed.productions)) {
            onImportData({
              productions: parsed.productions,
              dispatches: Array.isArray(parsed.dispatches) ? parsed.dispatches : [],
            });
            alert('Data L.A Kompos berhasil dipulihkan!');
          } else {
            alert('Format berkas tidak sesuai!');
          }
        } catch {
          alert('Gagal membaca berkas JSON.');
        }
      };
    }
    setShowBackupMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">
        {/* Top brand ribbon */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand Title */}
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onTabChange('calculator')}>
              <div className="relative group">
                <img
                  src="/logo.jpg"
                  alt="L.A Kompos Logo"
                  className="w-14 h-14 rounded-full border-2 border-emerald-600 p-0.5 object-cover shadow-md group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow border border-white">
                  PRO
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 font-serif">
                    L.A KOMPOS
                  </h1>
                  <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Sistem Kohe
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                  Organik & Berkualitas
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center bg-stone-100/90 p-1.5 rounded-xl border border-stone-200/80">
              <button
                onClick={() => onTabChange('calculator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Penghitung & Keuangan
              </button>
              <button
                onClick={() => onTabChange('stock')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                  activeTab === 'stock'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Boxes className="w-4 h-4" />
                Stok Opnam Kohe
                {totalPendingStock > 0 && (
                  <span className={`text-[11px] font-bold px-2 py-0.2 rounded-full ${
                    activeTab === 'stock'
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-amber-600 text-white'
                  }`}>
                    {totalPendingStock} krg
                  </span>
                )}
              </button>
            </div>

            {/* Action Buttons (Install, Backup, Status) */}
            <div className="flex items-center gap-2">
              {!isOnline && (
                <div className="hidden sm:flex items-center gap-1.5 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-semibold border border-amber-300">
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>Mode Offline</span>
                </div>
              )}

              {/* Backup / Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowBackupMenu(!showBackupMenu)}
                  className="p-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors"
                  title="Cadangkan atau Pulihkan Data"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                </button>

                {showBackupMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-800">Manajemen Data</p>
                      <p className="text-[10px] text-stone-500">Ekspor, impor atau reset data</p>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      Ekspor Laporan (Excel / CSV)
                    </button>

                    <button
                      onClick={handleExportJSON}
                      className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      Cadangkan Data (Backup JSON)
                    </button>

                    <label className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Pulihkan Data (Import JSON)</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                      />
                    </label>

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      onClick={() => {
                        setShowBackupMenu(false);
                        if (confirm('Apakah Anda yakin ingin mengatur ulang data ke data percontohan awal?')) {
                          onResetData();
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-500" />
                      Reset ke Contoh Awal
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Bottom Tab Bar */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-stone-200 flex flex-col gap-2 animate-in slide-in-from-top duration-150">
              <button
                onClick={() => {
                  onTabChange('calculator');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-100 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-5 h-5" />
                  <span>1. Penghitung & Keuangan</span>
                </div>
                <span className="text-xs opacity-75">{productions.length} Data</span>
              </button>

              <button
                onClick={() => {
                  onTabChange('stock');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'stock'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-100 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Boxes className="w-5 h-5" />
                  <span>2. Stok Opnam Kohe Ternak</span>
                </div>
                {totalPendingStock > 0 && (
                  <span className="bg-amber-400 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full">
                    {totalPendingStock} Karung Sisa
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </header>
  );
};
