import { formatDuration, formatInr } from '../../core/formatting/format';
import type { ExplainerContent } from '../../shared/layout/explainer';
import {
  COMPOUNDING_OPTIONS,
  effectiveYield,
  maturityValue,
  type Compounding,
  type FdResult,
} from './fd.engine';

export interface FdExplainerInput {
  principal: number;
  annualRate: number;
  months: number;
  compounding: Compounding;
}

const LABEL: Record<Compounding, string> = { 12: 'monthly', 4: 'quarterly', 2: 'half-yearly', 1: 'yearly' };

export function buildFdExplainer(i: FdExplainerInput, result: FdResult): ExplainerContent {
  const n = i.compounding;
  const t = i.months / 12;
  const periodRate = i.annualRate / 100 / n;
  const periods = n * t;
  const growth = Math.pow(1 + periodRate, periods);
  const simple = i.principal * (i.annualRate / 100) * t;

  return {
    blocks: [
      {
        type: 'text',
        heading: 'What a fixed deposit is',
        body: [
          'A fixed deposit (FD) lends a lump sum to a bank for a fixed time at a fixed rate. The rate is locked in for the whole tenure, so you know the maturity value on day one.',
          'In a cumulative FD the interest is not paid out; it is added to the deposit and earns interest too. That is compound interest, and the more often it is added, the more you earn.',
        ],
      },
      {
        type: 'formula',
        heading: 'The FD formula',
        lines: ['A = P × (1 + r ÷ n)^(n × t)', 'Interest earned = A − P'],
        where: [
          { sym: 'A', meaning: 'the maturity amount' },
          { sym: 'P', meaning: 'the amount you deposit' },
          { sym: 'r', meaning: 'the annual interest rate as a fraction (7% is 0.07)' },
          { sym: 'n', meaning: 'times interest is added per year: 12 monthly, 4 quarterly, 2 half-yearly, 1 yearly' },
          { sym: 't', meaning: 'the tenure in years' },
        ],
      },
      {
        type: 'steps',
        heading: 'Your numbers, step by step',
        intro: `Interest is added ${LABEL[n]}.`,
        steps: [
          { label: 'Deposit (P)', value: formatInr(i.principal) },
          { label: `Rate per period = ${i.annualRate}% ÷ 100 ÷ ${n}`, value: periodRate.toFixed(6) },
          { label: `Periods = ${n} × ${formatDuration(i.months)} in years`, value: periods.toFixed(periods % 1 ? 2 : 0) },
          { label: 'Growth factor (1 + r ÷ n)^(n × t)', value: growth.toFixed(4) },
          { label: 'Maturity amount A = P × growth factor', value: formatInr(result.maturity) },
          { label: 'Interest earned = A − P', value: formatInr(result.interest) },
        ],
      },
      {
        type: 'table',
        heading: 'How the compounding changes the result',
        intro: `The same ${formatInr(i.principal)} at ${i.annualRate}% for ${formatDuration(i.months)}, paid out under each rule. The effective yield is the yearly rate you really earn once compounding is counted: (1 + r ÷ n)ⁿ − 1.`,
        columns: ['Interest added', 'Maturity amount', 'Interest earned', 'Effective yield'],
        rows: COMPOUNDING_OPTIONS.map((o) => {
          const a = maturityValue(i.principal, i.annualRate, i.months, o.value);
          return [
            o.label + (o.value === n ? ' (yours)' : ''),
            formatInr(a),
            formatInr(a - i.principal),
            `${effectiveYield(i.annualRate, o.value).toFixed(2)}%`,
          ];
        }),
      },
      {
        type: 'formula',
        heading: 'If you take the interest as a payout',
        intro: `With a monthly, quarterly or yearly payout FD the interest is paid out to you as it is earned, so nothing compounds. Each payout is the simple interest for that period. On your deposit the interest over ${formatDuration(i.months)} would be ${formatInr(simple)}, against ${formatInr(result.interest)} when it compounds.`,
        lines: ['Simple interest = P × r × t', 'Payout each period = P × r ÷ n'],
      },
      {
        type: 'list',
        heading: 'Before you rely on it',
        items: [
          'Most banks in India compound quarterly. Check your FD receipt for the rule that applies to you.',
          'Interest on an FD is taxable as part of your income, and the bank may deduct tax at source above a yearly limit. This calculator shows the amount before tax.',
          'Withdrawing early usually costs you a penalty, often a lower rate for the time the money was held. The rate shown assumes you hold to maturity.',
          'Rates differ by bank and tenure, and senior citizens are often offered a higher rate. Enter the rate on your own quote.',
        ],
      },
      {
        type: 'faq',
        heading: 'Common questions',
        items: [
          {
            q: 'Why is the maturity higher than simple interest?',
            a: 'Because interest earns interest. Each time it is added, the next period’s interest is worked out on a bigger amount. The gap grows with the tenure and the rate.',
          },
          {
            q: 'Which compounding should I choose?',
            a: 'The one on your FD. If you are comparing banks, compare the effective yield, because a lower rate that compounds monthly can beat a higher one that compounds yearly.',
          },
        ],
      },
    ],
  };
}
