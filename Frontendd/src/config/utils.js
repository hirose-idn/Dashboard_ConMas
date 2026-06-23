/**
 * Format angka ke locale Indonesia.
 * Kalau null/undefined/NaN → return '—'
 */
export function fmt(value, dec = 0) {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  if (isNaN(n)) return '—';
  return dec > 0
    ? parseFloat(n.toFixed(dec)).toLocaleString('id-ID')
    : n.toLocaleString('id-ID');
}

/**
 * Konversi timestamp backend ke date string WIB (YYYY-MM-DD)
 */
export function toWIBDateStr(ts) {
  const d   = new Date(ts);
  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return [
    wib.getUTCFullYear(),
    String(wib.getUTCMonth() + 1).padStart(2, '0'),
    String(wib.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Tanggal hari ini WIB sebagai string YYYY-MM-DD
 */
export function getTodayWIB() {
  const wib = new Date(new Date().getTime() + 7 * 3600 * 1000);
  return wib.toISOString().slice(0, 10);
}

/**
 * Shift aktif berdasarkan jam WIB (bukan jam lokal browser)
 * Shift 1 = 07:00–22:00, Shift 2 = 22:00–07:00
 */
export function getActiveShift() {
  const wib = new Date(new Date().getTime() + 7 * 3600 * 1000);
  const h   = wib.getUTCHours();
  return h >= 7 && h < 22 ? 'Shift 1' : 'Shift 2';
}