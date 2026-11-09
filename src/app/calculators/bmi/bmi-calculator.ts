import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { trackCalculation } from '../../core/analytics';
import { CalcShell } from '../../shared/layout/calc-shell';
import { Count } from '../../shared/ui/count';
import { Explainer } from '../../shared/layout/explainer';
import { NumberField } from '../../shared/forms/number-field';
import { Scale, type ScaleSegment } from '../../shared/charts/scale';
import {
  CATEGORIES,
  SCALE_MAX,
  SCALE_MIN,
  calculateBmi,
  cmFromFtIn,
  ftInFromCm,
  kgFromLb,
  lbFromKg,
  type Standard,
} from './bmi.engine';
import { buildBmiExplainer } from './bmi.explainer';

type Units = 'metric' | 'imperial';

const DEFAULTS = { cm: 170, kg: 65 };

const fmtRange = (c: { from: number; to: number; id: string }, first: boolean, last: boolean) =>
  first ? `below ${c.to}` : last ? `${c.from} and above` : `${c.from} to ${(c.to - 0.1).toFixed(1)}`;

@Component({
  selector: 'app-bmi-calculator',
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule, CalcShell, Count, Explainer, NumberField, Scale],
  templateUrl: './bmi-calculator.html',
  styleUrl: './bmi-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BmiCalculator {
  protected readonly units = signal<Units>('metric');
  protected readonly standard = signal<Standard>('asia');

  // Both unit systems keep their own fields; the active one feeds the maths.
  protected readonly cm = signal(DEFAULTS.cm);
  protected readonly kg = signal(DEFAULTS.kg);
  protected readonly ft = signal(ftInFromCm(DEFAULTS.cm).ft);
  protected readonly inch = signal(ftInFromCm(DEFAULTS.cm).inch);
  protected readonly lb = signal(Math.round(lbFromKg(DEFAULTS.kg)));

  protected readonly heightCm = computed(() =>
    this.units() === 'metric' ? this.cm() : cmFromFtIn(this.ft(), this.inch()),
  );
  protected readonly weightKg = computed(() => (this.units() === 'metric' ? this.kg() : kgFromLb(this.lb())));

  protected readonly result = computed(() => calculateBmi(this.weightKg(), this.heightCm(), this.standard()));

  protected readonly segments = computed<ScaleSegment[]>(() => {
    const cats = CATEGORIES[this.standard()];
    return cats.map((c, i) => ({
      id: c.id,
      label: c.label,
      range: fmtRange(c, i === 0, i === cats.length - 1),
      from: c.from,
      to: c.to,
      color: `var(--c-${c.tone})`,
    }));
  });

  protected readonly scaleSummary = computed(() => {
    const r = this.result();
    return `BMI ${r.bmi.toFixed(1)}, ${r.category.label.toLowerCase()}. Scale from ${SCALE_MIN} to ${SCALE_MAX}.`;
  });

  protected readonly weightUnit = computed(() => (this.units() === 'metric' ? 'kg' : 'lb'));
  protected readonly toWeight = (kg: number) => (this.units() === 'metric' ? kg : lbFromKg(kg));

  protected readonly healthyText = computed(() => {
    const h = this.result().healthyKg;
    const f = (n: number) => this.toWeight(n).toFixed(1);
    return `${f(h.min)} to ${f(h.max)}\u00a0${this.weightUnit()}`;
  });

  protected readonly gapText = computed(() => {
    const r = this.result();
    const f = (n: number) => `${this.toWeight(n).toFixed(1)}\u00a0${this.weightUnit()}`;
    if (r.toLoseKg > 0) return `Lose ${f(r.toLoseKg)}`;
    if (r.toGainKg > 0) return `Gain ${f(r.toGainKg)}`;
    return 'In range';
  });

  protected readonly barText = computed(() => `${this.result().bmi.toFixed(1)} · ${this.result().category.label}`);
  protected readonly oneDecimal = (n: number) => n.toFixed(1);

  protected readonly explainer = computed(() => {
    const imperial = this.units() === 'imperial';
    return buildBmiExplainer(
      {
        units: this.units(),
        standard: this.standard(),
        heightCm: this.heightCm(),
        weightKg: this.weightKg(),
        heightText: imperial ? `${this.ft()} ft ${this.inch()} in = ${this.heightCm().toFixed(1)} cm` : `${this.cm()} cm`,
        weightText: imperial ? `${this.lb()} lb = ${this.weightKg().toFixed(1)} kg` : `${this.kg()} kg`,
      },
      this.result(),
    );
  });

  constructor() {
    // Health data: watching the inputs only to know a calculation happened; just the unit and cut-off set are sent
    trackCalculation(
      'bmi',
      () => this.result(),
      () => ({ units: this.units(), standard: this.standard() }),
    );
  }

  protected setUnits(next: Units): void {
    if (!next || next === this.units()) return;
    if (next === 'imperial') {
      const { ft, inch } = ftInFromCm(this.cm());
      this.ft.set(ft);
      this.inch.set(inch);
      this.lb.set(Math.round(lbFromKg(this.kg())));
    } else {
      this.cm.set(Math.min(230, Math.max(100, Math.round(this.heightCm()))));
      this.kg.set(Math.min(250, Math.max(20, Math.round(this.weightKg() * 2) / 2)));
    }
    this.units.set(next);
  }

  protected setStandard(next: Standard): void {
    if (next) this.standard.set(next);
  }

  protected reset(): void {
    this.units.set('metric');
    this.standard.set('asia');
    this.cm.set(DEFAULTS.cm);
    this.kg.set(DEFAULTS.kg);
    const { ft, inch } = ftInFromCm(DEFAULTS.cm);
    this.ft.set(ft);
    this.inch.set(inch);
    this.lb.set(Math.round(lbFromKg(DEFAULTS.kg)));
  }
}
