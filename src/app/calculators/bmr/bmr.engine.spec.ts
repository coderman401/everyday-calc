import { calculateBmr } from './bmr.engine';

describe('bmr engine', () => {
  it('uses Mifflin-St Jeor for men and women', () => {
    // 10×70 + 6.25×175 − 5×30 + 5 = 1648.75
    expect(calculateBmr('male', 30, 175, 70).bmr).toBe(1649);
    // 10×60 + 6.25×165 − 5×25 − 161 = 1345.25
    expect(calculateBmr('female', 25, 165, 60).bmr).toBe(1345);
  });

  it('scales to maintenance calories by activity', () => {
    const r = calculateBmr('male', 30, 175, 70);
    expect(r.maintenance.map((a) => a.kcal)).toEqual([1979, 2267, 2556, 2845, 3133]);
  });
});
