import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface ScaleSegment {
  id: string;
  label: string;
  /** Range text for the legend: "18.5 to 24.9" */
  range: string;
  from: number;
  to: number;
  color: string;
}

/**
 * A bar split into labelled zones with a marker at the value: BMI categories, pregnancy
 * trimesters. The legend under it names each zone and its range, so colour is never the only cue.
 */
@Component({
  selector: 'app-scale',
  templateUrl: './scale.html',
  styleUrl: './scale.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Scale {
  readonly segments = input.required<ScaleSegment[]>();
  readonly value = input.required<number>();
  /** Text in the marker's bubble. */
  readonly markerText = input.required<string>();
  /** Read to screen readers in place of the picture. */
  readonly summary = input.required<string>();
  readonly activeId = input<string | null>(null);

  protected readonly min = computed(() => this.segments()[0]?.from ?? 0);
  protected readonly max = computed(() => this.segments().at(-1)?.to ?? 1);

  protected readonly span = computed(() => this.max() - this.min());

  protected readonly widths = computed(() =>
    this.segments().map((s) => ((s.to - s.from) / this.span()) * 100),
  );

  protected readonly ticks = computed(() =>
    this.segments()
      .slice(1)
      .map((s) => ({ at: ((s.from - this.min()) / this.span()) * 100, text: String(s.from) })),
  );

  protected readonly markerAt = computed(() => {
    const p = ((this.value() - this.min()) / this.span()) * 100;
    return Math.max(0, Math.min(100, p));
  });
}
