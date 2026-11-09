import { calculateLoan, emiFor, isValidLoan, type LoanInput } from './loan.engine';

const base: LoanInput = { principal: 5_000_000, annualRate: 8.5, months: 240 };

describe('home loan engine', () => {
  it('matches the standard EMI for ₹50 lakh at 8.5% over 20 years', () => {
    expect(emiFor(5_000_000, 8.5, 240)).toBeCloseTo(43391.16, 1);
    const r = calculateLoan(base);
    expect(r.emi).toBeCloseTo(43391.16, 1);
    expect(r.totalInterest).toBeCloseTo(43391.16 * 240 - 5_000_000, -1);
    expect(r.months).toBe(240);
    expect(r.hasExtras).toBe(false);
  });

  it('splits total payment into principal plus interest', () => {
    const r = calculateLoan(base);
    expect(r.totalPayment).toBeCloseTo(r.principal + r.totalInterest, 4);
    const principalPaid = r.schedule.reduce((s, m) => s + m.principal + m.extra, 0);
    expect(principalPaid).toBeCloseTo(base.principal, 4);
    expect(r.schedule.at(-1)?.closing).toBe(0);
  });

  it('handles a zero rate', () => {
    const r = calculateLoan({ principal: 120_000, annualRate: 0, months: 12 });
    expect(r.emi).toBe(10_000);
    expect(r.totalInterest).toBe(0);
    expect(r.totalPayment).toBeCloseTo(120_000, 6);
  });

  it('a prepayment shortens the loan and saves interest', () => {
    const r = calculateLoan({ ...base, prepayment: { amount: 500_000, month: 12 } });
    expect(r.hasExtras).toBe(true);
    expect(r.months).toBeLessThan(240);
    expect(r.monthsSaved).toBeGreaterThan(0);
    expect(r.interestSaved).toBeGreaterThan(0);
    expect(r.totalPayment).toBeCloseTo(r.principal + r.totalInterest, 4);
    expect(r.schedule[11].extra).toBe(500_000);
  });

  it('ignores a prepayment dated after the loan is repaid', () => {
    const r = calculateLoan({ ...base, prepayment: { amount: 500_000, month: 999 } });
    expect(r.months).toBe(240);
    expect(r.interestSaved).toBeCloseTo(0, 6);
  });

  it('an extra EMI every year pays at each year end', () => {
    const r = calculateLoan({ ...base, extraEmis: { perYear: 1 } });
    expect(r.months).toBeLessThan(240);
    expect(r.schedule[11].extra).toBeCloseTo(r.emi, 6);
    expect(r.schedule[10].extra).toBe(0);
    expect(r.totalPayment).toBeCloseTo(r.principal + r.totalInterest, 4);
  });

  it('a yearly step-up raises the EMI from year two and ends the loan sooner', () => {
    const r = calculateLoan({ ...base, stepUp: { percent: 5 } });
    expect(r.schedule[0].emi).toBeCloseTo(r.emi, 6);
    expect(r.schedule[11].emi).toBeCloseTo(r.emi, 6);
    expect(r.schedule[12].emi).toBeCloseTo(r.emi * 1.05, 6);
    expect(r.schedule[24].emi).toBeCloseTo(r.emi * 1.05 * 1.05, 6);
    expect(r.months).toBeLessThan(240);
    expect(r.lastEmi).toBeGreaterThan(r.emi);
  });

  it('groups the schedule by year and the years add up', () => {
    const r = calculateLoan({ ...base, extraEmis: { perYear: 1 }, stepUp: { percent: 5 } });
    expect(r.years.length).toBe(Math.ceil(r.months / 12));
    const interest = r.years.reduce((s, y) => s + y.interest, 0);
    expect(interest).toBeCloseTo(r.totalInterest, 4);
    expect(r.years.at(-1)?.closing).toBe(0);
  });

  it('handles a one-month loan', () => {
    const r = calculateLoan({ principal: 100_000, annualRate: 12, months: 1 });
    expect(r.months).toBe(1);
    expect(r.totalInterest).toBeCloseTo(1000, 6);
  });

  it('rejects unusable input', () => {
    expect(isValidLoan(base)).toBe(true);
    expect(isValidLoan({ ...base, principal: 0 })).toBe(false);
    expect(isValidLoan({ ...base, months: 0 })).toBe(false);
    expect(isValidLoan({ ...base, annualRate: -1 })).toBe(false);
    expect(isValidLoan({ ...base, principal: NaN })).toBe(false);
  });
});
