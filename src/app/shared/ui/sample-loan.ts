import { HOME_LOAN_CONFIG as C } from '../../calculators/loan/loan.config';
import { calculateLoan } from '../../calculators/loan/loan.engine';
import { buildLoanExplainer } from '../../calculators/loan/loan.explainer';
import type { ExplainerBlock } from '../layout/explainer';

/**
 * The home loan calculator's own defaults, worked once by the real engine and written up by the
 * real explainer. The home page's first everyday question reads from here, so what it shows is
 * what the calculator itself answers, and the hero sample agrees with it.
 */
export const SAMPLE_INPUT = {
  principal: C.amount.default,
  annualRate: C.rate.default,
  months: C.defaultYears * 12,
};

export const SAMPLE_YEARS = C.defaultYears;
export const SAMPLE = calculateLoan(SAMPLE_INPUT);

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

/** The worked example: a label and a result per line, with the numbers above. */
export const SAMPLE_STEPS = pick('steps').steps;
