import { isPlatformBrowser } from '@angular/common';
import {
  PLATFORM_ID,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { formatInr } from '../../core/formatting/format';

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A number that settles to its new value instead of jumping. It always starts from what is
 * on screen right now, so a fast slider drag retargets mid-flight instead of restarting
 * (interruptible, critically damped: an ease-out with no overshoot).
 */
@Component({
  selector: 'app-count',
  template: `<span class="num">{{ text() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-block;
    }
  `,
})
export class Count {
  readonly value = input.required<number>();
  readonly format = input<(n: number) => string>(formatInr);
  readonly duration = input(420);

  private readonly shown = signal(0);
  protected readonly text = computed(() => this.format()(this.shown()));

  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private frame = 0;
  private first = true;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.browser && cancelAnimationFrame(this.frame));

    effect(() => {
      const target = this.value();
      const duration = this.duration();
      // On the server (prerender) there is no animation: show the value at once
      if (!this.browser) {
        this.shown.set(target);
        return;
      }
      cancelAnimationFrame(this.frame);

      // Read without tracking: the tween writes `shown` every frame and must not restart itself.
      const from = untracked(() => this.shown());
      if (this.first || prefersReducedMotion() || from === target || duration <= 0) {
        this.first = false;
        this.shown.set(target);
        return;
      }

      // Time starts at the first frame, so the tween never depends on how two clocks line up.
      let start = -1;
      const step = (now: number) => {
        if (start < 0) start = now;
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
        this.shown.set(from + (target - from) * eased);
        if (t < 1) this.frame = requestAnimationFrame(step);
      };
      this.frame = requestAnimationFrame(step);
    });
  }
}
