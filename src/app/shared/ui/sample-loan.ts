import { HOME_LOAN_CONFIG as C } from '../../calculators/loan/loan.config';
import { calculateLoan } from '../../calculators/loan/loan.engine';
import { buildLoanExplainer } from '../../calculators/loan/loan.explainer';
import type { ExplainerBlock } from '../layout/explainer';

/**
 * The home loan calculator's own defaults, worked once by the real engine and written up by the
 * real explainer. The home page's walkthrough and engine diagram both read from here, so what they
 * show is what the calculator itself answers, and the hero sample agrees with them.
 */
export const SAMPLE_INPUT = {
  principal: C.amount.default,
  annualRate: C.rate.default,
  months: C.defaultYears * 12,
};

export const SAMPLE_YEARS = C.defaultYears;
export const SAMPLE = calculateLoan(SAMPLE_INPUT);

/** Where each default sits on its slider, from 0 to 1. */
export const SAMPLE_AT = {
  amount: (C.amount.default - C.amount.min) / (C.amount.max - C.amount.min),
  rate: (C.rate.default - C.rate.min) / (C.rate.max - C.rate.min),
  years: (C.defaultYears - 1) / (C.maxYears - 1),
};

const explainer = buildLoanExplainer(
  C,
  { ...SAMPLE_INPUT, prepayOn: false, extraOn: false, stepOn: false, stepPercent: 0 },
  SAMPLE,
);

type Block<T extends ExplainerBlock['type']> = Extract<ExplainerBlock, { type: T }>;

function pick<T extends ExplainerBlock['type']>(type: T): Block<T> {
  const block = explainer.blocks.find((b): b is Block<T> => b.type === type);
  if (!block) throw new Error(`The home loan explainer has no ${type} block`);
  return block;
}

/** "EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)" */
export const SAMPLE_FORMULA = pick('formula').lines[0];

/** The worked example: a label and a result per line, with the numbers above. */
export const SAMPLE_STEPS = pick('steps').steps;
