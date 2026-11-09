import { formatDuration, formatInr } from '../../core/formatting/format';
import type { ExplainerBlock, ExplainerContent } from '../../shared/layout/explainer';
import type { LoanConfig } from './loan.config';
import { type LoanResult } from './loan.engine';

export interface LoanExplainerInput {
  principal: number;
  annualRate: number;
  months: number;
  prepayOn: boolean;
  extraOn: boolean;
  stepOn: boolean;
  stepPercent: number;
}

/** The "How it's calculated" write-up, worked through with the numbers currently entered. */
export function buildLoanExplainer(
  config: LoanConfig,
  i: LoanExplainerInput,
  result: LoanResult,
): ExplainerContent {
  const r = i.annualRate / 12 / 100;
  const growth = Math.pow(1 + r, i.months);
  const emi = result.emi;
  const plainTotal = emi * i.months;
  const monthOneInterest = i.principal * r;
  const monthOnePrincipal = emi - monthOneInterest;
  const interestShare = emi > 0 ? (monthOneInterest / emi) * 100 : 0;

  const blocks: ExplainerBlock[] = [
    { type: 'text', heading: 'What an EMI is', body: config.copy.whatIs },
    {
      type: 'formula',
      heading: 'The EMI formula',
      intro: 'Every instalment is the same amount, worked out once from three numbers.',
      lines: ['EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)'],
      where: [
        { sym: 'P', meaning: 'the loan amount (principal)' },
        { sym: 'r', meaning: 'the monthly interest rate: annual rate ÷ 12 ÷ 100' },
        { sym: 'n', meaning: 'the number of monthly instalments: tenure in months' },
      ],
    },
    {
      type: 'steps',
      heading: 'Your numbers, step by step',
      intro: 'This is the plain loan, before any prepayment, extra EMIs or step-up.',
      steps: [
        { label: `Loan amount (P)`, value: formatInr(i.principal) },
        { label: `Monthly rate (r) = ${i.annualRate}% ÷ 12 ÷ 100`, value: r.toFixed(6) },
        { label: `Instalments (n) = ${formatDuration(i.months)} in months`, value: String(i.months) },
        { label: 'Growth factor (1 + r)ⁿ', value: growth.toFixed(4) },
        { label: 'EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)', value: formatInr(emi) },
        { label: `Total payment = EMI × ${i.months}`, value: formatInr(plainTotal) },
        { label: 'Total interest = total payment − P', value: formatInr(plainTotal - i.principal) },
      ],
    },
    {
      type: 'formula',
      heading: 'How each EMI is split',
      intro: `Interest is charged on the balance, so early EMIs are mostly interest. In month 1 of your loan, ${formatInr(monthOneInterest)} of the ${formatInr(emi)} is interest (${interestShare.toFixed(0)}%) and ${formatInr(monthOnePrincipal)} reduces the loan. Each month the same three lines repeat on the smaller balance.`,
      lines: [
        'Interest = opening balance × r',
        'Principal repaid = EMI − interest',
        'Closing balance = opening balance − principal repaid',
      ],
    },
  ];

  const extras: string[] = [];
  if (i.prepayOn) {
    extras.push(
      'Prepayment: a lump sum paid in the month you choose comes straight off the balance. The EMI stays the same, so the loan ends sooner.',
    );
  }
  if (i.extraOn) {
    extras.push(
      'Extra EMIs: the extra instalments are paid at the end of every loan year and also come straight off the balance.',
    );
  }
  if (i.stepOn) {
    extras.push(
      `Yearly step-up: from the second year the EMI rises by ${i.stepPercent}% at the start of each year, so more goes to principal each month.`,
    );
  }
  blocks.push({
    type: 'list',
    heading: 'What the extra options do',
    intro: result.hasExtras
      ? `Your results include your extras. The loan ends in ${formatDuration(result.months)}, against ${formatDuration(result.plain.months)} for the plain loan, and you save ${formatInr(result.interestSaved)} in interest.`
      : 'Switch on an option above and the results update. All three work the same way: they pay down principal early and keep the EMI as it is.',
    items: extras.length
      ? extras
      : [
          'Prepayment: a lump sum, paid in the month you choose, comes off the balance.',
          'Extra EMIs: additional instalments paid at the end of each loan year.',
          'Yearly step-up: the EMI rises by a set percentage from the second year.',
          'Because interest is charged on the balance, less balance means less interest and an earlier finish. Here the tenure shortens and the EMI stays; a lender may offer to cut the EMI and keep the tenure.',
        ],
  });

  blocks.push(
    { type: 'list', heading: 'Ways to pay less interest', items: config.copy.tips },
    { type: 'list', heading: 'What this does not include', items: config.copy.notIncluded },
    { type: 'faq', heading: 'Common questions', items: config.copy.faq },
  );

  return { blocks };
}
