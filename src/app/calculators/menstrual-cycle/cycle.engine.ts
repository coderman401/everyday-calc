import { addDays, diffDays, startOfDay } from '../../core/dates/dates';

/**
 * Cycle dates by counting. Day 1 is the first day of a period. The luteal phase (ovulation to
 * the next period) is taken as 14 days, so ovulation is 14 days before the next period starts.
 * The fertile window runs from 5 days before ovulation to 1 day after it. These are estimates.
 */

export const LUTEAL_DAYS = 14;
export const FERTILE_BEFORE = 5;
export const FERTILE_AFTER = 1;

export interface CycleInput {
  lastPeriod: Date;
  cycleLength: number;
  periodLength: number;
  today: Date;
  /** How many upcoming cycles to list. */
  count?: number;
}

export interface CycleDates {
  /** First day of the period that starts this cycle. */
  start: Date;
  periodEnd: Date;
  ovulation: Date;
  fertileStart: Date;
  fertileEnd: Date;
}

export interface Phase {
  id: 'period' | 'before' | 'fertile' | 'after';
  label: string;
  /** Cycle days the phase covers, 1-based and inclusive. */
  fromDay: number;
  toDay: number;
  days: number;
}

export interface CycleResult {
  /** The next period start after today (or the one entered, if it is still ahead). */
  next: CycleDates;
  /** The cycle that today falls in, when the last period has already started. */
  current: CycleDates | null;
  /** The cycle whose fertile window is still ahead of today or under way. */
  focus: CycleDates;
  /** The cycles to list: the current one first when there is one, then the upcoming ones. */
  cycles: CycleDates[];
  daysToNext: number;
  /** Cycle day today (1-based) in the cycle that began with `lastPeriod` or a later one, if today is on or after it. */
  cycleDay: number | null;
  upcoming: CycleDates[];
  phases: Phase[];
}

export function datesForCycle(start: Date, cycleLength: number, periodLength: number): CycleDates {
  const ovulation = addDays(start, cycleLength - LUTEAL_DAYS);
  return {
    start,
    periodEnd: addDays(start, periodLength - 1),
    ovulation,
    fertileStart: addDays(ovulation, -FERTILE_BEFORE),
    fertileEnd: addDays(ovulation, FERTILE_AFTER),
  };
}

/** The four stretches of one cycle, in cycle days, adding up to the cycle length. */
export function phasesOf(cycleLength: number, periodLength: number): Phase[] {
  const ovDay = cycleLength - LUTEAL_DAYS + 1; // 1-based day of ovulation
  const fertileFrom = Math.max(periodLength + 1, ovDay - FERTILE_BEFORE);
  const fertileTo = Math.min(cycleLength, Math.max(fertileFrom, ovDay + FERTILE_AFTER));

  const make = (id: Phase['id'], label: string, fromDay: number, toDay: number): Phase => ({
    id,
    label,
    fromDay,
    toDay,
    days: Math.max(0, toDay - fromDay + 1),
  });
  return [
    make('period', 'Period', 1, periodLength),
    make('before', 'Before the fertile window', periodLength + 1, fertileFrom - 1),
    make('fertile', 'Fertile window', fertileFrom, fertileTo),
    make('after', 'After ovulation', fertileTo + 1, cycleLength),
  ];
}

export function calculateCycle(input: CycleInput): CycleResult {
  const { cycleLength, periodLength } = input;
  const last = startOfDay(input.lastPeriod);
  const today = startOfDay(input.today);
  const count = input.count ?? 6;

  const sinceLast = diffDays(last, today);
  // k = how many cycles after the last period the next start is; always at least one, unless the
  // last period is still ahead of us.
  const k = sinceLast < 0 ? 0 : Math.floor(sinceLast / cycleLength) + 1;
  const upcoming = Array.from({ length: count }, (_, n) =>
    datesForCycle(addDays(last, (k + n) * cycleLength), cycleLength, periodLength),
  );

  const current = sinceLast < 0 ? null : datesForCycle(addDays(last, (k - 1) * cycleLength), cycleLength, periodLength);
  const cycles = (current ? [current, ...upcoming] : upcoming).slice(0, count);
  const focus = cycles.find((c) => diffDays(today, c.fertileEnd) >= 0) ?? upcoming[0];

  return {
    next: upcoming[0],
    current,
    focus,
    cycles,
    daysToNext: diffDays(today, upcoming[0].start),
    cycleDay: sinceLast < 0 ? null : (sinceLast % cycleLength) + 1,
    upcoming,
    phases: phasesOf(cycleLength, periodLength),
  };
}
