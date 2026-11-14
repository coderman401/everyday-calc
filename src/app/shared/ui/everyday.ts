import { calculateAge } from '../../calculators/age/age.engine';
import { buildAgeExplainer } from '../../calculators/age/age.explainer';
import { calculateBmi } from '../../calculators/bmi/bmi.engine';
import { buildBmiExplainer } from '../../calculators/bmi/bmi.explainer';
import { calculatePregnancy } from '../../calculators/pregnancy/pregnancy.engine';
import { buildPregnancyExplainer } from '../../calculators/pregnancy/pregnancy.explainer';
import { calculateSip } from '../../calculators/sip/sip.engine';
import { buildSipExplainer } from '../../calculators/sip/sip.explainer';
import { addDays, formatDate, startOfDay } from '../../core/dates/dates';
import { formatInr } from '../../core/formatting/format';
import { CALCULATORS, type CalculatorInfo, type CategoryId } from '../../core/registry/calculators';
import type { ExplainerBlock } from '../layout/explainer';
import { examples } from './examples';
import { SAMPLE, SAMPLE_INPUT, SAMPLE_STEPS, SAMPLE_YEARS } from './sample-loan';
import type { TileVisualSpec } from '../charts/tile-visual';

/** The colour each kind of calculator wears on the home page: a flat tint of one brand colour. */
export const CATEGORY_COLOR: Record<CategoryId, string> = {
  loans: 'var(--blue)',
  investing: 'var(--ecto)',
  health: 'var(--pink)',
};

interface Line {
  label: string;
  value: string;
}

/** One question from everyday life, answered by one calculator, with everything it shows. */
export interface Everyday {
  info: CalculatorInfo;
  /** The flat colour this question wears on the home page. */
  color: string;
  question: string;
  /** What to type, in a sentence. */
  hint: string;
  enter: Line[];
  result: { label: string; figure: string; note: string };
  visual: TileVisualSpec;
  /** Three lines of the calculator's own "how it's calculated" worked example. */
  working: Line[];
}

const find = (slug: string) => CALCULATORS.find((c) => c.slug === slug)!;

const stepsOf = (blocks: ExplainerBlock[], pick: (n: number) => number[]): Line[] => {
  const block = blocks.find(
    (b): b is Extract<ExplainerBlock, { type: 'steps' }> => b.type === 'steps',
  );
  if (!block) throw new Error('The explainer has no worked steps');
  return pick(block.steps.length).map((i) => block.steps[i]);
};

/**
 * Five of the calculators, each asked an ordinary question. Every figure is worked by the
 * calculator's own engine and every working line comes from its own explainer, so what the home
 * page shows is what the calculator answers.
 */
