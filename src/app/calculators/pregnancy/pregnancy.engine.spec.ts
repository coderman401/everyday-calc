import { calculatePregnancy } from './pregnancy.engine';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('pregnancy engine', () => {
  it('due date is the last period plus 280 days', () => {
    const r = calculatePregnancy({ method: 'lmp', date: d(2026, 1, 1), cycleLength: 28, today: d(2026, 3, 1) });
    expect(r.due).toEqual(d(2026, 10, 8));
    expect(r.conception).toEqual(d(2026, 1, 15));
  });

  it('moves the due date with the cycle length', () => {
    const base = calculatePregnancy({ method: 'lmp', date: d(2026, 1, 1), cycleLength: 28, today: d(2026, 3, 1) });
    const long = calculatePregnancy({ method: 'lmp', date: d(2026, 1, 1), cycleLength: 35, today: d(2026, 3, 1) });
    const short = calculatePregnancy({ method: 'lmp', date: d(2026, 1, 1), cycleLength: 24, today: d(2026, 3, 1) });
    expect(long.due).toEqual(d(2026, 10, 15));
    expect(short.due).toEqual(d(2026, 10, 4));
    expect(long.start.getTime() - base.start.getTime()).toBe(7 * 86_400_000);
  });

  it('from conception, adds 266 days', () => {
    const r = calculatePregnancy({ method: 'conception', date: d(2026, 1, 15), cycleLength: 28, today: d(2026, 3, 1) });
    expect(r.due).toEqual(d(2026, 10, 8));
    expect(r.start).toEqual(d(2026, 1, 1));
  });

  it('counts weeks and days pregnant and the trimester', () => {
    const r = calculatePregnancy({ method: 'lmp', date: d(2026, 1, 1), cycleLength: 28, today: d(2026, 3, 27) });
    // 85 days = 12 weeks 1 day
    expect([r.gestationalDays, r.weeks, r.days]).toEqual([85, 12, 1]);
    expect(r.trimester).toBe(1);
    expect(r.daysToDue).toBe(195);
    expect(r.state).toBe('pregnant');

    const t = (days: number) =>
      calculatePregnancy({ method: 'lmp', date: d(2026, 1, 1), cycleLength: 28, today: new Date(2026, 0, 1 + days) }).trimester;
    expect([t(97), t(98), t(195), t(196)]).toEqual([1, 2, 2, 3]);
  });

  it('flags a start in the future and a date past the due date', () => {
    const early = calculatePregnancy({ method: 'lmp', date: d(2026, 3, 1), cycleLength: 45, today: d(2026, 3, 1) });
    expect(early.state).toBe('notStarted');
    expect(early.weeks).toBe(0);

    const late = calculatePregnancy({ method: 'lmp', date: d(2026, 1, 1), cycleLength: 28, today: d(2026, 10, 12) });
    expect(late.state).toBe('overdue');
    expect(late.daysToDue).toBe(-4);
  });

  it('lists the milestones in order, ending on the due date', () => {
    const r = calculatePregnancy({ method: 'lmp', date: d(2026, 1, 1), cycleLength: 28, today: d(2026, 3, 1) });
    const weeks = r.milestones.map((m) => m.week);
    expect(weeks).toEqual([...weeks].sort((a, b) => a - b));
    expect(r.milestones.at(-1)?.date).toEqual(r.due);
    expect(r.milestones.find((m) => m.week === 14)?.date).toEqual(d(2026, 4, 9));
  });
});
