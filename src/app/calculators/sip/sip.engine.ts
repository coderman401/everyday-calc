/**
 * SIP maths. Each month the instalment is invested at the start of the month, then the whole
 * balance earns that month's return:  balance = (balance + instalment) × (1 + i).
 * Without a step-up this equals the closed form  FV = P × ((1 + i)ⁿ − 1) ÷ i × (1 + i).
 * With a yearly step-up there is no neat closed form, so it runs month by month.
 */

export interface SipInput {
  monthly: number;
  /** Expected annual return in percent. */
  annualRate: number;
  years: number;
  /** Raise the instalment by this percent at the start of every year after the first. */
  stepUpPercent?: number;
}

export interface SipYear {
  year: number;
  /** The monthly instalment during this year. */
  instalment: number;
  /** Invested so far (cumulative). */
  invested: number;
  /** Value at the end of the year. */
  value: number;
  /** value − invested */
  returns: number;
}

export interface SipResult {
  invested: number;
  value: number;
  returns: number;
  /** value ÷ invested */
  multiple: number;
  /** The last year's monthly instalment (differs from the first only with a step-up). */
  lastInstalment: number;
  years: SipYear[];
}

/** Closed-form value of a level SIP: P × ((1 + i)ⁿ − 1) ÷ i × (1 + i). */
export function sipFutureValue(monthly: number, annualRate: number, months: number): number {
  const i = annualRate / 12 / 100;
  if (i === 0) return monthly * months;
  return monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
}

export function calculateSip(input: SipInput): SipResult {
  const i = input.annualRate / 12 / 100;
  const months = Math.round(input.years * 12);
  const step = input.stepUpPercent ?? 0;

  let instalment = input.monthly;
  let balance = 0;
  let invested = 0;
  const years: SipYear[] = [];

  for (let m = 1; m <= months; m++) {
    if (m > 1 && (m - 1) % 12 === 0 && step > 0) instalment *= 1 + step / 100;
    balance = (balance + instalment) * (1 + i);
    invested += instalment;
    if (m % 12 === 0 || m === months) {
      years.push({
        year: Math.ceil(m / 12),
        instalment,
        invested,
        value: balance,
        returns: balance - invested,
      });
    }
  }

  return {
    invested,
    value: balance,
    returns: balance - invested,
    multiple: invested > 0 ? balance / invested : 0,
    lastInstalment: instalment,
    years,
  };
}
