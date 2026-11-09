/**
 * BMI = weight (kg) ÷ height (m)². Adults only.
 * Two sets of cut-offs: the WHO global ones, and the WHO Asia-Pacific ones used for South Asians,
 * who carry more body fat at the same BMI.
 */

export type Standard = 'who' | 'asia';
export type Tone = 'low' | 'ok' | 'warn' | 'high';

export interface BmiCategory {
  id: string;
  label: string;
  /** Lower bound, inclusive. */
  from: number;
  /** Upper bound, exclusive. */
  to: number;
  tone: Tone;
}

/** Scale ends, for drawing. */
export const SCALE_MIN = 10;
export const SCALE_MAX = 40;

export const CATEGORIES: Record<Standard, BmiCategory[]> = {
  who: [
    { id: 'under', label: 'Underweight', from: SCALE_MIN, to: 18.5, tone: 'low' },
    { id: 'healthy', label: 'Healthy weight', from: 18.5, to: 25, tone: 'ok' },
    { id: 'over', label: 'Overweight', from: 25, to: 30, tone: 'warn' },
    { id: 'obese', label: 'Obese', from: 30, to: SCALE_MAX, tone: 'high' },
  ],
  asia: [
    { id: 'under', label: 'Underweight', from: SCALE_MIN, to: 18.5, tone: 'low' },
    { id: 'healthy', label: 'Healthy weight', from: 18.5, to: 23, tone: 'ok' },
    { id: 'over', label: 'Overweight', from: 23, to: 25, tone: 'warn' },
    { id: 'obese', label: 'Obese', from: 25, to: SCALE_MAX, tone: 'high' },
  ],
};

export interface BmiResult {
  /** Rounded to one decimal, the number people compare. */
  bmi: number;
  category: BmiCategory;
  /** Weight range (kg) that falls in the healthy category at this height. */
  healthyKg: { min: number; max: number };
  /** Kilograms to gain to reach the healthy range (0 if not below it). */
  toGainKg: number;
  /** Kilograms to lose to reach the healthy range (0 if not above it). */
  toLoseKg: number;
}

const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.45359237;

export const cmFromFtIn = (ft: number, inch: number) => (ft * 12 + inch) * CM_PER_INCH;
export const ftInFromCm = (cm: number) => {
  const totalIn = cm / CM_PER_INCH;
  let ft = Math.floor(totalIn / 12);
  let inch = Math.round((totalIn - ft * 12) * 10) / 10;
  if (inch >= 12) {
    ft += 1;
    inch = 0;
  }
  return { ft, inch };
};
export const kgFromLb = (lb: number) => lb * KG_PER_LB;
export const lbFromKg = (kg: number) => kg / KG_PER_LB;

export function bmiOf(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function calculateBmi(weightKg: number, heightCm: number, standard: Standard): BmiResult {
  const m = heightCm / 100;
  const bmi = Math.round(bmiOf(weightKg, heightCm) * 10) / 10;
  const cats = CATEGORIES[standard];
  const category = cats.find((c) => bmi >= c.from && bmi < c.to) ?? cats[cats.length - 1];
  const healthy = cats.find((c) => c.id === 'healthy')!;

  // The healthy range runs from its lower bound to just under its upper one (24.9, or 22.9 for Asia).
  const minKg = healthy.from * m * m;
  const maxKg = (healthy.to - 0.1) * m * m;

  return {
    bmi,
    category,
    healthyKg: { min: minKg, max: maxKg },
    toGainKg: bmi < healthy.from ? Math.max(0, minKg - weightKg) : 0,
    toLoseKg: bmi >= healthy.to ? Math.max(0, weightKg - maxKg) : 0,
  };
}
