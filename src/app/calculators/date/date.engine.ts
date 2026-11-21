import { addDays, addMonthsClamped } from '../../core/dates/dates';
import { calculateAge } from '../age/age.engine';

/**
 * Two things you do with dates: count the time between two of them, and move one by a span.
 * The counting is the age calculator's (whole years, then months, then days), so the two
 * pages always agree.
 */

export interface DateGap {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  /** Whole weeks, and the days left over. */
  weeks: number;
  restDays: number;
  /** The earlier and later of the two dates, whichever order they were entered in. */
  from: Date;
  to: Date;
}

export interface Span {
  years: number;
  months: number;
  days: number;
}

export function dateBetween(a: Date, b: Date): DateGap {
  const [from, to] = a <= b ? [a, b] : [b, a];
  const g = calculateAge(from, to)!;
  return {
    years: g.years,
    months: g.months,
    days: g.days,
    totalDays: g.totalDays,
    weeks: Math.floor(g.totalDays / 7),
    restDays: g.totalDays % 7,
    from,
    to,
  };
}

/** Years and months first (a 31st moves to a shorter month's last day), then the days. */
export function shiftDate(date: Date, span: Span, sign: 1 | -1): Date {
  return addDays(addMonthsClamped(date, sign * (span.years * 12 + span.months)), sign * span.days);
}
