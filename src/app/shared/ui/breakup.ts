import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { formatInr, formatPercent } from '../../core/formatting/format';
import { Count } from './count';
import { Donut, type Slice } from '../charts/donut-chart';

export interface BreakupRow {
  id: string;
  /** Row label: "Principal amount" */
  label: string;
  /** Short name used inside the donut on hover: "Principal" */
  short: string;
  value: number;
  /** A CSS colour, normally a token such as `var(--c-principal)`. */
  color: string;
}

let nextId = 0;

/**
 * The results panel for money calculators: one headline figure, a donut of the parts, and the
 * parts as rows that double as the chart's legend. The total is the sum of the rows, and the
 * donut's centre shows the last row's share (the interest, or the returns) until a slice is hovered.
 * Anything projected sits at the foot of the card.
 */
@Component({
  selector: 'app-breakup',
  imports: [Count, Donut],
  templateUrl: './breakup.html',
  styleUrl: './breakup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breakup {
  readonly heroLabel = input.required<string>();
  readonly heroValue = input.required<number>();
  readonly heroFormat = input<(n: number) => string>(formatInr);
  readonly heroNote = input('');
  readonly chartHeading = input('Break-up of total payment');
  readonly rows = input.required<BreakupRow[]>();
  readonly totalLabel = input.required<string>();
  readonly totalHint = input('');
  /** Names the centre figure: "Interest share", "Returns share". */
  readonly shareLabel = input.required<string>();

  protected readonly labelId = `bk-label-${nextId++}`;
  protected readonly active = signal<string | null>(null);

  protected readonly total = computed(() => this.rows().reduce((s, r) => s + r.value, 0));

  protected readonly slices = computed<Slice[]>(() =>
    this.rows().map((r) => ({ id: r.id, label: r.short, value: r.value, color: r.color })),
  );

  protected readonly percents = computed(() =>
    this.rows().map((r) => (this.total() > 0 ? (r.value / this.total()) * 100 : 0)),
  );

  protected readonly lastShare = computed(() => this.percents().at(-1) ?? 0);

  protected readonly summary = computed(() => {
    const parts = this.rows().map(
      (r, i) => `${r.label.toLowerCase()} ${formatInr(r.value)}, ${formatPercent(this.percents()[i])}`,
    );
    return `${this.totalLabel()} ${formatInr(this.total())}: ${parts.join('; ')}.`;
  });

  protected readonly formatPercent = formatPercent;
  protected readonly formatInr = formatInr;
}
