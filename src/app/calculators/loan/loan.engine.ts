/**
 * Home loan maths. Pure functions, no Angular, so the numbers can be tested on their own.
 *
 * The loan is simulated month by month:
 *   interest  = opening balance x monthly rate
 *   principal = EMI - interest
 * On top of the plain loan three optional extras are layered in:
 *   - step-up:    the EMI rises by `percent` at the start of every loan year after the first
 *   - extra EMIs: `perYear` additional EMIs are paid at the end of every loan year
 *   - prepayment: a one-off lump sum paid in a chosen month
 * Extras and prepayments go straight to principal and shorten the loan; the EMI stays as it is.
 */

export interface LoanInput {
  principal: number;
  /** Annual rate in percent, e.g. 8.5 */
  annualRate: number;
  /** Original tenure in months */
  months: number;
  prepayment?: { amount: number; month: number } | null;
  extraEmis?: { perYear: number } | null;
  stepUp?: { percent: number } | null;
}

export interface MonthRow {
  month: number;
  opening: number;
  interest: number;
  /** The scheduled EMI actually paid this month. */
  emi: number;
  principal: number;
  /** Extra EMIs and prepayment paid this month, all of it principal. */
  extra: number;
  closing: number;
}

export interface YearRow {
  year: number;
  principal: number;
  interest: number;
  extra: number;
  /** Everything paid this year: EMIs + extras. */
  total: number;
  closing: number;
}

export interface LoanResult {
  /** First-year monthly EMI. */
  emi: number;
  /** The EMI in the last year of repayment (differs from `emi` only with step-up). */
  lastEmi: number;
  totalInterest: number;
  /** Principal + interest, including extras and prepayment. */
  totalPayment: number;
  principal: number;
  /** Months until the balance reaches zero. */
  months: number;
  schedule: MonthRow[];
  years: YearRow[];
  /** The same loan without any extras. */
  plain: { totalInterest: number; months: number };
  interestSaved: number;
  monthsSaved: number;
  hasExtras: boolean;
}

const EPSILON = 0.005;

/** Standard EMI formula; a zero rate divides the principal evenly. */
export function emiFor(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

interface Run {
  schedule: MonthRow[];
  emi: number;
  lastEmi: number;
}

function simulate(input: LoanInput, withExtras: boolean): Run {
  const { principal, annualRate, months } = input;
  const r = annualRate / 12 / 100;
  const baseEmi = emiFor(principal, annualRate, months);

  const stepPct = withExtras ? (input.stepUp?.percent ?? 0) : 0;
  const extraCount = withExtras ? (input.extraEmis?.perYear ?? 0) : 0;
  const prepay = withExtras ? input.prepayment : null;

  const schedule: MonthRow[] = [];
  let balance = principal;
  let emi = baseEmi;

  for (let month = 1; month <= months && balance > EPSILON; month++) {
    if (month > 1 && (month - 1) % 12 === 0 && stepPct > 0) emi *= 1 + stepPct / 100;

    const opening = balance;
    const interest = opening * r;
    // The last scheduled month clears whatever is left, which also absorbs rounding drift.
    const due = month === months ? opening + interest : Math.min(emi, opening + interest);
    const principalPaid = due - interest;
    balance = opening - principalPaid;

    let extra = 0;
    if (balance > EPSILON && extraCount > 0 && month % 12 === 0) {
      const e = Math.min(extraCount * emi, balance);
      extra += e;
      balance -= e;
    }
    if (balance > EPSILON && prepay && prepay.amount > 0 && prepay.month === month) {
      const p = Math.min(prepay.amount, balance);
      extra += p;
      balance -= p;
    }
    if (balance <= EPSILON) balance = 0;

    schedule.push({
      month,
      opening,
      interest,
      emi: due,
      principal: principalPaid,
      extra,
      closing: balance,
    });
  }

  // `emi` is the scheduled instalment after any step-ups, not the (smaller) final payment.
  return { schedule, emi: baseEmi, lastEmi: emi };
}

function totals(schedule: MonthRow[]) {
  let interest = 0;
  let paid = 0;
  for (const row of schedule) {
    interest += row.interest;
    paid += row.emi + row.extra;
  }
  return { interest, paid };
}

function byYear(schedule: MonthRow[]): YearRow[] {
  const years: YearRow[] = [];
  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    let y = years[year - 1];
    if (!y) {
      y = { year, principal: 0, interest: 0, extra: 0, total: 0, closing: 0 };
      years.push(y);
    }
    y.principal += row.principal;
    y.interest += row.interest;
    y.extra += row.extra;
    y.total += row.emi + row.extra;
    y.closing = row.closing;
  }
  return years;
}

export function isValidLoan(input: LoanInput): boolean {
  return (
    Number.isFinite(input.principal) &&
    Number.isFinite(input.annualRate) &&
    Number.isInteger(input.months) &&
    input.principal > 0 &&
    input.annualRate >= 0 &&
    input.months > 0
  );
}

export function calculateLoan(input: LoanInput): LoanResult {
  const hasExtras =
    (input.prepayment?.amount ?? 0) > 0 ||
    (input.extraEmis?.perYear ?? 0) > 0 ||
    (input.stepUp?.percent ?? 0) > 0;

  const plainRun = simulate(input, false);
  const run = hasExtras ? simulate(input, true) : plainRun;

  const plainTotals = totals(plainRun.schedule);
  const t = hasExtras ? totals(run.schedule) : plainTotals;

  return {
    emi: run.emi,
    lastEmi: run.lastEmi,
    totalInterest: t.interest,
    totalPayment: t.paid,
    principal: input.principal,
    months: run.schedule.length,
    schedule: run.schedule,
    years: byYear(run.schedule),
    plain: { totalInterest: plainTotals.interest, months: plainRun.schedule.length },
    interestSaved: Math.max(0, plainTotals.interest - t.interest),
    monthsSaved: Math.max(0, plainRun.schedule.length - run.schedule.length),
    hasExtras,
  };
}
