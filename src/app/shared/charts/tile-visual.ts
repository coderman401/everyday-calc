import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type TileVisualSpec =
  | { type: 'donut'; parts: { value: number; color: string }[] }
  | { type: 'line'; points: number[] }
  | { type: 'bar'; parts: { value: number; color: string }[]; marker?: number };

interface Arc {
  dash: string;
  offset: number;
  color: string;
}

const W = 120;
const H = 44;

/**
 * The small picture on a calculator card: a donut, a growth line or a banded bar, drawn from the
 * same numbers as the example beside it. Decorative to screen readers; the figure says it in words.
 * The line redraws itself when the card is hovered.
 */
@Component({
  selector: 'app-tile-visual',
  templateUrl: './tile-visual.html',
  styleUrl: './tile-visual.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileVisual {
  readonly spec = input.required<TileVisualSpec>();

  protected readonly type = computed(() => this.spec().type);

  protected readonly arcs = computed<Arc[]>(() => {
    const s = this.spec();
    if (s.type !== 'donut') return [];
    const total = s.parts.reduce((a, p) => a + p.value, 0) || 1;
    let at = 0;
    return s.parts
      .filter((p) => p.value > 0)
      .map((p) => {
        const len = (p.value / total) * 100;
        const arc = { dash: `${Math.max(0, len - 1.2)} ${100 - Math.max(0, len - 1.2)}`, offset: -(at + 0.6), color: p.color };
        at += len;
        return arc;
      });
  });

  protected readonly bars = computed(() => {
    const s = this.spec();
    if (s.type !== 'bar') return [];
    const total = s.parts.reduce((a, p) => a + p.value, 0) || 1;
    return s.parts.map((p) => ({ w: (p.value / total) * 100, color: p.color }));
  });

  protected readonly marker = computed(() => {
    const s = this.spec();
    return s.type === 'bar' && s.marker !== undefined ? Math.min(1, Math.max(0, s.marker)) * 100 : null;
  });

  protected readonly line = computed(() => {
    const s = this.spec();
    if (s.type !== 'line' || s.points.length < 2) return { stroke: '', area: '' };
    const max = Math.max(...s.points) || 1;
    const x = (i: number) => 3 + (i / (s.points.length - 1)) * (W - 6);
    const y = (v: number) => H - 4 - (v / max) * (H - 10);
    const pts = s.points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    return { stroke: pts, area: `${pts} L${x(s.points.length - 1).toFixed(1)} ${H} L${x(0).toFixed(1)} ${H} Z` };
  });
}
