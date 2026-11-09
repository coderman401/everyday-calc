import { formatDate, formatDay } from '../../core/dates/dates';
import type { ExplainerContent } from '../../shared/layout/explainer';
import { FERTILE_AFTER, FERTILE_BEFORE, LUTEAL_DAYS, type CycleResult } from './cycle.engine';

export interface CycleExplainerInput {
  lastPeriod: Date;
  cycleLength: number;
  periodLength: number;
}

export function buildCycleExplainer(i: CycleExplainerInput, r: CycleResult): ExplainerContent {
  const f = r.focus;
  const ovDay = i.cycleLength - LUTEAL_DAYS;
  const cyclesAhead = Math.round((r.next.start.getTime() - i.lastPeriod.getTime()) / 86_400_000 / i.cycleLength);

  return {
    blocks: [
      {
        type: 'text',
        heading: 'How the dates are worked out',
        body: [
          'Cycle day 1 is the first day of a period, and a cycle runs until the day before the next one starts. Everything here is counted from that first day.',
          'Ovulation, when an egg is released, happens about 14 days before the next period, however long the cycle is. So the calculator counts back from the next period, not forward from the last one.',
        ],
      },
      {
        type: 'formula',
        heading: 'The formulas',
        lines: [
          'Next period = first day of last period + cycle length',
          `Ovulation = next period − ${LUTEAL_DAYS} days`,
          `Fertile window = ovulation − ${FERTILE_BEFORE} days to ovulation + ${FERTILE_AFTER} day`,
          'Period ends = first day + period length − 1',
        ],
        where: [
          { sym: '14', meaning: 'days from ovulation to the next period (the luteal phase), steady from cycle to cycle' },
          { sym: '5, 1', meaning: 'sperm can live up to 5 days, and the egg lasts about a day after it is released' },
        ],
      },
      {
        type: 'steps',
        heading: 'Your dates, step by step',
        steps: [
          { label: 'First day of your last period', value: formatDate(i.lastPeriod) },
          { label: 'Cycle length', value: `${i.cycleLength} days` },
          {
            label: `Next period = last period + ${cyclesAhead} × ${i.cycleLength} days`,
            value: formatDate(r.next.start),
          },
          { label: `Ovulation = cycle start + ${ovDay} days (cycle day ${ovDay + 1})`, value: formatDate(f.ovulation) },
          { label: 'Fertile window', value: `${formatDay(f.fertileStart)} to ${formatDay(f.fertileEnd)}` },
          {
            label: `Period of ${i.periodLength} days starting ${formatDay(f.start)}`,
            value: `${formatDay(f.start)} to ${formatDay(f.periodEnd)}`,
          },
        ],
      },
      {
        type: 'table',
        heading: 'The four stretches of a cycle',
        intro: `Shown for your ${i.cycleLength}-day cycle with a ${i.periodLength}-day period.`,
        columns: ['Stretch', 'Cycle days', 'What is happening'],
        rows: r.phases.map((p) => [
          p.label,
          p.days === 0 ? 'none' : p.fromDay === p.toDay ? `Day ${p.fromDay}` : `Days ${p.fromDay} to ${p.toDay}`,
          {
            period: 'Bleeding. The lining of the womb is shed.',
            before: 'Hormones rise and an egg matures.',
            fertile: 'Pregnancy is possible. Ovulation falls near the end of this window.',
            after: 'The body prepares for a possible pregnancy. If there is none, the next period starts.',
          }[p.id],
        ]),
      },
      {
        type: 'list',
        heading: 'How reliable this is',
        items: [
          'These are estimates. Cycles vary by a few days from month to month, and ovulation can come earlier or later than the formula says.',
          'Stress, illness, travel, breastfeeding, hormonal contraception and conditions such as PCOS or thyroid problems can all change a cycle.',
          'This is not a method of contraception, and it cannot confirm or rule out a pregnancy.',
          'A typical cycle is 21 to 35 days. If yours is often shorter or longer, or you miss periods, speak to a doctor.',
        ],
      },
      {
        type: 'faq',
        heading: 'Common questions',
        items: [
          {
            q: 'Why does ovulation move when the cycle length changes?',
            a: 'The stretch before ovulation is the part that varies. The stretch after it is about 14 days for most people, so a longer cycle means a later ovulation, a shorter one an earlier one.',
          },
          {
            q: 'What if my cycles are irregular?',
            a: 'Enter your usual length and treat the dates as a rough guide. With irregular cycles the real dates can be a week or more off. Tracking your own cycles for a few months gives a better picture than any formula.',
          },
        ],
      },
    ],
  };
}