function build(): Everyday[] {
  const ex = examples();
  const today = startOfDay(new Date());

  // A loan
  const loan = {
    info: find('home-loan-emi'),
    color: 'var(--blue)',
    question: 'What will this loan cost me every month?',
    hint: 'Type the amount, the rate and how long you will take. The EMI and the split between principal and interest appear straight away.',
    enter: [
      { label: 'Home loan amount', value: formatInr(SAMPLE_INPUT.principal) },
      { label: 'Interest rate (per year)', value: `${SAMPLE_INPUT.annualRate}%` },
      { label: 'Loan tenure', value: `${SAMPLE_YEARS} years` },
    ],
    result: {
      label: 'Monthly EMI',
      figure: formatInr(SAMPLE.emi),
      note: `for ${SAMPLE_YEARS} years`,
    },
    visual: ex['home-loan-emi'].visual,
    working: [SAMPLE_STEPS[1], SAMPLE_STEPS[2], SAMPLE_STEPS[4]],
  };

  // A monthly investment
  const sipIn = { monthly: 10_000, annualRate: 12, years: 10 };
  const sip = calculateSip(sipIn);
  const sipSteps = stepsOf(
    buildSipExplainer({ ...sipIn, stepOn: false, stepPercent: 10 }, sip).blocks,
    () => [1, 2, 5],
  );

  // A weight
  const bmi = calculateBmi(65, 170, 'who');
  const bmiSteps = stepsOf(
    buildBmiExplainer(
      {
        units: 'metric',
        standard: 'who',
        heightCm: 170,
        weightKg: 65,
        heightText: '170 cm',
        weightText: '65 kg',
      },
      bmi,
    ).blocks,
    () => [1, 2, 4],
  );

  // A birthday
  const dob = new Date(1995, 2, 14);
  const age = calculateAge(dob, today)!;
  const ageSteps = stepsOf(buildAgeExplainer(dob, today, age).blocks, (n) => [0, 1, n - 1]);

  // A due date
  const lmp = addDays(today, -84);
  const preg = calculatePregnancy({ method: 'lmp', date: lmp, cycleLength: 28, today });
  const pregSteps = stepsOf(
    buildPregnancyExplainer({ method: 'lmp', date: lmp, cycleLength: 28 }, preg).blocks,
    (n) => [0, 3, n - 1],
  );

  return [
    loan,
    {
      info: find('sip'),
      color: 'var(--ecto)',
      question: 'What will my monthly SIP be worth?',
      hint: 'Say how much you invest each month, the return you expect and for how long.',
      enter: [
        { label: 'Monthly investment', value: formatInr(sipIn.monthly) },
        { label: 'Expected return (per year)', value: `${sipIn.annualRate}%` },
        { label: 'Time period', value: `${sipIn.years} years` },
      ],
      result: {
        label: `Value after ${sipIn.years} years`,
        figure: formatInr(sip.value),
        note: `from ${formatInr(sip.invested)} put in`,
      },
      visual: ex['sip'].visual,
      working: sipSteps,
    },
    {
      info: find('bmi'),
      color: 'var(--c-interest)',
      question: 'Is my weight healthy for my height?',
      hint: 'Enter your height and weight in metric or imperial. You get your BMI, its category and the weight range that is healthy for you.',
      enter: [
        { label: 'Height', value: '170 cm' },
        { label: 'Weight', value: '65 kg' },
      ],
      result: { label: 'Your BMI', figure: bmi.bmi.toFixed(1), note: bmi.category.label },
      visual: ex['bmi'].visual,
      working: bmiSteps,
    },
    {
      info: find('age'),
      color: 'var(--sun)',
      question: 'How old am I, to the day?',
      hint: 'Enter a date of birth. You get your age in years, months and days, the total in weeks and hours, and your next birthday.',
      enter: [
        { label: 'Date of birth', value: formatDate(dob) },
        { label: 'Age on', value: 'Today' },
      ],
      result: {
        label: 'Your age',
        figure: `${age.years} yrs ${age.months} mos`,
        note: `and ${age.days} ${age.days === 1 ? 'day' : 'days'}`,
      },
      visual: ex['age'].visual,
      working: ageSteps,
    },
    {
      info: find('pregnancy'),
      color: 'var(--pink)',
      question: 'When is the baby due?',
      hint: 'Enter the first day of your last period, or the date of conception. You get the due date, how far along you are and the dates of each trimester.',
      enter: [
        { label: 'First day of last period', value: formatDate(lmp) },
        { label: 'Cycle length', value: '28 days' },
      ],
      result: {
        label: 'Due date',
        figure: formatDate(preg.due),
        note: `${preg.weeks} weeks ${preg.days} days along today`,
      },
      visual: ex['pregnancy'].visual,
      working: pregSteps,
    },
  ];
}

export const EVERYDAY = build();

/** "BMI = weight (kg) ÷ height (m)²": the shortest of the formulas, for the diagram's worked example. */
export const BMI_FORMULA: string = (() => {
  const bmi = calculateBmi(65, 170, 'who');
  const { blocks } = buildBmiExplainer(
    {
      units: 'metric',
      standard: 'who',
      heightCm: 170,
      weightKg: 65,
      heightText: '170 cm',
      weightText: '65 kg',
    },
    bmi,
  );
  const formula = blocks.find(
    (b): b is Extract<ExplainerBlock, { type: 'formula' }> => b.type === 'formula',
  );
  return formula?.lines[0] ?? '';
})();
