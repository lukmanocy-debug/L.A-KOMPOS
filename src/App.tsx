import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { ProductionCalculator } from './components/ProductionCalculator';
import { FinancialCharts } from './components/FinancialCharts';
import { DailyRecordsList } from './components/DailyRecordsList';
import { StockOpnamePage } from './components/StockOpnamePage';
import { ProductionRecord, StockDispatch } from './types';
import { 
  loadProductionRecords, 
  saveProductionRecords, 
  loadStockDispatches, 
  saveStockDispatches, 
  loadCustomLocations, 
  saveCustomLocation, 
  loadCustomDestinations, 
  saveCustomDestination,
  calculateStockSummary 
} from './utils/storage';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { WifiOff, ArrowUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'stock'>('calculator');
  const [productions, setProductions] = useState<ProductionRecord[]>([]);
  const [dispatches, setDispatches] = useState<StockDispatch[]>([]);
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [savedDestinations, setSavedDestinations] = useState<string[]>([]);
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isOnline = useOnlineStatus();
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Load Initial Data from LocalStorage
  useEffect(() => {
    setProductions(loadProductionRecords());
    setDispatches(loadStockDispatches());
    setSavedLocations(loadCustomLocations());
    setSavedDestinations(loadCustomDestinations());

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hitung total sisa stok kandang belum dikirim
  const totalPendingStock = useMemo(() => {
    const summary = calculateStockSummary(productions, dispatches);
    return summary.reduce((acc, cur) => acc + cur.currentStock, 0);
  }, [productions, dispatches]);

  // Tambah / Perbarui Data Produksi Ngarungi
  const handleSaveProduction = (recordData: Omit<ProductionRecord, 'id' | 'createdAt'>) => {
    if (editingRecord) {
      const updated = productions.map((p) =>
        p.id === editingRecord.id
          ? { ...recordData, id: editingRecord.id, createdAt: editingRecord.createdAt }
          : p
      );
      setProductions(updated);
      saveProductionRecords(updated);
      setEditingRecord(null);
    } else {
      const newRecord: ProductionRecord = {
        ...recordData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const updated = [newRecord, ...productions];
      setProductions(updated);
      saveProductionRecords(updated);
    }
  };

  const handleDeleteProduction = (id: string) => {
    const updated = productions.filter((p) => p.id !== id);
    setProductions(updated);
    saveProductionRecords(updated);
  };

  const handleEditProduction = (record: ProductionRecord) => {
    setActiveTab('calculator');
    setEditingRecord(record);
    if (calculatorRef.current) {
      calculatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Tambah Pengiriman Stok Susulan dari Kandang
  const handleAddDispatch = (dispatchData: Omit<StockDispatch, 'id' | 'createdAt'>) => {
    const newDispatch: StockDispatch = {
      ...dispatchData,
      id: `disp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newDispatch, ...dispatches];
    setDispatches(updated);
    saveStockDispatches(updated);
  };

  const handleDeleteDispatch = (id: string) => {
    const updated = dispatches.filter((d) => d.id !== id);
    setDispatches(updated);
    saveStockDispatches(updated);
  };

  // Tambah Lokasi & Tujuan Baru
  const handleAddLocation = (loc: string) => {
    const updated = saveCustomLocation(loc);
    setSavedLocations(updated);
  };

  const handleAddDestination = (dest: string) => {
    const updated = saveCustomDestination(dest);
    setSavedDestinations(updated);
  };

  // Reset Data ke Data Percontohan
  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Import Data Backup JSON
  const handleImportData = (data: { productions: ProductionRecord[]; dispatches: StockDispatch[] }) => {
    setProductions(data.productions);
    saveProductionRecords(data.productions);
    if (data.dispatches) {
      setDispatches(data.dispatches);
      saveStockDispatches(data.dispatches);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setEditingRecord(null);
        }}
        totalPendingStock={totalPendingStock}
        onResetData={handleResetData}
        productions={productions}
        dispatches={dispatches}
        onImportData={handleImportData}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* TAB 1: PENGHITUNG DATA & KEUANGAN / TRANSAKSI */}
        {activeTab === 'calculator' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Form Input Ngarungi & Hitung Laba Otomatis */}
            <div ref={calculatorRef}>
              <ProductionCalculator
                onSaveRecord={handleSaveProduction}
                savedLocations={savedLocations}
                savedDestinations={savedDestinations}
                onAddLocation={handleAddLocation}
                onAddDestination={handleAddDestination}
                editingRecord={editingRecord}
                onCancelEdit={() => setEditingRecord(null)}
              />
            </div>

            {/* Diagram & Grafik Laba Bulanan */}
            <FinancialCharts productions={productions} />

            {/* Riwayat Data Disimpan Berdasarkan Tujuan Pengiriman */}
            <DailyRecordsList
              records={productions}
              onDeleteRecord={handleDeleteProduction}
              onEditRecord={handleEditProduction}
            />
          </div>
        )}

        {/* TAB 2: STOK OPNAM KOHE DI TERNAK / BELUM DIKIRIM */}
        {activeTab === 'stock' && (
          <div className="animate-in fade-in duration-200">
            <StockOpnamePage
              productions={productions}
              dispatches={dispatches}
              onAddDispatch={handleAddDispatch}
              onDeleteDispatch={handleDeleteDispatch}
              savedDestinations={savedDestinations}
              onAddDestination={handleAddDestination}
            />
          </div>
        )}

      </main>

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-stone-900 text-amber-300 px-3 py-2 rounded-xl text-xs font-semibold shadow-xl border border-stone-700 animate-in slide-in-from-bottom duration-200">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>Mode Luar Jaringan (Offline) — Semua data tetap tersimpan aman di HP/PC Anda</span>
        </div>
      )}

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-emerald-800 text-white rounded-full shadow-xl hover:bg-emerald-900 active:scale-95 transition-all border border-emerald-600/50"
          title="Kembali ke atas"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="L.A Kompos" className="w-6 h-6 rounded-full object-cover" />
            <span className="font-bold text-stone-800">L.A KOMPOS — Organik & Berkualitas</span>
          </div>
          <p>© {new Date().getFullYear()} L.A Kompos. Aplikasi Penghitung Ngarungi & Stok Opnam Kohe Ternak.</p>
        </div>
      </footer>
    </div>
  );
}
