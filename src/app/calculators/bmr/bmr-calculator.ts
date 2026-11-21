import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { trackCalculation } from '../../core/analytics';
import { formatPlain } from '../../core/formatting/format';
import { NumberField } from '../../shared/forms/number-field';
import { CalcShell } from '../../shared/layout/calc-shell';
import { Explainer } from '../../shared/layout/explainer';
import { calculateBmr, type Sex } from './bmr.engine';
import { buildBmrExplainer } from './bmr.explainer';

const DEFAULTS = { sex: 'male' as Sex, age: 30, cm: 175, kg: 70 };

@Component({
  selector: 'app-bmr-calculator',
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule, CalcShell, Explainer, NumberField],
  templateUrl: './bmr-calculator.html',
  styleUrl: './bmr-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BmrCalculator {
  protected readonly sex = signal<Sex>(DEFAULTS.sex);
  protected readonly age = signal(DEFAULTS.age);
  protected readonly cm = signal(DEFAULTS.cm);
  protected readonly kg = signal(DEFAULTS.kg);

  protected readonly result = computed(() => calculateBmr(this.sex(), this.age(), this.cm(), this.kg()));
  protected readonly bmrText = computed(() => `${formatPlain(this.result().bmr)} kcal`);
  protected readonly format = formatPlain;

  protected readonly explainer = computed(() =>
    buildBmrExplainer({ sex: this.sex(), age: this.age(), heightCm: this.cm(), weightKg: this.kg(), bmr: this.result().bmr }),
  );

  constructor() {
    // Health data: nothing the visitor entered is sent, only that the calculator was used
    trackCalculation('bmr', () => [this.sex(), this.age(), this.cm(), this.kg()]);
  }

  protected setSex(next: Sex): void {
    if (next) this.sex.set(next);
  }

  protected reset(): void {
    this.sex.set(DEFAULTS.sex);
    this.age.set(DEFAULTS.age);
    this.cm.set(DEFAULTS.cm);
    this.kg.set(DEFAULTS.kg);
  }
}
