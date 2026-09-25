import { ProductionRecord, StockDispatch, StockSummaryByLocation, ManureType } from '../types';
import { getIndonesianDayName } from './formatters';

const STORAGE_KEY_PRODUCTIONS = 'la_kompos_production_records_v1';
const STORAGE_KEY_DISPATCHES = 'la_kompos_stock_dispatches_v1';
const STORAGE_KEY_CUSTOM_LOCATIONS = 'la_kompos_locations_v1';
const STORAGE_KEY_CUSTOM_DESTINATIONS = 'la_kompos_destinations_v1';

// Seed initial realistic data for L.A Kompos
const INITIAL_PRODUCTIONS: ProductionRecord[] = [
  {
    id: 'prod-1',
    date: '2026-09-24',
    dayName: 'Kamis',
    year: 2026,
    month: 9,
    location: 'Kandang Ayam Berkah Jaya - Blok A',
    totalBags: 450,
    sackPricePerPiece: 1500,
    manureType: 'broiler',
    manureCostPerBag: 4000,
    workerRatePerBag: 2500,
    totalWorkerWages: 1125000, // 450 * 2500
    mealAllowance: 100000,
    foremanSalary: 75000,
    additionalCost: 25000,
    sellingPricePerBag: 20000,
    destination: 'Perkebunan Sayur Dataran Tinggi Batu',
    bagsDeliveredToday: 350,
    bagsInStock: 100, // 100 karung masih di kandang
    totalCost: 3875000, // (450*1500=675k) + (450*4000=1.8M) + 1.125M + 100k + 75k + 25k = 3.8M
    costPerBag: 8444, // 3.8M / 450
    totalRevenue: 7000000, // 350 * 20000
    netProfit: 4044600, // 7.000.000 - (350 * 8444)
    profitMarginPercent: 57.8,
    notes: 'Kotoran kering kadar air < 25%, karyawan 4 orang selesai jam 15.00',
    createdAt: new Date('2026-09-24T08:30:00Z').toISOString(),
  },
  {
    id: 'prod-2',
    date: '2026-09-23',
    dayName: 'Rabu',
    year: 2026,
    month: 9,
    location: 'Peternakan Unggas Makmur - Cisarua',
    totalBags: 300,
    sackPricePerPiece: 1200,
    manureType: 'layer',
    manureCostPerBag: 5000,
    workerRatePerBag: 2500,
    totalWorkerWages: 750000,
    mealAllowance: 75000,
    foremanSalary: 50000,
    additionalCost: 15000,
    sellingPricePerBag: 22000,
    destination: 'Toko Pupuk & Saprotan Subur Tani',
    bagsDeliveredToday: 300,
    bagsInStock: 0,
    totalCost: 2750000,
    costPerBag: 9166,
    totalRevenue: 6600000,
    netProfit: 3850000,
    profitMarginPercent: 58.3,
    notes: 'Kotoran ayam petelur kualitas super, langsung lunas cash',
    createdAt: new Date('2026-09-23T09:00:00Z').toISOString(),
  },
  {
    id: 'prod-3',
    date: '2026-09-20',
    dayName: 'Minggu',
    year: 2026,
    month: 9,
    location: 'Kandang Ayam DOC Sumber Rezeki',
    totalBags: 200,
    sackPricePerPiece: 0, // Karung gratis dari pemilik kandang
    manureType: 'doc',
    manureCostPerBag: 3000,
    workerRatePerBag: 3000,
    totalWorkerWages: 600000,
    mealAllowance: 50000,
    foremanSalary: 0, // Tanpa mandor
    additionalCost: 20000,
    sellingPricePerBag: 18000,
    destination: 'Koperasi Tani Organik Nusantara',
    bagsDeliveredToday: 150,
    bagsInStock: 50, // 50 karung tersisa di kandang
    totalCost: 1270000,
    costPerBag: 6350,
    totalRevenue: 2700000,
    netProfit: 1747500,
    profitMarginPercent: 64.7,
    notes: 'Karung disediakan oleh pemilik kandang (gratis)',
    createdAt: new Date('2026-09-20T10:15:00Z').toISOString(),
  },
  {
    id: 'prod-4',
    date: '2026-08-28',
    dayName: 'Jumat',
    year: 2026,
    month: 8,
    location: 'Kandang Ayam Berkah Jaya - Blok A',
    totalBags: 500,
    sackPricePerPiece: 1500,
    manureType: 'broiler',
    manureCostPerBag: 4000,
    workerRatePerBag: 2000,
    totalWorkerWages: 1000000,
    mealAllowance: 120000,
    foremanSalary: 100000,
    additionalCost: 30000,
    sellingPricePerBag: 21000,
    destination: 'Perkebunan Sawit Mandiri Lestari',
    bagsDeliveredToday: 500,
    bagsInStock: 0,
    totalCost: 4000000,
    costPerBag: 8000,
    totalRevenue: 10500000,
    netProfit: 6500000,
    profitMarginPercent: 61.9,
    notes: 'Bulan Agustus pengiriman 1 armada truk tronton penuh',
    createdAt: new Date('2026-08-28T08:00:00Z').toISOString(),
  },
  {
    id: 'prod-5',
    date: '2026-07-15',
    dayName: 'Rabu',
    year: 2026,
    month: 7,
    location: 'Peternakan Unggas Makmur - Cisarua',
    totalBags: 400,
    sackPricePerPiece: 1500,
    manureType: 'layer',
    manureCostPerBag: 4500,
    workerRatePerBag: 2200,
    totalWorkerWages: 880000,
    mealAllowance: 100000,
    foremanSalary: 75000,
    additionalCost: 25000,
    sellingPricePerBag: 20000,
    destination: 'Toko Pupuk & Saprotan Subur Tani',
    bagsDeliveredToday: 400,
    bagsInStock: 0,
    totalCost: 3480000,
    costPerBag: 8700,
    totalRevenue: 8000000,
    netProfit: 4520000,
    profitMarginPercent: 56.5,
    notes: 'Produksi panen bulan Juli',
    createdAt: new Date('2026-07-15T09:00:00Z').toISOString(),
  },
];

