import { calculateFd, effectiveYield, maturityValue } from './fd.engine';

describe('fixed deposit engine', () => {
  it('compounds quarterly: ₹5 lakh at 7% for 5 years', () => {
    const r = calculateFd({ principal: 500_000, annualRate: 7, months: 60, compounding: 4 });
    expect(r.maturity).toBeCloseTo(707_389.1, 1);
    expect(r.interest).toBeCloseTo(207_389.1, 1);
    expect(r.principal + r.interest).toBeCloseTo(r.maturity, 6);
  });

  it('more frequent compounding earns slightly more', () => {
    const at = (c: 1 | 2 | 4 | 12) => maturityValue(500_000, 7, 60, c);
    expect(at(1)).toBeLessThan(at(2));
    expect(at(2)).toBeLessThan(at(4));
    expect(at(4)).toBeLessThan(at(12));
    expect(at(1)).toBeCloseTo(701_275.87, 1);
    expect(at(12)).toBeCloseTo(708_812.63, 1);
  });

  it('works out the effective yield', () => {
    expect(effectiveYield(7, 1)).toBeCloseTo(7, 6);
    expect(effectiveYield(7, 4)).toBeCloseTo(7.1859, 3);
  });

  it('lists a row per year and ends on the maturity value', () => {
    const r = calculateFd({ principal: 100_000, annualRate: 6, months: 60, compounding: 4 });
    expect(r.years).toHaveLength(5);
    expect(r.years.at(-1)?.balance).toBeCloseTo(r.maturity, 6);
    expect(r.years.reduce((s, y) => s + y.interest, 0)).toBeCloseTo(r.interest, 6);
  });

  it('labels a part-year at the end', () => {
    const r = calculateFd({ principal: 100_000, annualRate: 6, months: 18, compounding: 4 });
    expect(r.years.map((y) => y.label)).toEqual(['Year 1', 'Year 2 (6 mo)']);
    expect(r.years.at(-1)?.balance).toBeCloseTo(r.maturity, 6);
  });
});
