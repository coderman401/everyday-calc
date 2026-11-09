import { addMonthsClamped, formatDate, formatWeekday } from '../../core/dates/dates';
import { formatPlain } from '../../core/formatting/format';
import type { ExplainerContent } from '../../shared/layout/explainer';
import type { AgeResult } from './age.engine';

export function buildAgeExplainer(dob: Date, asOf: Date, r: AgeResult | null): ExplainerContent {
  const steps = r
    ? [
        { label: 'Date of birth', value: `${formatDate(dob)} (${formatWeekday(dob)})` },
        { label: 'Age on', value: formatDate(asOf) },
        { label: 'Whole years from birth', value: String(r.years) },
        {
          label: `Birth date + ${r.years} years and ${r.months} months`,
          value: formatDate(addMonthsClamped(dob, r.totalMonths)),
        },
        { label: 'Days from that date to the age-on date', value: String(r.days) },
        { label: 'Total calendar days = age-on date − birth date', value: formatPlain(r.totalDays) },
        { label: 'Age', value: `${r.years} years, ${r.months} months, ${r.days} days` },
      ]
    : [{ label: 'Check the dates', value: 'The age-on date is before the birth date' }];

  return {
    blocks: [
      {
        type: 'text',
        heading: 'How age is counted',
        body: [
          'Age is worked out on the calendar, the way a birthday works. You are a year older on the day the date comes round again, not 365 days after you were born.',
          'The calculator counts whole years first, then whole months, and then the days left over. Month lengths differ, so it adds whole months to the birth date and does not assume 30 days to a month.',
        ],
      },
      {
        type: 'formula',
        heading: 'The method',
        lines: [
          'Years = whole years from the birth date to the age-on date',
          'Months = whole months left after those years',
          'Days = days left after those months',
          'Total days = age-on date − birth date',
        ],
      },
      { type: 'steps', heading: 'Your dates, step by step', steps },
      {
        type: 'list',
        heading: 'Edge cases handled',
        items: [
          'A birth date on the 29th, 30th or 31st moves to the last day of a shorter month: 31 January plus one month is 28 February (29 in a leap year).',
          'A 29 February birthday is counted on 28 February in years that have no 29 February.',
          'Total days count every calendar day, including leap days. Hours are those days times 24, so they are exact to the day, not to the minute you were born.',
          'The birth date itself is day 0, so on that date the age is 0 years, 0 months, 0 days.',
        ],
      },
      {
        type: 'faq',
        heading: 'Common questions',
        items: [
          {
            q: 'Can I find my age on a past or future date?',
            a: 'Yes. Change the “Age on” date. It starts as today. This is handy for the age needed on a form’s cut-off date or for planning a milestone birthday.',
          },
          {
            q: 'Why does the next-birthday ring change length?',
            a: 'It shows how far you are between your last and next birthday. A leap year has 366 days between birthdays, so the ring is measured against that year’s length.',
          },
        ],
      },
    ],
  };
}
