import { ChangeDetectionStrategy, Component, afterNextRender, computed, input, model, signal } from '@angular/core';

export interface Slice {
  id: string;
  label: string;
  value: number;
  /** Any CSS colour, normally a custom property such as `var(--c-principal)`. */
  color: string;
}

interface Arc {
  slice: Slice;
  /** Length of the arc, in percent of the circle. */
  length: number;
  /** Start of the arc, in percent of the circle. */
  offset: number;
  percent: number;
}

/**
 * A pie with a window in the middle. `pathLength="100"` makes every stroke-dasharray a
 * plain percentage, so the geometry is a few additions. The active slice (hovered here or
 * in the legend that shares `active`) thickens; arcs settle with a CSS transition.
 */
@Component({
  selector: 'app-donut',
  templateUrl: './donut-chart.html',
  styleUrl: './donut-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Donut {
  readonly slices = input.required<Slice[]>();
  /** Accessible summary read to screen readers; the visual is decorative to them. */
  readonly summary = input.required<string>();
  readonly centreLabel = input('');
  readonly centreValue = input('');
  /** The id of the highlighted slice. Two-way so a legend can drive it. */
  readonly active = model<string | null>(null);

  private static readonly GAP = 0.9;

  /** False until the first frame has painted, so the arcs grow from nothing once instead of appearing. */
  protected readonly drawn = signal(false);

  constructor() {
    afterNextRender(() => requestAnimationFrame(() => this.drawn.set(true)));
  }

  protected readonly arcs = computed<Arc[]>(() => {
    const slices = this.slices().filter((s) => s.value > 0);
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    if (total <= 0) return [];
    const gap = slices.length > 1 ? Donut.GAP : 0;
    let offset = 0;
    return slices.map((slice) => {
      const percent = (slice.value / total) * 100;
      const arc = { slice, percent, offset, length: Math.max(0, percent - gap) };
      offset += percent;
      return arc;
    });
  });

  protected readonly focus = computed(() => {
    const id = this.active();
    return this.arcs().find((a) => a.slice.id === id) ?? null;
  });
}
