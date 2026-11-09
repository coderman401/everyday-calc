import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { RelatedCalculators } from './related-calculators';

/**
 * The frame every calculator page shares: back link, title and lead, inputs on the left,
 * results on the right, then whatever else the page projects below.
 *
 * Slots: `<form slot="inputs">`, `<section slot="results">`, and anything else (schedule,
 * explainer) as default content. On a phone a bar keeps the headline result in view while the
 * inputs are being edited and the results are off screen.
 */
@Component({
  selector: 'app-calc-shell',
  imports: [RouterLink, MatButtonModule, MatIconModule, RelatedCalculators],
  templateUrl: './calc-shell.html',
  styleUrl: './calc-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalcShell {
  readonly title = input.required<string>();
  readonly lead = input.required<string>();
  /** The phone summary bar: a label and the headline result as text. */
  readonly barLabel = input('');
  readonly barText = input('');

  private readonly inputsEl = viewChild<ElementRef<HTMLElement>>('inputsEl');
  private readonly resultsEl = viewChild<ElementRef<HTMLElement>>('resultsEl');
  private readonly inputsInView = signal(false);
  private readonly resultsInView = signal(true);

  /** Shown only while editing: inputs on screen, results not. */
  protected readonly showBar = computed(
    () => !!this.barText() && this.inputsInView() && !this.resultsInView(),
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const results = this.resultsEl()?.nativeElement;
      const inputs = this.inputsEl()?.nativeElement;
      if (!results || typeof IntersectionObserver === 'undefined') return;

      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            (e.target === results ? this.resultsInView : this.inputsInView).set(e.isIntersecting);
          }
        },
        { threshold: 0.12 },
      );
      io.observe(results);
      if (inputs) io.observe(inputs);

      // A sticky panel taller than the viewport would hide its own bottom. Stick it by whichever
      // edge fits: its top under the header, or its bottom to the window's bottom edge.
      const place = () => {
        const top = Math.min(88, window.innerHeight - results.offsetHeight - 24);
        results.style.setProperty('--side-top', `${top}px`);
      };
      const ro = new ResizeObserver(place);
      ro.observe(results);
      window.addEventListener('resize', place);
      place();

      destroyRef.onDestroy(() => {
        io.disconnect();
        ro.disconnect();
        window.removeEventListener('resize', place);
      });
    });
  }

  protected scrollToResults(): void {
    const el = this.resultsEl()?.nativeElement;
    if (!el) return;
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  }
}
