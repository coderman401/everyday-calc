import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { trackCalculation } from '../../core/analytics';
import { addDays, formatDateLong, formatWeekday, startOfDay } from '../../core/dates/dates';
import { formatPlain } from '../../core/formatting/format';
import { DateField } from '../../shared/forms/date-field';
import { NumberField } from '../../shared/forms/number-field';
import { CalcShell } from '../../shared/layout/calc-shell';
import { Explainer } from '../../shared/layout/explainer';
import { dateBetween, shiftDate } from './date.engine';
import { buildDateGapExplainer, buildDateShiftExplainer, spanText } from './date.explainer';

type Mode = 'between' | 'shift';

const TODAY = startOfDay(new Date());
const MIN_DATE = new Date(1900, 0, 1);
const MAX_DATE = new Date(2200, 11, 31);

@Component({
  selector: 'app-date-calculator',
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule, CalcShell, DateField, Explainer, NumberField],
  templateUrl: './date-calculator.html',
  styleUrl: './date-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateCalculator {
  protected readonly mode = signal<Mode>('between');
  protected readonly sign = signal<1 | -1>(1);

  protected readonly from = signal(TODAY);
  protected readonly to = signal(addDays(TODAY, 100));
  protected readonly start = signal(TODAY);
  protected readonly years = signal(0);
  protected readonly months = signal(1);
  protected readonly days = signal(15);

  protected readonly minDate = MIN_DATE;
  protected readonly maxDate = MAX_DATE;

  private readonly span = computed(() => ({ years: this.years(), months: this.months(), days: this.days() }));
  protected readonly gap = computed(() => dateBetween(this.from(), this.to()));
  protected readonly moved = computed(() => shiftDate(this.start(), this.span(), this.sign()));

  protected readonly heroText = computed(() => {
    if (this.mode() === 'shift') return formatDateLong(this.moved());
    const d = this.gap().totalDays;
    return `${formatPlain(d)} ${d === 1 ? 'day' : 'days'}`;
  });

  protected readonly noteText = computed(() =>
    this.mode() === 'shift'
      ? `${this.sign() === 1 ? 'After' : 'Before'} ${formatDateLong(this.start())}`
      : spanText(this.gap()),
  );

  protected readonly rows = computed(() => {
    if (this.mode() === 'shift') {
      return [
        { label: 'Start date', value: formatDateLong(this.start()) },
        { label: this.sign() === 1 ? 'Added' : 'Subtracted', value: spanText(this.span()) },
      ];
    }
    const g = this.gap();
    return [
      { label: 'Weeks and days', value: `${formatPlain(g.weeks)} weeks, ${g.restDays} days` },
      { label: 'Earlier date', value: `${formatWeekday(g.from)}, ${formatDateLong(g.from).split(', ')[1]}` },
      { label: 'Later date', value: `${formatWeekday(g.to)}, ${formatDateLong(g.to).split(', ')[1]}` },
    ];
  });

  protected readonly explainer = computed(() =>
    this.mode() === 'shift'
      ? buildDateShiftExplainer(this.start(), this.span(), this.sign(), this.moved())
      : buildDateGapExplainer(this.gap()),
  );

  constructor() {
    // Dates are personal: nothing the visitor entered is sent, only that the calculator was used
    trackCalculation('date', () => [this.mode(), this.sign(), this.from(), this.to(), this.start(), this.span()]);
  }

  protected setMode(next: Mode): void {
    if (next) this.mode.set(next);
  }

  protected setSign(next: 1 | -1): void {
    if (next) this.sign.set(next);
  }

  protected reset(): void {
    this.mode.set('between');
    this.sign.set(1);
    this.from.set(TODAY);
    this.to.set(addDays(TODAY, 100));
    this.start.set(TODAY);
    this.years.set(0);
    this.months.set(1);
    this.days.set(15);
  }
}
