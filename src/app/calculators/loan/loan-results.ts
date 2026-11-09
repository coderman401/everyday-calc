import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatDuration, formatInr } from '../../core/formatting/format';
import { Breakup, type BreakupRow } from '../../shared/ui/breakup';
import { Count } from '../../shared/ui/count';
import type { LoanResult } from './loan.engine';

/** The results card: EMI, the principal/interest break-up, and what the extras change. */
@Component({
  selector: 'app-loan-results',
  imports: [Breakup, Count],
  templateUrl: './loan-results.html',
  styleUrl: './loan-results.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanResults {
  readonly result = input.required<LoanResult>();
  /** Step-up percent in force, to word the EMI note. */
  readonly stepUpPercent = input(0);

  protected readonly rows = computed<BreakupRow[]>(() => [
    {
      id: 'principal',
      label: 'Principal amount',
      short: 'Principal',
      value: this.result().principal,
      color: 'var(--c-principal)',
    },
    {
      id: 'interest',
      label: 'Total interest payable',
      short: 'Interest',
      value: this.result().totalInterest,
      color: 'var(--c-interest)',
    },
  ]);

  protected readonly stepNote = computed(() => {
    const r = this.result();
    const pct = this.stepUpPercent();
    if (pct <= 0 || r.lastEmi <= r.emi) return '';
    return `First-year EMI. It rises ${pct}% every year, to ${formatInr(r.lastEmi)} in your last.`;
  });

  protected readonly formatDuration = formatDuration;
}
