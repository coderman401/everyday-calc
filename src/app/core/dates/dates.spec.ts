import { TestBed } from '@angular/core/testing';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { addDays, addMonthsClamped, diffDays, relativeDays } from './dates';
import { DayFirstDateAdapter } from './date-adapter';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('dates', () => {
  it('counts whole days across a month, a leap day and a year', () => {
    expect(diffDays(d(2024, 2, 28), d(2024, 3, 1))).toBe(2);
    expect(diffDays(d(2025, 1, 1), d(2026, 1, 1))).toBe(365);
    expect(diffDays(d(2026, 3, 10), d(2026, 3, 1))).toBe(-9);
  });

  it('is not thrown by daylight saving', () => {
    // 2026-03-29 is a clocks-forward date in much of Europe; the count must still be whole
    expect(diffDays(d(2026, 3, 28), d(2026, 3, 30))).toBe(2);
    expect(addDays(d(2026, 3, 28), 2)).toEqual(d(2026, 3, 30));
  });

  it('clamps month-end dates', () => {
    expect(addMonthsClamped(d(2023, 1, 31), 1)).toEqual(d(2023, 2, 28));
    expect(addMonthsClamped(d(2024, 1, 31), 1)).toEqual(d(2024, 2, 29));
    expect(addMonthsClamped(d(2023, 3, 31), -1)).toEqual(d(2023, 2, 28));
    expect(addMonthsClamped(d(2023, 11, 15), 3)).toEqual(d(2024, 2, 15));
  });

  it('says relative days in words', () => {
    expect(relativeDays(0)).toBe('today');
    expect(relativeDays(1)).toBe('tomorrow');
    expect(relativeDays(9)).toBe('in 9 days');
    expect(relativeDays(-3)).toBe('3 days ago');
  });
});

describe('day-first date adapter', () => {
  let adapter: DayFirstDateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-IN' }, DayFirstDateAdapter],
    });
    adapter = TestBed.inject(DayFirstDateAdapter);
  });

  it('reads dd/mm/yyyy', () => {
    expect(adapter.parse('14/03/1995')).toEqual(d(1995, 3, 14));
    expect(adapter.parse('1-2-2024')).toEqual(d(2024, 2, 1));
    expect(adapter.parse('  05.06.2020 ')).toEqual(d(2020, 6, 5));
  });

  it('rejects dates that do not exist and text that is not a date', () => {
    expect(adapter.isValid(adapter.parse('31/02/2024') as Date)).toBe(false);
    expect(adapter.isValid(adapter.parse('14/13/2024') as Date)).toBe(false);
    expect(adapter.isValid(adapter.parse('hello') as Date)).toBe(false);
  });

  it('treats an empty field as no date', () => {
    expect(adapter.parse('')).toBeNull();
  });
});
