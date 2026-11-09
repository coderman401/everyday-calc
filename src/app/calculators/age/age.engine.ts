import { addMonthsClamped, diffDays, startOfDay } from '../../core/dates/dates';

/**
 * Age by the calendar. Whole months are counted by adding months to the birth date (a 31st
 * moves to the month's last day when the month is shorter), then the days left over are
 * counted from there. Total days are plain calendar days.
 */

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  /** Whole days × 24: the hours between the two dates at midnight. */
  totalHours: number;
  /** The next birthday on or after the chosen date. */
  nextBirthday: Date;
  /** True when the chosen date is the birthday itself. */
  isBirthday: boolean;
  /** Age you turn on that birthday. */
  turning: number;
  daysToBirthday: number;
  /** Days since the last birthday, and days between the last and the next. */
  sinceLast: number;
  yearLength: number;
  bornOn: Date;
}

/** The birthday in a given year; 29 Feb falls on 28 Feb when that year has no 29 Feb. */
export function birthdayIn(dob: Date, year: number): Date {
  const last = new Date(year, dob.getMonth() + 1, 0).getDate();
  return new Date(year, dob.getMonth(), Math.min(dob.getDate(), last));
}

export function calculateAge(birth: Date, asOf: Date): AgeResult | null {
  const dob = startOfDay(birth);
  const on = startOfDay(asOf);
  if (on < dob) return null;

  let totalMonths = (on.getFullYear() - dob.getFullYear()) * 12 + (on.getMonth() - dob.getMonth());
  if (addMonthsClamped(dob, totalMonths) > on) totalMonths--;
  const anchor = addMonthsClamped(dob, totalMonths);

  const totalDays = diffDays(dob, on);

  // Last and upcoming birthdays around the chosen date
  const y = on.getFullYear();
  const thisYear = birthdayIn(dob, y);
  const isBirthday = thisYear.getTime() === on.getTime();
  const [last, upcoming] =
    thisYear <= on ? [thisYear, birthdayIn(dob, y + 1)] : [birthdayIn(dob, y - 1), thisYear];
  const next = isBirthday ? on : upcoming;

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: diffDays(anchor, on),
    totalMonths,
    totalWeeks: Math.floor(totalDays / 7),
    totalDays,
    totalHours: totalDays * 24,
    nextBirthday: next,
    isBirthday,
    turning: next.getFullYear() - dob.getFullYear(),
    daysToBirthday: diffDays(on, next),
    sinceLast: diffDays(last, on),
    yearLength: diffDays(last, upcoming),
    bornOn: dob,
  };
}
