import { calculateSip, sipFutureValue } from './sip.engine';

describe('SIP engine', () => {
  it('matches the closed form for a level SIP', () => {
    const r = calculateSip({ monthly: 10_000, annualRate: 12, years: 10 });
    expect(r.value).toBeCloseTo(sipFutureValue(10_000, 12, 120), 4);
    // ₹10,000 a month at 12% for 10 years is about ₹23.23 lakh
    expect(r.value).toBeCloseTo(2_323_391, -2);
    expect(r.invested).toBe(1_200_000);
    expect(r.returns).toBeCloseTo(r.value - r.invested, 6);
  });

  it('handles a zero return', () => {
    const r = calculateSip({ monthly: 5_000, annualRate: 0, years: 3 });
    expect(r.value).toBe(180_000);
    expect(r.returns).toBe(0);
  });

  it('a yearly step-up raises the instalment from year two and the value', () => {
    const level = calculateSip({ monthly: 10_000, annualRate: 12, years: 10 });
    const up = calculateSip({ monthly: 10_000, annualRate: 12, years: 10, stepUpPercent: 10 });
    expect(up.years[0].instalment).toBe(10_000);
    expect(up.years[1].instalment).toBeCloseTo(11_000, 6);
    expect(up.years[9].instalment).toBeCloseTo(10_000 * Math.pow(1.1, 9), 6);
    expect(up.lastInstalment).toBeCloseTo(10_000 * Math.pow(1.1, 9), 6);
    expect(up.invested).toBeGreaterThan(level.invested);
    expect(up.value).toBeGreaterThan(level.value);
  });

  it('reports one row per year and ends on the final value', () => {
    const r = calculateSip({ monthly: 10_000, annualRate: 12, years: 7 });
    expect(r.years).toHaveLength(7);
    expect(r.years.at(-1)?.value).toBeCloseTo(r.value, 6);
    expect(r.years.at(-1)?.invested).toBeCloseTo(r.invested, 6);
    expect(r.years[0].invested).toBe(120_000);
  });
});
