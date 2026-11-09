/** Number and duration formatting shared by every calculator. Indian digit grouping (₹12,34,567). */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const plain = (decimals: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals, useGrouping: true });

const plainCache = new Map<number, Intl.NumberFormat>();

/** ₹50,00,000 */
export function formatInr(value: number): string {
  return inr.format(Math.round(value));
}

/** 50,00,000 (no symbol), up to `decimals` fraction digits. */
export function formatPlain(value: number, decimals = 0): string {
  let f = plainCache.get(decimals);
  if (!f) {
    f = plain(decimals);
    plainCache.set(decimals, f);
  }
  return f.format(value);
}

/** ₹50 lakh, ₹1.2 crore, or the full amount below a lakh. */
export function formatWords(value: number): string {
  const trim = (n: number) => String(Number(n.toFixed(2)));
  if (value >= 1e7) return `₹${trim(value / 1e7)} crore`;
  if (value >= 1e5) return `₹${trim(value / 1e5)} lakh`;
  return formatInr(value);
}

/** 1 yr, 17 yrs 4 mos, 8 mos */
export function formatDuration(months: number): string {
  const m = Math.max(0, Math.round(months));
  const y = Math.floor(m / 12);
  const rest = m % 12;
  const years = `${y} ${y === 1 ? 'yr' : 'yrs'}`;
  const mos = `${rest} ${rest === 1 ? 'mo' : 'mos'}`;
  if (y === 0) return mos;
  return rest === 0 ? years : `${years} ${mos}`;
}

/** "50,00,000" or "8.5" or "₹ 1,00,000" → number, or null when it is not a number. */
export function parseNumber(text: string): number | null {
  const cleaned = text.replace(/[₹,\s]/g, '');
  if (cleaned === '' || cleaned === '.' || !/^\d*\.?\d*$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${formatPlain(value, decimals)}%`;
}