const INITIAL_DISPATCHES: StockDispatch[] = [
  {
    id: 'disp-1',
    date: '2026-09-22',
    dayName: 'Selasa',
    location: 'Kandang Ayam DOC Sumber Rezeki',
    manureType: 'doc',
    destination: 'Petani Bunga & Tanaman Hias Lembang',
    bagsShipped: 25,
    sellingPricePerBag: 19000,
    revenue: 475000,
    notes: 'Pengiriman susulan dari sisa stok ngarungi tanggal 20',
    createdAt: new Date('2026-09-22T14:00:00Z').toISOString(),
  },
];

const DEFAULT_LOCATIONS = [
  'Kandang Ayam Berkah Jaya - Blok A',
  'Peternakan Unggas Makmur - Cisarua',
  'Kandang Ayam DOC Sumber Rezeki',
  'Kandang Ternak Barokah - Sukabumi',
  'Peternakan Mitra Mandiri - Subang',
];

const DEFAULT_DESTINATIONS = [
  'Perkebunan Sayur Dataran Tinggi Batu',
  'Toko Pupuk & Saprotan Subur Tani',
  'Koperasi Tani Organik Nusantara',
  'Perkebunan Sawit Mandiri Lestari',
  'Petani Bunga & Tanaman Hias Lembang',
  'Gudang Distributor Pupuk Agro Lestari',
];

export function loadProductionRecords(): ProductionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTIONS);
    if (!raw) {
      saveProductionRecords(INITIAL_PRODUCTIONS);
      return INITIAL_PRODUCTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading production records', e);
    return INITIAL_PRODUCTIONS;
  }
}

