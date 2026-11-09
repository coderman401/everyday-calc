import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { formatInr } from '../../core/formatting/format';
import type { YearRow } from './loan.engine';

@Component({
  selector: 'app-loan-schedule',
  imports: [MatTableModule],
  templateUrl: './loan-schedule.html',
  styleUrl: './loan-schedule.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanSchedule {
  readonly years = input.required<YearRow[]>();

  protected readonly showExtra = computed(() => this.years().some((y) => y.extra > 0.5));

  protected readonly columns = computed(() => [
    'year',
    'principal',
    'interest',
    ...(this.showExtra() ? ['extra'] : []),
    'total',
    'closing',
  ]);

  protected readonly money = formatInr;
}
