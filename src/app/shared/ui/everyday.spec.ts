import { calculateBmi } from '../../calculators/bmi/bmi.engine';
import { calculateSip } from '../../calculators/sip/sip.engine';
import { formatInr } from '../../core/formatting/format';
import { CALCULATORS } from '../../core/registry/calculators';
import { BMI_FORMULA, EVERYDAY } from './everyday';

describe('EVERYDAY', () => {
  it('asks five questions, each of a different calculator that exists', () => {
    expect(EVERYDAY.map((e) => e.info.slug)).toEqual([
      'home-loan-emi',
      'sip',
      'bmi',
      'age',
      'pregnancy',
    ]);
    for (const e of EVERYDAY) {
      expect(CALCULATORS.some((c) => c.slug === e.info.slug && c.status === 'live')).toBe(true);
      expect(e.question.endsWith('?')).toBe(true);
    }
  });

  it('gives every question something to enter, an answer and three lines of working', () => {
    for (const e of EVERYDAY) {
      expect(e.enter.length).toBeGreaterThanOrEqual(2);
      expect(e.result.figure.trim()).toBeTruthy();
      expect(e.working).toHaveLength(3);
      for (const w of e.working) expect(w.label && w.value).toBeTruthy();
    }
  });

  it("shows the answers the calculators' own engines give", () => {
    const by = Object.fromEntries(EVERYDAY.map((e) => [e.info.slug, e]));
    // the home loan calculator's defaults, and the hero sample on the home page
    expect(by['home-loan-emi'].result.figure).toBe('₹43,391');
    expect(by['sip'].result.figure).toBe(
      formatInr(calculateSip({ monthly: 10_000, annualRate: 12, years: 10 }).value),
    );
    expect(by['bmi'].result.figure).toBe(calculateBmi(65, 170, 'who').bmi.toFixed(1));
  });

  it("takes the working from each calculator's own explainer", () => {
    const sip = EVERYDAY.find((e) => e.info.slug === 'sip')!;
    expect(sip.working.map((w) => w.label)).toEqual([
      'Monthly return (i) = 12% ÷ 12 ÷ 100',
      'Instalments (n) = 10 yrs in months',
      'FV = P × annuity factor × (1 + i)',
    ]);
    expect(BMI_FORMULA).toBe('BMI = weight (kg) ÷ height (m)²');
  });
});
