/**
 * Fixed deposit maths with the interest reinvested (a cumulative FD):
 *   A = P × (1 + r ÷ n)^(n × t)
 * r is the annual rate as a fraction, n the compounding periods a year, t the tenure in years.
 */

export type Compounding = 1 | 2 | 4 | 12;

export interface FdInput {
  principal: number;
  /** Annual rate in percent. */
  annualRate: number;
  months: number;
  compounding: Compounding;
}

export interface FdYear {
  /** "Year 3", or "Year 3 (6 mo)" for a part-year at the end. */
  label: string;
  interest: number;
  balance: number;
}

export interface FdResult {
  principal: number;
  interest: number;
  maturity: number;
  /** The yearly rate you actually earn once compounding is counted, in percent. */
  effectiveYield: number;
  years: FdYear[];
}

export const COMPOUNDING_OPTIONS: { value: Compounding; label: string }[] = [
  { value: 12, label: 'Monthly' },
  { value: 4, label: 'Quarterly' },
  { value: 2, label: 'Half-yearly' },
  { value: 1, label: 'Yearly' },
];

export function maturityValue(
  principal: number,
  annualRate: number,
  months: number,
  compounding: Compounding,
): number {
  const r = annualRate / 100;
  return principal * Math.pow(1 + r / compounding, (compounding * months) / 12);
}

/** (1 + r ÷ n)ⁿ − 1, in percent. */
export function effectiveYield(annualRate: number, compounding: Compounding): number {
  const r = annualRate / 100;
  return (Math.pow(1 + r / compounding, compounding) - 1) * 100;
}

export function calculateFd(input: FdInput): FdResult {
  const { principal, annualRate, months, compounding } = input;
  const maturity = maturityValue(principal, annualRate, months, compounding);

  const years: FdYear[] = [];
  let prev = principal;
  const fullYears = Math.floor(months / 12);
  const rest = months % 12;
  const total = fullYears + (rest > 0 ? 1 : 0);
  for (let y = 1; y <= total; y++) {
    const m = Math.min(y * 12, months);
    const balance = maturityValue(principal, annualRate, m, compounding);
    const partial = y * 12 > months;
    years.push({
      label: partial ? `Year ${y} (${rest} mo)` : `Year ${y}`,
      interest: balance - prev,
      balance,
    });
    prev = balance;
  }

  return {
    principal,
    interest: maturity - principal,
    maturity,
    effectiveYield: effectiveYield(annualRate, compounding),
    years,
  };
}
