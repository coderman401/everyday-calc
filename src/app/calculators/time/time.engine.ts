/** Clock times as minutes after midnight (0 to 1439), so a duration is plain subtraction. */

export const MINUTES_PER_DAY = 1440;

export const toMinutes = (hours: number, minutes: number) => hours * 60 + minutes;

/** Minutes from `start` to `end`. An end before the start means the next day. */
export function timeBetween(start: number, end: number): number {
  return (((end - start) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** The clock time `delta` minutes after (or, if negative, before) `start`, and how many days that crosses. */
export function shiftTime(start: number, delta: number): { minutes: number; dayOffset: number } {
  const total = start + delta;
  const dayOffset = Math.floor(total / MINUTES_PER_DAY);
  return { minutes: total - dayOffset * MINUTES_PER_DAY, dayOffset };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 09:30 */
export const formatClock = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/** 9:30 am */
export function formatClock12(minutes: number): string {
  const h = Math.floor(minutes / 60);
  return `${h % 12 || 12}:${pad(minutes % 60)} ${h < 12 ? 'am' : 'pm'}`;
}

/** 8 h 15 min */
export const formatSpan = (minutes: number) => `${Math.floor(minutes / 60)} h ${minutes % 60} min`;

export function dayOffsetText(offset: number): string {
  if (offset === 0) return 'Same day';
  if (offset === 1) return 'Next day';
  if (offset === -1) return 'Previous day';
  return offset > 0 ? `${offset} days later` : `${-offset} days earlier`;
}
