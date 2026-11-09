import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { formatInr, formatWords } from '../../core/formatting/format';
import { amountBand, trackCalculation } from '../../core/analytics';
import { Breakup, type BreakupRow } from '../../shared/ui/breakup';
import { CalcShell } from '../../shared/layout/calc-shell';
import { DataTable } from '../../shared/layout/data-table';
import { Explainer } from '../../shared/layout/explainer';
import { NumberField } from '../../shared/forms/number-field';
import { Option } from '../../shared/forms/option';
import { calculateSip } from './sip.engine';
import { buildSipExplainer } from './sip.explainer';

const DEFAULTS = { monthly: 10_000, rate: 12, years: 10, stepPercent: 10 };

@Component({
  selector: 'app-sip-calculator',
  imports: [
    MatButtonModule,
    MatIconModule,
    Breakup,
    CalcShell,
    DataTable,
    Explainer,
    NumberField,
    Option,
  ],
  templateUrl: './sip-calculator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SipCalculator {
  protected readonly monthly = signal(DEFAULTS.monthly);
  protected readonly rate = signal(DEFAULTS.rate);
  protected readonly years = signal(DEFAULTS.years);
  protected readonly stepOn = signal(false);
  protected readonly stepPercent = signal(DEFAULTS.stepPercent);

  /** Spell the amount out only once it is a lakh or more; below that the field already says it. */
  protected readonly monthlyWords = computed(() => (this.monthly() >= 100_000 ? formatWords(this.monthly()) : ''));

  protected readonly result = computed(() =>
    calculateSip({
      monthly: this.monthly(),
      annualRate: this.rate(),
      years: this.years(),
      stepUpPercent: this.stepOn() ? this.stepPercent() : 0,
    }),
  );

  protected readonly rows = computed<BreakupRow[]>(() => [
    {
      id: 'invested',
      label: 'Invested amount',
      short: 'Invested',
      value: this.result().invested,
      color: 'var(--c-principal)',
    },
    {
      id: 'returns',
      label: 'Estimated returns',
      short: 'Returns',
      value: this.result().returns,
      color: 'var(--c-gain)',
    },
  ]);

  protected readonly note = computed(() => {
    const r = this.result();
    const times = `${r.multiple.toFixed(1)}× what you put in.`;
    return this.stepOn() ? `${times} The instalment rises to ${formatInr(r.lastInstalment)} in the last year.` : times;
  });

  protected readonly valueText = computed(() => formatInr(this.result().value));

  protected readonly tableRows = computed(() =>
    this.result().years.map((y) => [
      String(y.year),
      formatInr(y.instalment),
      formatInr(y.invested),
      formatInr(y.returns),
      formatInr(y.value),
    ]),
  );

  protected readonly explainer = computed(() =>
    buildSipExplainer(
      {
        monthly: this.monthly(),
        annualRate: this.rate(),
        years: this.years(),
        stepOn: this.stepOn(),
        stepPercent: this.stepPercent(),
      },
      this.result(),
    ),
  );

  constructor() {
    trackCalculation(
      'sip',
      () => this.result(),
      () => ({
        monthly_band: amountBand(this.monthly() * 12),
        rate: this.rate(),
        years: this.years(),
        step_up: this.stepOn(),
      }),
    );
  }

  protected reset(): void {
    this.monthly.set(DEFAULTS.monthly);
    this.rate.set(DEFAULTS.rate);
    this.years.set(DEFAULTS.years);
    this.stepOn.set(false);
    this.stepPercent.set(DEFAULTS.stepPercent);
  }
}
