import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { RouterLink } from '@angular/router';
import { calculateLoan } from '../../calculators/loan/loan.engine';
import {
  CALCULATORS,
  CATEGORIES,
  HOME_LOAN,
  calculatorPath,
  type CalculatorInfo,
} from '../../core/registry/calculators';
import { formatInr, formatPercent, formatWords } from '../../core/formatting/format';
import { Count } from '../../shared/ui/count';
import { EngineDiagram } from '../../shared/ui/engine-diagram';
import { Feature } from '../../shared/ui/feature';
import { Mascot, type MascotMood } from '../../shared/ui/mascot';
import { Walkthrough } from '../../shared/ui/walkthrough';
import { Donut, type Slice } from '../../shared/charts/donut-chart';
import { TileVisual } from '../../shared/charts/tile-visual';
import { examples } from '../../shared/ui/examples';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatSliderModule,
    Count,
    EngineDiagram,
    Feature,
    Mascot,
    Walkthrough,
    Donut,
    TileVisual,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly homeLoanPath = calculatorPath(HOME_LOAN);

  /** Quick links under the hero's main button. */
  protected readonly quick = ['sip', 'bmi', 'age', 'pregnancy']
    .map((slug) => CALCULATORS.find((c) => c.slug === slug)!)
    .filter(Boolean);
  protected readonly example = examples();
  protected readonly headline = 'Calculators for loans, savings and health'.split(' ');

  // The live sample in the hero: a slider and four tenures, run by the real loan engine.
  protected readonly rate = 8.5;
  protected readonly tenures = [10, 15, 20, 30];
  protected readonly amount = signal(5_000_000);
  protected readonly years = signal(20);

  /** Tally waves hello on load, then cheers for a moment whenever the visitor changes the sample. */
  protected readonly mood = signal<MascotMood>('wave');
  private cheerTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.cheerTimer));
  }

  protected setAmount(value: number): void {
    this.amount.set(value);
    this.cheer();
  }

  protected setYears(value: number): void {
    this.years.set(value);
    this.cheer();
  }

  private cheer(): void {
    clearTimeout(this.cheerTimer);
    this.mood.set('cheer');
    this.cheerTimer = setTimeout(() => this.mood.set('idle'), 1100);
  }

  protected readonly sample = computed(() =>
    calculateLoan({ principal: this.amount(), annualRate: this.rate, months: this.years() * 12 }),
  );

  protected readonly amountWords = computed(() => formatWords(this.amount()));

  protected readonly slices = computed<Slice[]>(() => [
    {
      id: 'principal',
      label: 'Principal',
      value: this.sample().principal,
      color: 'var(--c-principal)',
    },
    {
      id: 'interest',
      label: 'Interest',
      value: this.sample().totalInterest,
      color: 'var(--c-interest)',
    },
  ]);

  protected readonly interestShare = computed(() =>
    formatPercent((this.sample().totalInterest / this.sample().totalPayment) * 100),
  );

  protected readonly summary = computed(
    () =>
      `Of ${formatInr(this.sample().totalPayment)} paid, ${formatInr(this.sample().principal)} is principal ` +
      `and ${formatInr(this.sample().totalInterest)} is interest.`,
  );

  protected readonly groups = CATEGORIES.map((category) => ({
    category,
    items: CALCULATORS.filter((c) => c.category === category.id),
  }));

  protected readonly formatInr = formatInr;

  protected path(c: CalculatorInfo): string {
    return calculatorPath(c);
  }
}
