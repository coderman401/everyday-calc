import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { formatInr, formatPercent, formatWords } from '../../core/formatting/format';
import { amountBand, trackCalculation } from '../../core/analytics';
import { Breakup, type BreakupRow } from '../../shared/ui/breakup';
import { CalcShell } from '../../shared/layout/calc-shell';
import { DataTable } from '../../shared/layout/data-table';
import { Explainer } from '../../shared/layout/explainer';
import { NumberField } from '../../shared/forms/number-field';
import { TenureField, type TenureUnit } from '../../shared/forms/tenure-field';
import { calculateFd, COMPOUNDING_OPTIONS, type Compounding } from './fd.engine';
import { buildFdExplainer } from './fd.explainer';

const DEFAULTS = { amount: 500_000, rate: 7, tenure: 5, compounding: 4 as Compounding };

@Component({
  selector: 'app-fd-calculator',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    Breakup,
    CalcShell,
    DataTable,
    Explainer,
    NumberField,
    TenureField,
  ],
  templateUrl: './fd-calculator.html',
  styleUrl: './fd-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FdCalculator {
  protected readonly amount = signal(DEFAULTS.amount);
  protected readonly rate = signal(DEFAULTS.rate);
  protected readonly tenure = signal(DEFAULTS.tenure);
  protected readonly unit = signal<TenureUnit>('years');
  protected readonly compounding = signal<Compounding>(DEFAULTS.compounding);

  protected readonly options = COMPOUNDING_OPTIONS;
  protected readonly amountWords = computed(() => formatWords(this.amount()));

  protected readonly months = computed(() => (this.unit() === 'years' ? this.tenure() * 12 : this.tenure()));

  protected readonly result = computed(() =>
    calculateFd({
      principal: this.amount(),
      annualRate: this.rate(),
      months: this.months(),
      compounding: this.compounding(),
    }),
  );

  protected readonly rows = computed<BreakupRow[]>(() => [
    {
      id: 'deposit',
      label: 'Amount deposited',
      short: 'Deposit',
      value: this.result().principal,
      color: 'var(--c-principal)',
    },
    {
      id: 'interest',
      label: 'Interest earned',
      short: 'Interest',
      value: this.result().interest,
      color: 'var(--c-gain)',
    },
  ]);

  protected readonly note = computed(
    () => `Effective yield ${formatPercent(this.result().effectiveYield, 2)} a year once compounding is counted.`,
  );

  protected readonly maturityText = computed(() => formatInr(this.result().maturity));

  protected readonly tableRows = computed(() =>
    this.result().years.map((y) => [y.label, formatInr(y.interest), formatInr(y.balance)]),
  );

  protected readonly explainer = computed(() =>
    buildFdExplainer(
      {
        principal: this.amount(),
        annualRate: this.rate(),
        months: this.months(),
        compounding: this.compounding(),
      },
      this.result(),
    ),
  );

  constructor() {
    trackCalculation(
      'fixed-deposit',
      () => this.result(),
      () => ({
        amount_band: amountBand(this.amount()),
        rate: this.rate(),
        months: this.months(),
        compounding: this.compounding(),
      }),
    );
  }

  protected reset(): void {
    this.amount.set(DEFAULTS.amount);
    this.rate.set(DEFAULTS.rate);
    this.unit.set('years');
    this.tenure.set(DEFAULTS.tenure);
    this.compounding.set(DEFAULTS.compounding);
  }
}
