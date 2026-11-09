import { ChangeDetectionStrategy, Component, effect, input, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { diffDays, formatDate, startOfDay } from '../../core/dates/dates';

/**
 * A day/month/year date input with a calendar. Like the number field, the bound value only
 * ever holds a date that passes min/max; a half-typed or out-of-range date shows its error and
 * the last good date keeps driving the results.
 */
@Component({
  selector: 'app-date-field',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  templateUrl: './date-field.html',
  styleUrl: './date-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateField {
  readonly label = input.required<string>();
  readonly value = model.required<Date>();
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly hint = input('Day / month / year, for example 14/03/1995');
  readonly startView = input<'month' | 'year' | 'multi-year'>('month');

  protected readonly control = new FormControl<Date | null>(null, { validators: [Validators.required] });
  protected readonly format = formatDate;

  constructor() {
    // model -> control (only when it really differs, so typing is never overwritten)
    effect(() => {
      const v = this.value();
      const cur = this.control.value;
      if (!cur || diffDays(cur, v) !== 0) this.control.setValue(v, { emitEvent: false });
    });
    // control -> model (only valid dates)
    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((v) => {
      if (v && this.control.valid) this.value.set(startOfDay(v));
    });
  }
}
