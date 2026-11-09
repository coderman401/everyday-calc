/** Coarse ranges for money, so analytics sees "10-25 lakh" and never the exact figure. */
export function amountBand(rupees: number): string {
  const lakh = rupees / 100_000;
  if (lakh < 1) return 'under 1 lakh';
  if (lakh < 5) return '1-5 lakh';
  if (lakh < 10) return '5-10 lakh';
  if (lakh < 25) return '10-25 lakh';
  if (lakh < 50) return '25-50 lakh';
  if (lakh < 100) return '50 lakh-1 crore';
  if (lakh < 500) return '1-5 crore';
  return '5 crore and above';
}
