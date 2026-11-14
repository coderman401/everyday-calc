import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { formatCompactInr, formatInr, formatWords } from '../../core/formatting/format';
import { amountBand, trackCalculation } from '../../core/analytics';
import { StackedBars, type BarRow, type BarSeries } from '../../shared/charts/stacked-bars';
import { CalcShell } from '../../shared/layout/calc-shell';
import { Explainer } from '../../shared/layout/explainer';
import { NumberField } from '../../shared/forms/number-field';
import { TenureField, type TenureUnit } from '../../shared/forms/tenure-field';
import { Option } from '../../shared/forms/option';
import type { LoanConfig } from './loan.config';
import { buildLoanExplainer } from './loan.explainer';
import { calculateLoan, type LoanInput, type LoanResult } from './loan.engine';
import { LoanResults } from './loan-results';
import { LoanSchedule } from './loan-schedule';

/** A number from the address bar, kept inside the allowed range; the default when it is missing or not a number. */
function fromParam(raw: string | undefined, min: number, max: number, fallback: number): number {
  const n = raw === undefined || raw === '' ? NaN : Number(raw);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/**
 * One page for every EMI calculator. The route supplies a LoanConfig (ranges, defaults and the
 * wording that differs) as route data; the maths, the options and the layout are the same.
 */
@Component({
  selector: 'app-loan-calculator',
  imports: [
    MatButtonModule,
    MatIconModule,
    CalcShell,
    Explainer,
    NumberField,
    TenureField,
    Option,
    LoanResults,
    LoanSchedule,
    StackedBars,
  ],
  templateUrl: './loan-calculator.html',
  styleUrl: './loan-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanCalculator {
  readonly config = input.required<LoanConfig>();

  /** Optional starting values from the address (?amount=5000000&rate=8.5&years=20), as the home page's sample sends. */
  readonly amountParam = input<string | undefined>(undefined, { alias: 'amount' });
  readonly rateParam = input<string | undefined>(undefined, { alias: 'rate' });
  readonly yearsParam = input<string | undefined>(undefined, { alias: 'years' });

  // --- Inputs (linked, so they start from the config's defaults) ---------------------
  protected readonly amount = linkedSignal(() => {
    const a = this.config().amount;
    return fromParam(this.amountParam(), a.min, a.max, a.default);
  });
  protected readonly rate = linkedSignal(() => {
    const r = this.config().rate;
    return fromParam(this.rateParam(), r.min, r.max, r.default);
  });
  protected readonly tenure = linkedSignal(() =>
    Math.round(fromParam(this.yearsParam(), 1, this.config().maxYears, this.config().defaultYears)),
  );
  protected readonly unit = signal<TenureUnit>('years');

  protected readonly prepayOn = signal(false);
  protected readonly prepayAmount = linkedSignal(() => this.defaultPrepay());
  protected readonly prepayMonth = signal(12);

  protected readonly extraOn = signal(false);
  protected readonly extraPerYear = signal(1);

  protected readonly stepOn = signal(false);
  protected readonly stepPercent = signal(5);

  // --- Derived ---------------------------------------------------------------------------
  protected readonly months = computed(() =>
    this.unit() === 'years' ? this.tenure() * 12 : this.tenure(),
  );

  protected readonly amountMinLabel = computed(() => formatWords(this.config().amount.min));
  protected readonly amountMaxLabel = computed(() => formatWords(this.config().amount.max));
  protected readonly rateMinLabel = computed(() => `${this.config().rate.min}%`);
  protected readonly rateMaxLabel = computed(() => `${this.config().rate.max}%`);

  protected readonly amountWords = computed(() => formatWords(this.amount()));

  protected readonly prepayMonthHint = computed(() => {
    const m = this.prepayMonth();
    if (m > this.months()) return 'After the loan ends, so it has no effect';
    return `Year ${Math.ceil(m / 12)}, month ${((m - 1) % 12) + 1}`;
  });

  private readonly input = computed<LoanInput>(() => ({
    principal: this.amount(),
    annualRate: this.rate(),
    months: this.months(),
    prepayment: this.prepayOn() ? { amount: this.prepayAmount(), month: this.prepayMonth() } : null,
    extraEmis: this.extraOn() ? { perYear: this.extraPerYear() } : null,
    stepUp: this.stepOn() ? { percent: this.stepPercent() } : null,
  }));

  protected readonly result = computed<LoanResult>(() => calculateLoan(this.input()));
  protected readonly stepUpPercent = computed(() => (this.stepOn() ? this.stepPercent() : 0));
  protected readonly emiText = computed(() => formatInr(this.result().emi));

  // --- The year-by-year chart: principal below, interest on top, in the colours of the donut ---
  protected readonly barSeries: BarSeries[] = [
    { id: 'principal', label: 'Principal', color: 'var(--c-principal)' },
    { id: 'interest', label: 'Interest', color: 'var(--c-interest)' },
  ];
  /** Extra payments and a prepayment go straight to principal, so they stack with it. */
  protected readonly barRows = computed<BarRow[]>(() =>
    this.result().years.map((y) => ({
      label: String(y.year),
      values: [y.principal + y.extra, y.interest],
    })),
  );
  protected readonly barLead = computed(
    () =>
      'Each bar is one year of payments. The blue part clears what you owe; the orange part is the interest charged on it.' +
      (this.result().hasExtras ? ' Your extra payments count as principal.' : ''),
  );
  protected readonly barSummary = computed(() => {
    const ys = this.result().years;
    const first = ys[0];
    const last = ys[ys.length - 1];
    if (!first || !last) return '';
    return (
      `Principal and interest paid in each of ${ys.length} years. Interest is ${formatInr(first.interest)} in year 1 ` +
      `and ${formatInr(last.interest)} in year ${last.year}; principal goes from ${formatInr(first.principal + first.extra)} to ` +
      `${formatInr(last.principal + last.extra)}. The table below lists every year.`
    );
  });
  protected readonly compact = formatCompactInr;
  protected readonly money = formatInr;

  protected readonly explainer = computed(() =>
    buildLoanExplainer(
      this.config(),
      {
        principal: this.amount(),
        annualRate: this.rate(),
        months: this.months(),
        prepayOn: this.prepayOn(),
        extraOn: this.extraOn(),
        stepOn: this.stepOn(),
        stepPercent: this.stepPercent(),
      },
      this.result(),
    ),
  );

  constructor() {
    // Bands and switches only: never the exact amount, rate typed, or schedule
    trackCalculation(
      () => this.config().slug,
      () => this.input(),
      () => ({
        amount_band: amountBand(this.amount()),
        rate: this.rate(),
        years: Math.round((this.months() / 12) * 10) / 10,
        prepayment: this.prepayOn(),
        extra_emi: this.extraOn(),
        step_up: this.stepOn(),
      }),
    );
  }

  // --- Actions ------------------------------------------------------------------------------
  protected reset(): void {
    const c = this.config();
    this.amount.set(c.amount.default);
    this.rate.set(c.rate.default);
    this.unit.set('years');
    this.tenure.set(c.defaultYears);
    this.prepayOn.set(false);
    this.prepayAmount.set(this.defaultPrepay());
    this.prepayMonth.set(12);
    this.extraOn.set(false);
    this.extraPerYear.set(1);
    this.stepOn.set(false);
    this.stepPercent.set(5);
  }

  private defaultPrepay(): number {
    return Math.max(1000, Math.round((this.config().amount.default * 0.1) / 1000) * 1000);
  }
}
