import { formatDate } from '../../core/dates/dates';
import type { ExplainerContent } from '../../shared/layout/explainer';
import type { Method, PregnancyResult } from './pregnancy.engine';

export interface PregnancyExplainerInput {
  method: Method;
  date: Date;
  cycleLength: number;
}

const weeksDays = (w: number, d: number) => `${w} ${w === 1 ? 'week' : 'weeks'} ${d} ${d === 1 ? 'day' : 'days'}`;

export function buildPregnancyExplainer(i: PregnancyExplainerInput, r: PregnancyResult): ExplainerContent {
  const adjust = i.cycleLength - 28;

  const steps =
    i.method === 'lmp'
      ? [
          { label: 'First day of your last period', value: formatDate(i.date) },
          {
            label: `Cycle adjustment = ${i.cycleLength} − 28 days`,
            value: `${adjust >= 0 ? '+' : '−'}${Math.abs(adjust)} days`,
          },
          { label: 'Adjusted start date', value: formatDate(r.start) },
          { label: 'Due date = adjusted start + 280 days', value: formatDate(r.due) },
        ]
      : [
          { label: 'Conception date', value: formatDate(i.date) },
          { label: 'Start date = conception − 14 days', value: formatDate(r.start) },
          { label: 'Due date = start + 280 days (conception + 266)', value: formatDate(r.due) },
        ];

  if (r.state !== 'notStarted') {
    steps.push({
      label: 'Pregnant today = today − start date',
      value: `${r.gestationalDays} days = ${weeksDays(r.weeks, r.days)}`,
    });
  }

  return {
    blocks: [
      {
        type: 'text',
        heading: 'How the due date is found',
        body: [
          'A full-term pregnancy lasts about 40 weeks, or 280 days, counted from the first day of your last period. This is called Naegele’s rule, and it is how doctors date a pregnancy.',
          'Weeks are counted from that period, not from conception, which happens about two weeks later. So at the moment of conception you are already counted as two weeks pregnant.',
        ],
      },
      {
        type: 'formula',
        heading: 'The formulas',
        lines: [
          'Due date = first day of last period + 280 days',
          'With cycle length: + (cycle length − 28) days',
          'From conception: due date = conception date + 266 days',
        ],
        where: [
          { sym: '280', meaning: '40 weeks, counted from the first day of the last period' },
          { sym: '266', meaning: '280 days less the 14 days between that period and conception' },
          { sym: '28', meaning: 'the cycle length the rule assumes; a longer cycle ovulates later, so the date moves later' },
        ],
      },
      { type: 'steps', heading: 'Your dates, step by step', steps },
      {
        type: 'table',
        heading: 'What each trimester covers',
        columns: ['Trimester', 'Weeks', 'Counted as'],
        rows: [
          ['First', '1 to 13', '0 weeks 0 days to 13 weeks 6 days'],
          ['Second', '14 to 27', '14 weeks 0 days to 27 weeks 6 days'],
          ['Third', '28 to birth', '28 weeks 0 days onward'],
        ],
      },
      {
        type: 'list',
        heading: 'How reliable this is',
        items: [
          'The due date is an estimate. Only around one baby in twenty is born on it. Most arrive in the weeks either side.',
          'Early-term is 37 to 38 weeks, full term 39 to 40, and a pregnancy is called post-term from 42 weeks.',
          'If your cycles are irregular or you are unsure of the date, an early ultrasound gives a more reliable estimate, and your doctor may move the due date to match it.',
          'This calculator does not replace antenatal care. Book your scans and check-ups with your doctor or midwife.',
        ],
      },
      {
        type: 'faq',
        heading: 'Common questions',
        items: [
          {
            q: 'Why does my cycle length change the date?',
            a: 'The rule assumes you ovulate on day 14 of a 28-day cycle. If your cycle is 35 days you probably ovulate about a week later, so the pregnancy, and the due date, start about a week later.',
          },
          {
            q: 'Which date should I enter if I know the conception date?',
            a: 'Use the conception date option. It places the start 14 days before conception and adds 280 days, which is the same as adding 266 days to the conception date.',
          },
          {
            q: 'Why does the calculator say I am further along than the date of conception suggests?',
            a: 'Because weeks are counted from the last period. A baby conceived four weeks ago is “six weeks” pregnant by this count.',
          },
        ],
      },
    ],
  };
}
