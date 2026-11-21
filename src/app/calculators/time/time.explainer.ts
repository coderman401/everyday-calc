import type { ExplainerContent } from '../../shared/layout/explainer';
import { MINUTES_PER_DAY, dayOffsetText, formatClock, formatClock12, formatSpan } from './time.engine';

const FAQ: ExplainerContent['blocks'][number] = {
  type: 'faq',
  heading: 'Common questions',
  items: [
    {
      q: 'What if the end time is before the start time?',
      a: 'The calculator treats it as the next day, so 22:00 to 06:00 is 8 hours. Equal times give 0.',
    },
    {
      q: 'Why decimal hours?',
      a: 'Timesheets and pay often use them: 8 h 15 min is 8.25 hours. It is the minutes divided by 60.',
    },
    {
      q: 'Does it handle clock changes?',
      a: 'No. It works on a plain 24-hour day with no daylight saving, which is how most times are written down.',
    },
  ],
};

export function buildTimeBetweenExplainer(start: number, end: number, minutes: number): ExplainerContent {
  const overnight = end < start;
  return {
    blocks: [
      {
        type: 'text',
        heading: 'How the time between is counted',
        body: ['Each time is turned into minutes after midnight. Subtracting gives the minutes in between, and a negative answer means the end is on the next day.'],
      },
      {
        type: 'formula',
        heading: 'The method',
        lines: ['Minutes = end − start', 'If that is negative, add 1,440 (the minutes in a day)'],
      },
      {
        type: 'steps',
        heading: 'Your times, step by step',
        steps: [
          { label: 'Start in minutes', value: `${formatClock(start)} = ${start}` },
          { label: 'End in minutes', value: `${formatClock(end)} = ${end}` },
          { label: 'End − start', value: `${end - start}${overnight ? ` + ${MINUTES_PER_DAY} (next day)` : ''}` },
          { label: 'Time between', value: `${minutes} min = ${formatSpan(minutes)}` },
        ],
      },
      FAQ,
    ],
  };
}

export function buildTimeShiftExplainer(start: number, delta: number, result: { minutes: number; dayOffset: number }): ExplainerContent {
  return {
    blocks: [
      {
        type: 'text',
        heading: 'How a time is moved',
        body: ['The start time and the span are both turned into minutes and added (or subtracted). Dividing by 1,440 gives the days crossed and the remainder is the clock time.'],
      },
      {
        type: 'formula',
        heading: 'The method',
        lines: ['Total = start ± span, in minutes', 'Days crossed = total ÷ 1,440, rounded down', 'Clock time = the minutes left over'],
      },
      {
        type: 'steps',
        heading: 'Your times, step by step',
        steps: [
          { label: 'Start in minutes', value: `${formatClock(start)} = ${start}` },
          { label: 'Span in minutes', value: `${delta > 0 ? '+' : '−'}${Math.abs(delta)}` },
          { label: 'Total', value: String(start + delta) },
          { label: 'Result', value: `${formatClock(result.minutes)} (${formatClock12(result.minutes)}), ${dayOffsetText(result.dayOffset).toLowerCase()}` },
        ],
      },
      FAQ,
    ],
  };
}