export function saveProductionRecords(records: ProductionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTIONS, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving production records', e);
  }
}

export function loadStockDispatches(): StockDispatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISPATCHES);
    if (!raw) {
      saveStockDispatches(INITIAL_DISPATCHES);
      return INITIAL_DISPATCHES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading stock dispatches', e);
    return INITIAL_DISPATCHES;
  }
}

export function saveStockDispatches(dispatches: StockDispatch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DISPATCHES, JSON.stringify(dispatches));
  } catch (e) {
    console.error('Error saving stock dispatches', e);
  }
}

export function loadCustomLocations(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_LOCATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
      return DEFAULT_LOCATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LOCATIONS;
  }
}

export function saveCustomLocation(newLoc: string): string[] {
  const current = loadCustomLocations();
  const trimmed = newLoc.trim();
  if (trimmed && !current.includes(trimmed)) {
    const updated = [trimmed, ...current];
    localStorage.setItem(STORAGE_KEY_CUSTOM_LOCATIONS, JSON.stringify(updated));
    return updated;
  }
  return current;
}

export function loadCustomDestinations(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_DESTINATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_DESTINATIONS, JSON.stringify(DEFAULT_DESTINATIONS));
      return DEFAULT_DESTINATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DESTINATIONS;
  }
}

export function saveCustomDestination(newDest: string): string[] {
  const current = loadCustomDestinations();
  const trimmed = newDest.trim();
  if (trimmed && !current.includes(trimmed)) {
    const updated = [trimmed, ...current];
    localStorage.setItem(STORAGE_KEY_CUSTOM_DESTINATIONS, JSON.stringify(updated));
    return updated;
  }
  return current;
}

/**
 * Menghitung rekapitulasi stok opnam kohe yang belum dikirim per lokasi kandang & jenis kotoran.
 * Formula:
 * Total Hasil Ngarungi = Total karung dari semua input ngarungi karyawan di lokasi tersebut
 * Total Sudah Dikirim = Pengiriman langsung saat ngarungi + Pengiriman susulan (stock dispatches)
 * Sisa Stok Belum Dikirim = Total Hasil Ngarungi - Total Sudah Dikirim
 */
export function calculateStockSummary(
  productions: ProductionRecord[],
  dispatches: StockDispatch[]
): StockSummaryByLocation[] {
  const map: Record<string, {
    location: string;
    manureType: ManureType;
    totalProduced: number;
    totalShipped: number;
    currentStock: number;
    lastActivityDate: string;
  }> = {};

  // Akumulasikan hasil ngarungi & pengiriman langsung
  productions.forEach((prod) => {
    const key = `${prod.location}___${prod.manureType}`;
    if (!map[key]) {
      map[key] = {
        location: prod.location,
        manureType: prod.manureType,
        totalProduced: 0,
        totalShipped: 0,
        currentStock: 0,
        lastActivityDate: prod.date,
      };
    }
    map[key].totalProduced += prod.totalBags;
    map[key].totalShipped += prod.bagsDeliveredToday;
    if (prod.date > map[key].lastActivityDate) {
      map[key].lastActivityDate = prod.date;
    }
  });

  // Akumulasikan pengiriman susulan dari stok kandang
  dispatches.forEach((disp) => {
    const key = `${disp.location}___${disp.manureType}`;
    if (!map[key]) {
      map[key] = {
        location: disp.location,
        manureType: disp.manureType,
        totalProduced: 0,
        totalShipped: 0,
        currentStock: 0,
        lastActivityDate: disp.date,
      };
    }
    map[key].totalShipped += disp.bagsShipped;
    if (disp.date > map[key].lastActivityDate) {
      map[key].lastActivityDate = disp.date;
    }
  });

  // Hitung sisa stok
  return Object.values(map).map((item) => ({
    ...item,
    currentStock: Math.max(0, item.totalProduced - item.totalShipped),
  })).sort((a, b) => b.currentStock - a.currentStock);
}
