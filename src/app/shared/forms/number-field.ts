import { ChangeDetectionStrategy, Component, computed, effect, input, model, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { formatPlain, parseNumber } from '../../core/formatting/format';

/**
 * A number input with Indian digit grouping and an optional slider.
 *
 * - Typing shows plain digits (no reformatting under the caret); blur formats them.
 * - The bound value only ever holds a number inside [min, max]. While the draft is out of
 *   range the field shows its error and the last good value keeps driving the results.
 * - The slider and the text box edit the same value, so either one is the live control.
 */
@Component({
  selector: 'app-number-field',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSliderModule],
  templateUrl: './number-field.html',
  styleUrl: './number-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberField {
  readonly label = input.required<string>();
  readonly value = model.required<number>();
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  /** Max fraction digits accepted and shown. */
  readonly decimals = input(0);
  readonly prefix = input('');
  readonly suffix = input('');
  readonly hint = input('');
  readonly slider = input(true);
  readonly minLabel = input('');
  readonly maxLabel = input('');
  readonly inputmode = input<'numeric' | 'decimal'>('numeric');

  protected readonly focused = signal(false);
  protected readonly draft = signal('');

  protected readonly text = computed(() =>
    this.focused() ? this.draft() : formatPlain(this.value(), this.decimals()),
  );

  protected readonly error = computed(() => {
    if (!this.focused()) return '';
    const n = parseNumber(this.draft());
    const { min, max, decimals } = { min: this.min(), max: this.max(), decimals: this.decimals() };
    if (n === null) return 'Enter a number';
    if (n < min || n > max) {
      return `Enter ${formatPlain(min, decimals)} to ${formatPlain(max, decimals)}`;
    }
    return '';
  });

  /**
   * mat-input only refreshes its error state when a form control sits behind it, so the text lives
   * in one. The signals above stay the source of truth: the effect below mirrors them into it.
   */
  protected readonly control = new FormControl('', {
    nonNullable: true,
    validators: [() => (this.error() ? { range: true } : null)],
  });

  protected readonly matcher: ErrorStateMatcher = { isErrorState: () => this.error() !== '' };

  constructor() {
    effect(() => {
      const t = this.text();
      this.error(); // re-validate whenever the message changes
      if (this.control.value !== t) this.control.setValue(t, { emitEvent: false });
      this.control.updateValueAndValidity({ emitEvent: false });
    });
  }

  protected readonly inputId = `nf-${Math.random().toString(36).slice(2, 8)}`;

  /** True between the focusing mousedown and its mouseup, which would otherwise drop the selection. */
  private selectOnRelease = false;

  protected onFocus(event: FocusEvent): void {
    this.draft.set(String(this.value()));
    this.focused.set(true);
    this.selectOnRelease = true;
    // Select everything so a new amount can be typed straight over the old one.
    // A timeout, not a microtask: the browser places the caret after the focus event, which would clear it.
    const el = event.target as HTMLInputElement;
    setTimeout(() => el.select(), 0);
  }

  protected onMouseUp(event: MouseEvent): void {
    if (!this.selectOnRelease) return;
    this.selectOnRelease = false;
    event.preventDefault();
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.draft.set(text);
    const n = parseNumber(text);
    if (n !== null && n >= this.min() && n <= this.max()) {
      const factor = Math.pow(10, this.decimals());
      this.value.set(Math.round(n * factor) / factor);
    }
  }

  protected onBlur(): void {
    this.selectOnRelease = false;
    this.focused.set(false);
  }

  protected onSlider(v: number): void {
    this.value.set(v);
  }
}
