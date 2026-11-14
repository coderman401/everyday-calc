import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { formatPlain } from '../../core/formatting/format';

export interface BarSeries {
  id: string;
  label: string;
  /** Any CSS colour, normally a custom property such as `var(--c-principal)`. */
  color: string;
}

export interface BarRow {
  /** The x label: a year, a month. */
  label: string;
  /** One value per series, in series order. The first series sits at the bottom of the stack. */
  values: number[];
}

/** A round axis: a step of 1, 2, 2.5 or 5 times a power of ten, and the top it reaches. */
export function niceScale(max: number, intervals = 4): { max: number; step: number } {
  if (!(max > 0)) return { max: intervals, step: 1 };
  const raw = max / intervals;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / pow;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pow;
  return { max: Math.ceil(max / step - 1e-9) * step, step };
}

/**
 * A stacked bar chart: one bar per row, the series stacked on a shared baseline. For a split that
 * changes over time (here, how much of each year's payments is principal and how much is interest).
 *
 * Marks follow the data-viz specs: bars at most 24px thick with a 4px rounded top and a square
 * base, a 2px gap in the surface colour between stacked segments and between neighbours, hairline
 * gridlines, a legend, and no number printed on a bar. The values live in the tooltip, which opens
 * on hover, on a tap and from the keyboard (arrow keys on the chart), and in the table the page
 * keeps beside it, so nothing is reachable only by pointing.
 *
 * Bars grow in from the baseline as the chart scrolls into view where scroll timelines are
 * supported, and settle to new heights when the numbers change.
 */
@Component({
  selector: 'app-stacked-bars',
  templateUrl: './stacked-bars.html',
  styleUrl: './stacked-bars.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackedBars {
  readonly heading = input.required<string>();
  readonly lead = input('');
  readonly series = input.required<BarSeries[]>();
  readonly rows = input.required<BarRow[]>();
  /** Said before a row's label in the tooltip: "Year 7". */
  readonly rowName = input('Year');
  /** Said beside the sum in the tooltip: "paid in the year". */
  readonly totalLabel = input('in total');
  /** One sentence for assistive technology: what the chart shows. */
  readonly summary = input.required<string>();
  readonly tickFormat = input<(v: number) => string>((v) => formatPlain(v));
  readonly valueFormat = input<(v: number) => string>((v) => formatPlain(v));

  /** The row the pointer or the keyboard cursor last chose. */
  protected readonly active = signal<number | null>(null);
  /** The same, unless the rows have since got fewer and that one is gone. */
  protected readonly cur = computed(() => {
    const i = this.active();
    return i !== null && i < this.rows().length ? i : null;
  });

  private readonly totals = computed(() =>
    this.rows().map((r) => r.values.reduce((a, v) => a + v, 0)),
  );
  protected readonly scale = computed(() => niceScale(Math.max(0, ...this.totals())));

  protected readonly ticks = computed(() => {
    const { max, step } = this.scale();
    const n = Math.round(max / step);
    return Array.from({ length: n + 1 }, (_, k) => ({
      at: (k * step) / max,
      label: this.tickFormat()(k * step),
    }));
  });

  /** Label every row when there are few, else every 2nd or 5th. Major ones survive on a phone. */
  private readonly every = computed(() => {
    const n = this.rows().length;
    return n <= 10 ? 1 : n <= 20 ? 2 : 5;
  });

  protected readonly bars = computed(() => {
    const max = this.scale().max;
    const every = this.every();
    const rows = this.rows();
    return rows.map((r, i) => {
      const total = this.totals()[i];
      const n = Number.isFinite(Number(r.label)) ? Number(r.label) : i + 1;
      return {
        label: r.label,
        top: total / max,
        /** Top of the stack first, as it is drawn. */
        segments: r.values
          .map((v, k) => ({ v, color: this.series()[k].color }))
          .reverse()
          .filter((s) => s.v > 0),
        showLabel: every === 1 || n % every === 0 || i === rows.length - 1,
        major: n % 5 === 0 || i === rows.length - 1,
        /** The tooltip opens on the side with more room, level with the top of the plot. */
        side: i < rows.length / 2 ? 'right' : 'left',
      };
    });
  });

  protected readonly tip = computed(() => {
    const i = this.cur();
    const row = i === null ? undefined : this.rows()[i];
    if (!row) return null;
    const total = this.totals()[i!];
    return {
      title: `${this.rowName()} ${row.label}`,
      lines: this.series().map((s, k) => ({
        label: s.label,
        color: s.color,
        value: this.valueFormat()(row.values[k]),
      })),
      total: this.valueFormat()(total),
    };
  });

  /** The same words for a screen reader, spoken as the cursor moves. */
  protected readonly spoken = computed(() => {
    const t = this.tip();
    return t
      ? `${t.title}: ${t.lines.map((l) => `${l.value} ${l.label.toLowerCase()}`).join(', ')}.`
      : '';
  });

  protected move(by: number | 'first' | 'last'): void {
    const n = this.rows().length;
    if (!n) return;
    const at = this.cur();
    this.active.set(
      by === 'first'
        ? 0
        : by === 'last'
          ? n - 1
          : Math.max(0, Math.min(n - 1, (at ?? (by > 0 ? -1 : n)) + by)),
    );
  }

  protected onKey(e: KeyboardEvent): void {
    const to: Record<string, number | 'first' | 'last'> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      Home: 'first',
      End: 'last',
    };
    if (e.key in to) {
      e.preventDefault();
      this.move(to[e.key]);
    } else if (e.key === 'Escape') {
      this.active.set(null);
    }
  }
}
