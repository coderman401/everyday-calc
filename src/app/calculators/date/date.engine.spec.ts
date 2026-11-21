import { dateBetween, shiftDate } from './date.engine';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('date engine', () => {
  it('counts the gap in years, months, days, weeks', () => {
    const g = dateBetween(d(2026, 1, 1), d(2026, 4, 11));
    expect([g.years, g.months, g.days, g.totalDays]).toEqual([0, 3, 10, 100]);
    expect([g.weeks, g.restDays]).toEqual([14, 2]);
  });

  it('gives the same gap whichever way round the dates are', () => {
    expect(dateBetween(d(2026, 4, 11), d(2026, 1, 1))).toEqual(dateBetween(d(2026, 1, 1), d(2026, 4, 11)));
  });

  it('counts a leap day', () => {
    expect(dateBetween(d(2024, 2, 28), d(2024, 3, 1)).totalDays).toBe(2);
  });

  it('adds and subtracts a span, clamping a 31st', () => {
    expect(shiftDate(d(2023, 1, 31), { years: 0, months: 1, days: 0 }, 1)).toEqual(d(2023, 2, 28));
    expect(shiftDate(d(2026, 1, 1), { years: 1, months: 2, days: 3 }, 1)).toEqual(d(2027, 3, 4));
    expect(shiftDate(d(2026, 3, 1), { years: 0, months: 0, days: 1 }, -1)).toEqual(d(2026, 2, 28));
  });
});
