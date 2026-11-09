import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { addDays, formatDateLong, formatWeekday, startOfDay } from '../../core/dates/dates';
import { formatPlain } from '../../core/formatting/format';
import { trackCalculation } from '../../core/analytics';
import { CalcShell } from '../../shared/layout/calc-shell';
import { DateField } from '../../shared/forms/date-field';
import { Explainer } from '../../shared/layout/explainer';
import { calculateAge } from './age.engine';
import { buildAgeExplainer } from './age.explainer';

const TODAY = startOfDay(new Date());
/** 30 years, 4 months and 11 days back, so the first view shows all three parts of an age. */
const DEFAULT_DOB = new Date(TODAY.getFullYear() - 30, TODAY.getMonth() - 4, TODAY.getDate() - 11);

@Component({
  selector: 'app-age-calculator',
  imports: [MatButtonModule, MatIconModule, CalcShell, DateField, Explainer],
  templateUrl: './age-calculator.html',
  styleUrl: './age-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeCalculator {
  protected readonly dob = signal(DEFAULT_DOB);
  protected readonly asOf = signal(TODAY);

  protected readonly minDob = new Date(1900, 0, 1);
  protected readonly maxAsOf = addDays(TODAY, 365 * 100);

  protected readonly result = computed(() => calculateAge(this.dob(), this.asOf()));

  protected readonly today = TODAY;
  protected readonly isToday = computed(() => this.asOf().getTime() === TODAY.getTime());

  protected readonly rows = computed(() => {
    const r = this.result();
    if (!r) return [];
    return [
      { label: 'Total months', value: formatPlain(r.totalMonths) },
      { label: 'Total weeks', value: formatPlain(r.totalWeeks) },
      { label: 'Total days', value: formatPlain(r.totalDays) },
      { label: 'Total hours', value: formatPlain(r.totalHours) },
    ];
  });

  protected readonly nextText = computed(() => {
    const r = this.result();
    return r ? `${formatDateLong(r.nextBirthday)}` : '';
  });

  protected readonly bornText = computed(() => formatWeekday(this.dob()));

  protected readonly heading = computed(() => {
    const r = this.result();
    if (!r) return '';
    return `${r.years} ${r.years === 1 ? 'year' : 'years'}`;
  });

  protected readonly sub = computed(() => {
    const r = this.result();
    if (!r) return '';
    const p = (n: number, one: string) => `${n} ${n === 1 ? one : one + 's'}`;
    return `${p(r.months, 'month')}, ${p(r.days, 'day')}`;
  });

  protected readonly barText = computed(() => {
    const r = this.result();
    return r ? `${r.years} yrs ${r.months} mos ${r.days} days` : '';
  });

  protected readonly explainer = computed(() => buildAgeExplainer(this.dob(), this.asOf(), this.result()));

  constructor() {
    // Dates are personal: nothing the visitor entered is sent, only that the calculator was used
    trackCalculation('age', () => [this.dob(), this.asOf()]);
  }

  protected reset(): void {
    this.dob.set(DEFAULT_DOB);
    this.asOf.set(TODAY);
  }
}
