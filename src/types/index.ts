export type ManureType = 'broiler' | 'doc' | 'layer';

export interface ManureTypeInfo {
  id: ManureType;
  label: string;
  shortLabel: string;
  badgeColor: string;
  description: string;
}

export const MANURE_TYPES: Record<ManureType, ManureTypeInfo> = {
  broiler: {
    id: 'broiler',
    label: 'Kotoran Ayam Broiler (Pedaging)',
    shortLabel: 'Ayam Broiler',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Kohe ayam pedaging dengan tekstur cepat kering dan kaya unsur hara',
  },
  doc: {
    id: 'doc',
    label: 'Kotoran Ayam DOC (Anak Ayam)',
    shortLabel: 'Ayam DOC',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Kohe halus dari pemeliharaan bibit ayam DOC',
  },
  layer: {
    id: 'layer',
    label: 'Kotoran Ayam Petelur (Layer)',
    shortLabel: 'Ayam Petelur',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Kohe ayam petelur berkadar kalsium dan nitrogen tinggi',
  },
};

export interface ProductionRecord {
  id: string;
  // Waktu & Lokasi
  date: string; // YYYY-MM-DD
  dayName: string; // Senin, Selasa, dll
  year: number;
  month: number; // 1-12
  location: string; // Lokasi ternak / kandang tempat ngarungi

  // Spesifikasi Karung & Kohe
  totalBags: number; // Total karung hasil ngarungi hari ini
  sackPricePerPiece: number; // Harga karung per pcs (0 - 3000)
  manureType: ManureType; // Jenis kotoran ayam
  manureCostPerBag: number; // Harga kotoran per karung (0 - 15000)

  // Gaji & Operasional
  workerRatePerBag: number; // Tarif borongan karyawan per karung (1000 - 5000)
  totalWorkerWages: number; // totalBags * workerRatePerBag
  mealAllowance: number; // Uang makan karyawan
  foremanSalary: number; // Gaji mandor (opsional, disiapkan)
  additionalCost: number; // Biaya lain (tali, transport, dll)

  // Penjualan & Tujuan
  sellingPricePerBag: number; // Harga jual kohe per karung
  destination: string; // Tujuan pengiriman / Pembeli
  bagsDeliveredToday: number; // Jumlah karung yang langsung dikirim hari ini
  bagsInStock: number; // Sisa karung masuk stok di kandang (totalBags - bagsDeliveredToday)

  // Hasil Kalkulasi Finansial
  totalCost: number; // Total modal HPP (karung + kotoran + borongan + makan + mandor + biaya lain)
  costPerBag: number; // HPP per karung (totalCost / totalBags)
  totalRevenue: number; // Total pendapatan dari karung yang dikirim/terjual hari ini
  netProfit: number; // Keuntungan bersih hari ini (totalRevenue - (costPerBag * bagsDeliveredToday) atau totalRevenue - totalCost jika disesuaikan)
  profitMarginPercent: number; // Persentase margin keuntungan
  
  notes?: string;
  createdAt: string;
}

export interface StockDispatch {
  id: string;
  productionId?: string; // id record produksi asal (jika terhubung)
  date: string;
  dayName: string;
  location: string; // Lokasi ternak asal stok
  manureType: ManureType;
  destination: string; // Tujuan pengiriman baru
  bagsShipped: number; // Jumlah karung yang dikirim
  sellingPricePerBag: number;
  revenue: number;
  notes?: string;
  createdAt: string;
}

export interface StockSummaryByLocation {
  location: string;
  manureType: ManureType;
  totalProduced: number;
  totalShipped: number;
  currentStock: number;
  lastActivityDate: string;
}

export interface MonthlyFinancialSummary {
  monthKey: string; // e.g. "2026-09"
  monthName: string; // "September 2026"
  year: number;
  month: number;
  totalBagsProduced: number;
  totalBagsShipped: number;
  totalCost: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  recordsCount: number;
}
