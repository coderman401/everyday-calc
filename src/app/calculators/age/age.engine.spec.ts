import { calculateAge } from './age.engine';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('age engine', () => {
  it('counts years, months and days', () => {
    const r = calculateAge(d(1995, 3, 14), d(2026, 8, 20))!;
    expect([r.years, r.months, r.days]).toEqual([31, 5, 6]);
    expect(r.totalMonths).toBe(31 * 12 + 5);
  });

  it('is zero on the birth date itself', () => {
    const r = calculateAge(d(2000, 1, 1), d(2000, 1, 1))!;
    expect([r.years, r.months, r.days, r.totalDays]).toEqual([0, 0, 0, 0]);
  });

  it('turns a year older on the birthday, not the day before', () => {
    expect(calculateAge(d(2000, 6, 15), d(2025, 6, 14))!.years).toBe(24);
    const on = calculateAge(d(2000, 6, 15), d(2025, 6, 15))!;
    expect(on.years).toBe(25);
    expect(on.isBirthday).toBe(true);
    expect(on.turning).toBe(25);
    expect(on.daysToBirthday).toBe(0);
  });

  it('clamps a 31st when the month is shorter', () => {
    // 31 Jan + 1 month is 28 Feb 2023, so on 1 Mar it is 1 month and 1 day
    const r = calculateAge(d(2023, 1, 31), d(2023, 3, 1))!;
    expect([r.years, r.months, r.days]).toEqual([0, 1, 1]);
  });

  it('handles a 29 February birthday', () => {
    const r = calculateAge(d(2000, 2, 29), d(2025, 2, 28))!;
    expect(r.years).toBe(25); // 28 Feb stands in for 29 Feb in a non-leap year
    expect(r.isBirthday).toBe(true);
    const before = calculateAge(d(2000, 2, 29), d(2025, 2, 27))!;
    expect(before.years).toBe(24);
    expect(before.nextBirthday).toEqual(d(2025, 2, 28));
  });

  it('counts whole calendar days, weeks and hours across a leap year', () => {
    const r = calculateAge(d(2024, 1, 1), d(2025, 1, 1))!;
    expect(r.totalDays).toBe(366);
    expect(r.totalWeeks).toBe(52);
    expect(r.totalHours).toBe(366 * 24);
  });

  it('finds the next birthday and the progress toward it', () => {
    const r = calculateAge(d(1995, 3, 14), d(2026, 8, 20))!;
    expect(r.nextBirthday).toEqual(d(2027, 3, 14));
    expect(r.turning).toBe(32);
    expect(r.daysToBirthday).toBe(206);
    expect(r.sinceLast + r.daysToBirthday).toBe(r.yearLength);
    expect(r.yearLength).toBe(365);
  });

  it('returns null when the date is before birth', () => {
    expect(calculateAge(d(2000, 1, 1), d(1999, 12, 31))).toBeNull();
  });
});
