import { calculateCycle, datesForCycle, phasesOf } from './cycle.engine';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('cycle engine', () => {
  it('a 28-day cycle ovulates 14 days after it starts and the next period is 28 days on', () => {
    const c = datesForCycle(d(2026, 3, 1), 28, 5);
    expect(c.periodEnd).toEqual(d(2026, 3, 5));
    expect(c.ovulation).toEqual(d(2026, 3, 15));
    expect(c.fertileStart).toEqual(d(2026, 3, 10));
    expect(c.fertileEnd).toEqual(d(2026, 3, 16));
  });

  it('ovulation moves with the cycle length (counted back from the next period)', () => {
    expect(datesForCycle(d(2026, 3, 1), 35, 5).ovulation).toEqual(d(2026, 3, 22));
    expect(datesForCycle(d(2026, 3, 1), 24, 5).ovulation).toEqual(d(2026, 3, 11));
  });

  it('finds the next period after today', () => {
    const r = calculateCycle({ lastPeriod: d(2026, 3, 1), cycleLength: 28, periodLength: 5, today: d(2026, 3, 10) });
    expect(r.next.start).toEqual(d(2026, 3, 29));
    expect(r.daysToNext).toBe(19);
    expect(r.cycleDay).toBe(10);
    expect(r.upcoming).toHaveLength(6);
    expect(r.upcoming[1].start).toEqual(d(2026, 4, 26));
  });

  it('skips forward when the last period was several cycles ago', () => {
    const r = calculateCycle({ lastPeriod: d(2026, 1, 1), cycleLength: 28, periodLength: 5, today: d(2026, 3, 10) });
    // 68 days since: 2 whole cycles, so next start is day 84 = 26 Mar
    expect(r.next.start).toEqual(d(2026, 3, 26));
    expect(r.cycleDay).toBe(13);
  });

  it('on the first day of a period the next one is a full cycle away', () => {
    const r = calculateCycle({ lastPeriod: d(2026, 3, 1), cycleLength: 30, periodLength: 5, today: d(2026, 3, 1) });
    expect(r.cycleDay).toBe(1);
    expect(r.daysToNext).toBe(30);
  });

  it('lists the current cycle first and picks the fertile window still ahead', () => {
    const r = calculateCycle({ lastPeriod: d(2026, 3, 1), cycleLength: 28, periodLength: 5, today: d(2026, 3, 10) });
    expect(r.current?.start).toEqual(d(2026, 3, 1));
    expect(r.cycles[0].start).toEqual(d(2026, 3, 1));
    expect(r.cycles).toHaveLength(6);
    expect(r.focus.start).toEqual(d(2026, 3, 1)); // window 10 to 16 Mar is under way

    const later = calculateCycle({ lastPeriod: d(2026, 3, 1), cycleLength: 28, periodLength: 5, today: d(2026, 3, 20) });
    expect(later.focus.start).toEqual(d(2026, 3, 29)); // this cycle's window has passed
  });

  it('phases add up to the cycle length for every allowed cycle and period', () => {
    for (let cycle = 21; cycle <= 45; cycle++) {
      for (let period = 2; period <= 10; period++) {
        const total = phasesOf(cycle, period).reduce((s, p) => s + p.days, 0);
        expect(total).toBe(cycle);
      }
    }
  });

  it('puts the fertile window around ovulation in a 28-day cycle', () => {
    const p = phasesOf(28, 5);
    expect(p[2]).toMatchObject({ id: 'fertile', fromDay: 10, toDay: 16, days: 7 });
    expect(p[0].days).toBe(5);
    expect(p[3].toDay).toBe(28);
  });
});
