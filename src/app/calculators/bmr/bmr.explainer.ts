import { formatPlain } from '../../core/formatting/format';
import type { ExplainerContent } from '../../shared/layout/explainer';
import { ACTIVITY, SEX_OFFSET, type Sex } from './bmr.engine';

export interface BmrExplainerInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  bmr: number;
}

export function buildBmrExplainer(i: BmrExplainerInput): ExplainerContent {
  const offset = SEX_OFFSET[i.sex];
  const signed = offset > 0 ? `+ ${offset}` : `− ${-offset}`;
  return {
    blocks: [
      {
        type: 'text',
        heading: 'What BMR is',
        body: [
          'Basal metabolic rate is the energy your body uses just to stay alive at rest: breathing, circulation and keeping warm. It is usually the largest share of the calories you burn in a day.',
          'It is an estimate from a published equation. A body-composition test or a doctor can measure it more closely.',
        ],
      },
      {
        type: 'formula',
        heading: 'The Mifflin-St Jeor equation',
        lines: ['BMR = 10 × weight + 6.25 × height − 5 × age + 5 (men)', 'BMR = 10 × weight + 6.25 × height − 5 × age − 161 (women)', 'Daily calories = BMR × activity factor'],
        where: [
          { sym: 'weight', meaning: 'in kilograms' },
          { sym: 'height', meaning: 'in centimetres' },
          { sym: 'age', meaning: 'in years' },
        ],
      },
      {
        type: 'steps',
        heading: 'Your numbers, step by step',
        steps: [
          { label: '10 × weight', value: `10 × ${i.weightKg} = ${formatPlain(10 * i.weightKg, 1)}` },
          { label: '6.25 × height', value: `6.25 × ${i.heightCm} = ${formatPlain(6.25 * i.heightCm, 1)}` },
          { label: '5 × age', value: `5 × ${i.age} = ${5 * i.age}` },
          { label: `BMR (${i.sex})`, value: `${formatPlain(10 * i.weightKg, 1)} + ${formatPlain(6.25 * i.heightCm, 1)} − ${5 * i.age} ${signed} = ${formatPlain(i.bmr)} kcal` },
        ],
      },
      {
        type: 'table',
        heading: 'Activity factors',
        intro: 'Pick the row that matches a normal week, not your best one.',
        columns: ['Activity level', 'What it means', 'Factor'],
        rows: ACTIVITY.map((a) => [a.label, a.hint, String(a.factor)]),
      },
      {
        type: 'faq',
        heading: 'Common questions',
        items: [
          {
            q: 'How many calories should I eat to lose weight?',
            a: 'Eating below the maintenance figure leads to weight loss, and above it to weight gain. Many people aim for about 300 to 500 kcal below maintenance and avoid going under their BMR without medical advice.',
          },
          {
            q: 'Why is BMR different from my daily calories?',
            a: 'BMR is the energy at complete rest. Moving, working and digesting food add to it, which is what the activity factor covers.',
          },
          {
            q: 'Is it accurate for everyone?',
            a: 'It is a good average for healthy adults. It can be off for athletes, older adults, pregnant women and people with medical conditions.',
          },
        ],
      },
    ],
  };
}
