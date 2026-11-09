import type { ExplainerContent } from '../../shared/layout/explainer';
import { CATEGORIES, bmiOf, type BmiResult, type Standard } from './bmi.engine';

export interface BmiExplainerInput {
  units: 'metric' | 'imperial';
  standard: Standard;
  heightCm: number;
  weightKg: number;
  /** Height and weight as the user typed them, for the first two steps. */
  heightText: string;
  weightText: string;
}

const range = (lo: number, hi: number, last: boolean) => (last ? `${lo} and above` : `${lo} to ${(hi - 0.1).toFixed(1)}`);

export function buildBmiExplainer(i: BmiExplainerInput, result: BmiResult): ExplainerContent {
  const m = i.heightCm / 100;
  const raw = bmiOf(i.weightKg, i.heightCm);
  const standardName = i.standard === 'who' ? 'WHO global' : 'Asia-Pacific';
  const imperial = i.units === 'imperial';

  const catRow = (id: string) => {
    const w = CATEGORIES.who.find((c) => c.id === id)!;
    const a = CATEGORIES.asia.find((c) => c.id === id)!;
    const last = id === 'obese';
    const first = id === 'under';
    const fmt = (c: typeof w) => (first ? `below ${c.to}` : range(c.from, c.to, last));
    return [w.label, fmt(w), fmt(a)];
  };

  return {
    blocks: [
      {
        type: 'text',
        heading: 'What BMI is',
        body: [
          'Body mass index (BMI) compares your weight with your height. It is a quick way to see whether your weight is likely to be a health risk, and it is used the same way for men and women over 18.',
          'It is a screening number, not a diagnosis. It cannot see how much of your weight is muscle or fat, or where the fat sits.',
        ],
      },
      {
        type: 'formula',
        heading: 'The BMI formula',
        lines: [
          'BMI = weight (kg) ÷ height (m)²',
          ...(imperial ? ['BMI = 703 × weight (lb) ÷ height (in)²'] : []),
          'Healthy weight = BMI × height (m)²',
        ],
        where: [
          { sym: 'kg', meaning: 'your weight in kilograms' },
          { sym: 'm', meaning: 'your height in metres: centimetres ÷ 100' },
          { sym: 'BMI', meaning: 'for the last line, use 18.5 and the top of the healthy range to get the two ends of the weight range' },
        ],
      },
      {
        type: 'steps',
        heading: 'Your numbers, step by step',
        steps: [
          { label: 'Height', value: i.heightText },
          { label: 'Height in metres', value: `${m.toFixed(3)} m` },
          { label: 'Height squared (m × m)', value: (m * m).toFixed(4) },
          { label: 'Weight', value: i.weightText },
          { label: 'BMI = weight in kg ÷ height squared', value: `${i.weightKg.toFixed(1)} ÷ ${(m * m).toFixed(4)} = ${raw.toFixed(2)}` },
          { label: `Category (${standardName} cut-offs)`, value: `${result.bmi.toFixed(1)} is ${result.category.label.toLowerCase()}` },
        ],
      },
      {
        type: 'table',
        heading: 'The categories',
        intro:
          'The WHO global limits are used worldwide. The Asia-Pacific limits are lower for overweight and obese and are the ones commonly used for South Asians. Pick the set you want above the results.',
        columns: ['Category', 'WHO global', 'Asia-Pacific'],
        rows: [catRow('under'), catRow('healthy'), catRow('over'), catRow('obese')],
      },
      {
        type: 'list',
        heading: 'What BMI cannot tell you',
        items: [
          'Muscle and fat. A muscular person can read as overweight at a healthy body-fat level.',
          'Where the fat is carried. Fat around the waist carries more risk than fat on the hips, so waist size is a useful second check.',
          'Age. Older adults lose muscle, so a “healthy” BMI can hide low muscle mass.',
          'It is not for children and teenagers, who are judged on growth charts, or for pregnancy.',
        ],
      },
      {
        type: 'faq',
        heading: 'Common questions',
        items: [
          {
            q: 'Why are there different limits for South Asians?',
            a: 'At the same BMI, people of South and East Asian origin tend to carry more body fat and have a higher risk of type 2 diabetes and heart disease than the global limits assume. The lower Asia-Pacific limits flag that risk sooner.',
          },
          {
            q: 'Is a BMI in the healthy range always healthy?',
            a: 'No. It is one measure. Diet, activity, waist size, blood pressure and blood sugar matter too, and a doctor can read them together.',
          },
          {
            q: 'How does the calculator get my healthy weight range?',
            a: 'It runs the formula backwards: the lowest weight that gives a BMI of 18.5 at your height, and the highest that stays in the healthy category.',
          },
        ],
      },
    ],
  };
}
