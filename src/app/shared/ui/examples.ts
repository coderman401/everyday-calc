import { calculateAge } from '../../calculators/age/age.engine';
import {
  CATEGORIES as BMI_CATEGORIES,
  SCALE_MAX,
  SCALE_MIN,
  calculateBmi,
} from '../../calculators/bmi/bmi.engine';
import { phasesOf } from '../../calculators/menstrual-cycle/cycle.engine';
import { calculateFd } from '../../calculators/fixed-deposit/fd.engine';
import { calculateLoan } from '../../calculators/loan/loan.engine';
import { PREGNANCY_DAYS } from '../../calculators/pregnancy/pregnancy.engine';
import { calculateSip } from '../../calculators/sip/sip.engine';
import { startOfDay } from '../../core/dates/dates';
import { formatInr } from '../../core/formatting/format';
import type { TileVisualSpec } from '../charts/tile-visual';

/** Worked examples, one per calculator, shared by the home page's cards, walkthrough and diagram. */
const CATEGORIES_WHO = BMI_CATEGORIES.who;

export interface Example {
  figure: string;
  caption: string;
  visual: TileVisualSpec;
}

const loan = (principal: number, annualRate: number, years: number) =>
  calculateLoan({ principal, annualRate, months: years * 12 });

const loanExample = (principal: number, rate: number, years: number, caption: string): Example => {
  const r = loan(principal, rate, years);
  return {
    figure: `${formatInr(r.emi)} a month`,
    caption,
    visual: {
      type: 'donut',
      parts: [
        { value: r.principal, color: 'var(--c-principal)' },
        { value: r.totalInterest, color: 'var(--c-interest)' },
      ],
    },
  };
};

const CYCLE_COLORS: Record<string, string> = {
  period: 'var(--c-high)',
  before: 'color-mix(in srgb, var(--muted) 45%, transparent)',
  fertile: 'var(--c-gain)',
  after: 'var(--c-principal)',
};

/** One real result per calculator, worked by its own engine, so a card shows what the page does. */
export function examples(): Record<string, Example> {
  const sip = calculateSip({ monthly: 10_000, annualRate: 12, years: 10 });
  const fd = calculateFd({ principal: 500_000, annualRate: 7, months: 60, compounding: 4 });
  const bmi = calculateBmi(65, 170, 'who');
  const age = calculateAge(new Date(1995, 2, 14), startOfDay(new Date()))!;
  const phases = phasesOf(28, 5);
  const fertile = phases.find((p) => p.id === 'fertile')!;
  return {
    'home-loan-emi': loanExample(5_000_000, 8.5, 20, '₹50 lakh at 8.5% for 20 years'),
    'car-loan-emi': loanExample(800_000, 9, 5, '₹8 lakh at 9% for 5 years'),
    'personal-loan-emi': loanExample(400_000, 12, 3, '₹4 lakh at 12% for 3 years'),
    sip: {
      figure: formatInr(sip.value),
      caption: '₹10,000 a month at 12% for 10 years',
      visual: { type: 'line', points: [0, ...sip.years.map((y) => y.value)] },
    },
    'fixed-deposit': {
      figure: formatInr(fd.maturity),
      caption: '₹5 lakh at 7% for 5 years, added quarterly',
      // drawn from just under the deposit, so a gentle climb still shows as a curve
      visual: {
        type: 'line',
        points: [fd.principal, ...fd.years.map((y) => y.balance)].map(
          (v) => v - fd.principal * 0.9,
        ),
      },
    },
    bmi: {
      figure: bmi.bmi.toFixed(1),
      caption: `${bmi.category.label} at 170 cm and 65 kg`,
      visual: {
        type: 'bar',
        parts: CATEGORIES_WHO.map((c) => ({ value: c.to - c.from, color: `var(--c-${c.tone})` })),
        marker: (bmi.bmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN),
      },
    },
    age: {
      figure: `${age.years} yrs ${age.months} mos`,
      caption: 'Born 14 Mar 1995',
      visual: {
        type: 'bar',
        parts: [
          { value: Math.max(1, age.sinceLast), color: 'var(--c-principal)' },
          { value: Math.max(1, age.yearLength - age.sinceLast), color: 'var(--line)' },
        ],
      },
    },
    'menstrual-cycle': {
      figure: `Days ${fertile.fromDay} to ${fertile.toDay}`,
      caption: 'Fertile window in a 28-day cycle',
      visual: {
        type: 'donut',
        parts: phases.map((p) => ({ value: p.days, color: CYCLE_COLORS[p.id] })),
      },
    },
    pregnancy: {
      figure: `${PREGNANCY_DAYS / 7} weeks`,
      caption: 'From the last period to the due date',
      visual: {
        type: 'bar',
        parts: [
          { value: 14, color: 'color-mix(in srgb, var(--accent) 35%, var(--card))' },
          { value: 14, color: 'color-mix(in srgb, var(--accent) 65%, var(--card))' },
          { value: 12, color: 'var(--accent)' },
        ],
      },
    },
  };
}
