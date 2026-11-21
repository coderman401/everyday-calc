import { formatDate, formatDateLong } from '../../core/dates/dates';
import { formatPlain } from '../../core/formatting/format';
import type { ExplainerContent } from '../../shared/layout/explainer';
import type { DateGap, Span } from './date.engine';

export const spanText = (s: Span) => {
  const p = (n: number, one: string) => `${n} ${n === 1 ? one : one + 's'}`;
  return `${p(s.years, 'year')}, ${p(s.months, 'month')}, ${p(s.days, 'day')}`;
};

const FAQ: ExplainerContent['blocks'][number] = {
  type: 'faq',
  heading: 'Common questions',
  items: [
    {
      q: 'Is the last day counted?',
      a: 'The start date is day 0, so the count is the number of days that pass. From 1 January to 2 January is 1 day. Add 1 if you want both days included.',
    },
    {
      q: 'What happens when I add a month to the 31st?',
      a: 'The date moves to the last day of a shorter month: 31 January plus 1 month is 28 February (29 in a leap year).',
    },
    {
      q: 'Does the order of the dates matter?',
      a: 'No. The earlier date is always the start, so the answer is the same either way round.',
    },
  ],
};

export function buildDateGapExplainer(g: DateGap): ExplainerContent {
  return {
    blocks: [
      {
        type: 'text',
        heading: 'How the gap is counted',
        body: [
          'The calculator counts whole years first, then whole months, then the days left over, the way an age is counted. It adds months to the start date and does not assume 30 days to a month.',
          'Total days are plain calendar days, leap days included.',
        ],
      },
      {
        type: 'formula',
        heading: 'The method',
        lines: ['Total days = later date − earlier date', 'Weeks = total days ÷ 7, whole weeks and the days left'],
      },
      {
        type: 'steps',
        heading: 'Your dates, step by step',
        steps: [
          { label: 'From', value: formatDateLong(g.from) },
          { label: 'To', value: formatDateLong(g.to) },
          { label: 'Years, months and days', value: spanText(g) },
          { label: 'Total days', value: formatPlain(g.totalDays) },
          { label: 'Weeks and days', value: `${formatPlain(g.weeks)} weeks, ${g.restDays} days` },
        ],
      },
      FAQ,
    ],
  };
}

export function buildDateShiftExplainer(start: Date, span: Span, sign: 1 | -1, result: Date): ExplainerContent {
  return {
    blocks: [
      {
        type: 'text',
        heading: 'How a date is moved',
        body: [
          'Years and months are added first, to the same day of the month. Then the days are added one calendar day at a time, so month lengths and leap years are always right.',
        ],
      },
      {
        type: 'formula',
        heading: 'The method',
        lines: ['Result = start date ± (years and months) ± days'],
      },
      {
        type: 'steps',
        heading: 'Your dates, step by step',
        steps: [
          { label: 'Start date', value: formatDateLong(start) },
          { label: sign === 1 ? 'Add' : 'Subtract', value: spanText(span) },
          { label: 'Result', value: formatDate(result) },
          { label: 'Day of the week', value: formatDateLong(result).split(',')[0] },
        ],
      },
      FAQ,
    ],
  };
}
