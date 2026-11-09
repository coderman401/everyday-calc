import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NumberField } from './number-field';

export type TenureUnit = 'years' | 'months';

/**
 * A tenure input: a number, a slider and a Year/Month switch. Switching converts the number
 * (20 years becomes 240 months and back) so the loan or deposit stays the same. Used by every
 * calculator that takes a term in years or months.
 */
@Component({
  selector: 'app-tenure-field',
  imports: [MatButtonToggleModule, NumberField],
  template: `
    <app-number-field
      [label]="label()"
      [suffix]="range().suffix"
      [(value)]="value"
      [min]="range().min"
      [max]="range().max"
      [minLabel]="range().minLabel"
      [maxLabel]="range().maxLabel"
    >
      <mat-button-toggle-group
        class="unit"
        hideSingleSelectionIndicator
        aria-label="Tenure unit"
        [value]="unit()"
        (change)="setUnit($event.value)"
      >
        <mat-button-toggle value="years">Year</mat-button-toggle>
        <mat-button-toggle value="months">Month</mat-button-toggle>
      </mat-button-toggle-group>
    </app-number-field>
  `,
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenureField {
  readonly label = input('Tenure');
  /** The number as shown, in whichever unit is chosen. */
  readonly value = model.required<number>();
  readonly unit = model<TenureUnit>('years');
  /** The longest term offered, in years; months allow 12 times this. */
  readonly maxYears = input.required<number>();

  protected readonly range = computed(() => {
    const y = this.maxYears();
    return this.unit() === 'years'
      ? { min: 1, max: y, minLabel: '1 yr', maxLabel: `${y} yrs`, suffix: 'yrs' }
      : { min: 1, max: y * 12, minLabel: '1 mo', maxLabel: `${y * 12} mos`, suffix: 'mos' };
  });

  protected setUnit(next: TenureUnit): void {
    if (!next || next === this.unit()) return;
    const v = this.value();
    this.value.set(next === 'months' ? v * 12 : Math.max(1, Math.round(v / 12)));
    this.unit.set(next);
  }
}
