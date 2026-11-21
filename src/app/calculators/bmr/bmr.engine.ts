/**
 * Basal metabolic rate: the calories the body burns at complete rest in a day.
 * Mifflin-St Jeor, the equation most often recommended for adults:
 *   BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5 (men) or − 161 (women)
 * Multiplying by an activity factor gives the calories needed to hold the same weight.
 */

export type Sex = 'female' | 'male';

export interface Activity {
  id: string;
  label: string;
  hint: string;
  factor: number;
}

export const ACTIVITY: readonly Activity[] = [
  { id: 'sedentary', label: 'Sedentary', hint: 'Little or no exercise', factor: 1.2 },
  { id: 'light', label: 'Lightly active', hint: 'Exercise 1 to 3 days a week', factor: 1.375 },
  { id: 'moderate', label: 'Moderately active', hint: 'Exercise 3 to 5 days a week', factor: 1.55 },
  { id: 'very', label: 'Very active', hint: 'Hard exercise 6 to 7 days a week', factor: 1.725 },
  { id: 'extra', label: 'Extra active', hint: 'Hard exercise and a physical job', factor: 1.9 },
];

export const SEX_OFFSET: Record<Sex, number> = { male: 5, female: -161 };

export function calculateBmr(sex: Sex, age: number, heightCm: number, weightKg: number) {
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + SEX_OFFSET[sex]);
  return {
    bmr,
    maintenance: ACTIVITY.map((a) => ({ ...a, kcal: Math.round(bmr * a.factor) })),
  };
}
