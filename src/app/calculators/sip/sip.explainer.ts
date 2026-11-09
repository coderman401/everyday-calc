import { formatDuration, formatInr, formatPercent } from '../../core/formatting/format';
import type { ExplainerContent } from '../../shared/layout/explainer';
import { sipFutureValue, type SipResult } from './sip.engine';

export interface SipExplainerInput {
  monthly: number;
  annualRate: number;
  years: number;
  stepOn: boolean;
  stepPercent: number;
}

export function buildSipExplainer(i: SipExplainerInput, result: SipResult): ExplainerContent {
  const n = i.years * 12;
  const r = i.annualRate / 12 / 100;
  const growth = Math.pow(1 + r, n);
  const annuity = r === 0 ? n : (growth - 1) / r;
  const fv = sipFutureValue(i.monthly, i.annualRate, n);
  const invested = i.monthly * n;
  const returnsShare = result.value > 0 ? (result.returns / result.value) * 100 : 0;

  return {
    blocks: [
      {
        type: 'text',
        heading: 'What a SIP is',
        body: [
          'A systematic investment plan (SIP) puts a fixed amount into a mutual fund every month. Because the amount is fixed, you buy more units when the price is low and fewer when it is high.',
          'Your money grows in two ways: what you add each month, and the returns on everything already invested. The second part compounds, which is why time matters more than the size of any single instalment.',
        ],
      },
      {
        type: 'formula',
        heading: 'The SIP formula',
        intro:
          'Each instalment is invested at the start of the month, so it also earns that month’s return. That is the closing (1 + i).',
        lines: ['FV = P × [((1 + i)ⁿ − 1) ÷ i] × (1 + i)'],
        where: [
          { sym: 'FV', meaning: 'the value of the SIP at the end' },
          { sym: 'P', meaning: 'the monthly instalment' },
          { sym: 'i', meaning: 'the monthly return: annual rate ÷ 12 ÷ 100' },
          { sym: 'n', meaning: 'the number of monthly instalments: years × 12' },
        ],
      },
      {
        type: 'steps',
        heading: 'Your numbers, step by step',
        intro: 'This is the level SIP, before any yearly increase.',
        steps: [
          { label: 'Monthly investment (P)', value: formatInr(i.monthly) },
          { label: `Monthly return (i) = ${i.annualRate}% ÷ 12 ÷ 100`, value: r.toFixed(6) },
          { label: `Instalments (n) = ${formatDuration(n)} in months`, value: String(n) },
          { label: 'Growth factor (1 + i)ⁿ', value: growth.toFixed(4) },
          { label: 'Annuity factor = ((1 + i)ⁿ − 1) ÷ i', value: annuity.toFixed(4) },
          { label: 'FV = P × annuity factor × (1 + i)', value: formatInr(fv) },
          { label: 'Amount invested = P × n', value: formatInr(invested) },
          { label: 'Estimated returns = FV − invested', value: formatInr(fv - invested) },
        ],
      },
      {
        type: 'formula',
        heading: 'Raising the SIP each year',
        intro: i.stepOn
          ? `You raise the instalment by ${i.stepPercent}% a year, from ${formatInr(i.monthly)} to ${formatInr(result.lastInstalment)} in year ${i.years}. That has no single formula, so the calculator runs it month by month. Your results above include it.`
          : 'If you raise the instalment by g% each year, there is no single formula, so the calculator runs it month by month. Switch the option on above to see it.',
        lines: ['Instalment in year k = P × (1 + g)ᵏ⁻¹', 'Balance = (balance + instalment) × (1 + i), every month'],
        where: [{ sym: 'g', meaning: 'the yearly increase as a fraction, for example 0.10 for 10%' }],
      },
      {
        type: 'list',
        heading: 'Reading your result',
        items: [
          'Invested amount is the sum of every instalment you pay in.',
          `Estimated returns are the final value minus what you invested. In your plan they make up ${formatPercent(returnsShare, 0)} of the final value.`,
          'The donut shows that split. The longer the SIP runs, the bigger the returns slice grows, because returns earn returns.',
        ],
      },
      {
        type: 'list',
        heading: 'What the result leaves out',
        items: [
          'The return rate is an assumption, not a promise. Mutual fund returns are linked to the market and change from year to year.',
          'Expense ratio, exit load and tax on gains are not deducted here, so the amount you keep will be lower.',
          'Inflation reduces what the final amount buys. At 6% a year, ₹1 lakh in ten years buys what about ₹56,000 buys today.',
          'Stopping early or skipping instalments cuts the result. Compounding rewards staying invested.',
        ],
      },
      {
        type: 'faq',
        heading: 'Common questions',
        items: [
          {
            q: 'Which return rate should I enter?',
            a: 'Try a few, such as 8%, 10% and 12%, to see the range of outcomes. Debt funds and equity funds behave very differently, so match the rate to the kind of fund you will use.',
          },
          {
            q: 'SIP or lump sum?',
            a: 'A SIP spreads the risk of buying at a high price and suits a monthly income. A lump sum invested on day one has longer to compound. The Fixed Deposit calculator works out a lump sum at a fixed rate.',
          },
          {
            q: 'Are instalments invested at the start or the end of the month?',
            a: 'The start. If your fund debits at month end, your value will be slightly lower than shown here.',
          },
        ],
      },
    ],
  };
}
