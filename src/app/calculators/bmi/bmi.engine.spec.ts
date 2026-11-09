import { calculateBmi, bmiOf, cmFromFtIn, ftInFromCm, kgFromLb, lbFromKg } from './bmi.engine';

describe('BMI engine', () => {
  it('weight ÷ height²', () => {
    expect(bmiOf(70, 175)).toBeCloseTo(22.857, 3);
    expect(calculateBmi(70, 175, 'who').bmi).toBe(22.9);
  });

  it('classifies by the WHO global cut-offs', () => {
    const id = (kg: number) => calculateBmi(kg, 170, 'who').category.id;
    expect(id(50)).toBe('under'); // 17.3
    expect(id(60)).toBe('healthy'); // 20.8
    expect(id(75)).toBe('over'); // 26.0
    expect(id(95)).toBe('obese'); // 32.9
  });

  it('classifies by the Asia-Pacific cut-offs', () => {
    // 70 kg at 170 cm is BMI 24.2: healthy by WHO, overweight in Asia-Pacific
    expect(calculateBmi(70, 170, 'who').category.id).toBe('healthy');
    expect(calculateBmi(70, 170, 'asia').category.id).toBe('over');
    expect(calculateBmi(75, 170, 'asia').category.id).toBe('obese'); // 26.0
  });

  it('sits on the boundaries the right way', () => {
    // BMI exactly 25.0 is overweight, 24.9 is still healthy
    expect(calculateBmi(25 * 1.7 * 1.7, 170, 'who').category.id).toBe('over');
    expect(calculateBmi(24.9 * 1.7 * 1.7, 170, 'who').category.id).toBe('healthy');
  });

  it('gives the healthy weight range and the gap to it', () => {
    const r = calculateBmi(80, 170, 'who');
    expect(r.healthyKg.min).toBeCloseTo(18.5 * 1.7 * 1.7, 6);
    expect(r.healthyKg.max).toBeCloseTo(24.9 * 1.7 * 1.7, 6);
    expect(r.toLoseKg).toBeCloseTo(80 - 24.9 * 1.7 * 1.7, 6);
    expect(r.toGainKg).toBe(0);

    const low = calculateBmi(48, 170, 'who');
    expect(low.toGainKg).toBeCloseTo(18.5 * 1.7 * 1.7 - 48, 6);
    expect(low.toLoseKg).toBe(0);

    const ok = calculateBmi(65, 170, 'who');
    expect(ok.toGainKg + ok.toLoseKg).toBe(0);
  });

  it('converts units both ways', () => {
    expect(cmFromFtIn(5, 9)).toBeCloseTo(175.26, 2);
    expect(ftInFromCm(175.26)).toEqual({ ft: 5, inch: 9 });
    expect(ftInFromCm(182.88)).toEqual({ ft: 6, inch: 0 });
    expect(kgFromLb(165)).toBeCloseTo(74.84, 2);
    expect(lbFromKg(kgFromLb(165))).toBeCloseTo(165, 6);
  });
});
