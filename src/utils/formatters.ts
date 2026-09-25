export const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function getIndonesianDayName(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return INDONESIAN_DAYS[date.getDay()] || 'Senin';
  } catch {
    return 'Senin';
  }
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return Math.round(val).toLocaleString('id-ID');
}

export function formatDateIndonesian(dateString: string, includeDay: boolean = true): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const dayName = getIndonesianDayName(dateString);
    const monthName = INDONESIAN_MONTHS[month - 1] || '';
    if (includeDay) {
      return `${dayName}, ${day} ${monthName} ${year}`;
    }
    return `${day} ${monthName} ${year}`;
  } catch {
    return dateString;
  }
}

export function getMonthYearLabel(year: number, month: number): string {
  const monthName = INDONESIAN_MONTHS[month - 1] || `Bulan ${month}`;
  return `${monthName} ${year}`;
}

export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
