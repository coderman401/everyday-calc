import { addDays, diffDays, startOfDay } from '../../core/dates/dates';

/**
 * Due date by Naegele's rule: the first day of the last period plus 280 days (40 weeks), moved by
 * how far the cycle is from 28 days. From a conception date, the same thing: conception + 266 days.
 * "Weeks pregnant" is counted from the first day of the last period, about two weeks before
 * conception, as doctors count it.
 */

export type Method = 'lmp' | 'conception';

export const PREGNANCY_DAYS = 280;
export const CONCEPTION_OFFSET = 14;

export interface PregnancyInput {
  method: Method;
  /** The last period's first day, or the conception date. */
  date: Date;
  /** Only used with the last-period method. */
  cycleLength: number;
  today: Date;
}

export interface Milestone {
  label: string;
  /** Completed weeks of pregnancy at this point. */
  week: number;
  date: Date;
}

export interface PregnancyResult {
  /** The last-period date the maths runs from (adjusted for cycle length, or conception − 14). */
  start: Date;
  due: Date;
  conception: Date;
  /** Days pregnant today; negative before the start date. */
  gestationalDays: number;
  weeks: number;
  days: number;
  /** Fractional weeks, for placing a marker. */
  weeksExact: number;
  trimester: 1 | 2 | 3;
  daysToDue: number;
  /** Days between today and the due date, as a status. */
  state: 'notStarted' | 'pregnant' | 'overdue';
  milestones: Milestone[];
}

export function calculatePregnancy(input: PregnancyInput): PregnancyResult {
  const date = startOfDay(input.date);
  const today = startOfDay(input.today);

  const start =
    input.method === 'lmp'
      ? addDays(date, input.cycleLength - 28)
      : addDays(date, -CONCEPTION_OFFSET);
  const due = addDays(start, PREGNANCY_DAYS);
  const gestationalDays = diffDays(start, today);
  const clamped = Math.max(0, gestationalDays);

  const at = (week: number) => addDays(start, week * 7);
  const milestones: Milestone[] = [
    { label: 'Conception (estimated)', week: 2, date: at(2) },
    { label: 'Second trimester begins', week: 14, date: at(14) },
    { label: 'Halfway', week: 20, date: at(20) },
    { label: 'Third trimester begins', week: 28, date: at(28) },
    { label: 'Full term begins', week: 39, date: at(39) },
    { label: 'Due date', week: 40, date: due },
  ];

  return {
    start,
    due,
    conception: at(2),
    gestationalDays,
    weeks: Math.floor(clamped / 7),
    days: clamped % 7,
    weeksExact: clamped / 7,
    trimester: clamped < 98 ? 1 : clamped < 196 ? 2 : 3,
    daysToDue: diffDays(today, due),
    state: gestationalDays < 0 ? 'notStarted' : gestationalDays > PREGNANCY_DAYS ? 'overdue' : 'pregnant',
    milestones,
  };
}
