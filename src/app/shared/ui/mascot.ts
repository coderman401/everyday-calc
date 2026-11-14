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
} from '@angular/core';

export type MascotMood = 'idle' | 'wave' | 'cheer';

/**
 * Tally, the mascot: a pocket calculator with a friendly face, drawn as flat shapes in the brand palette
 * (no gradients, no shadows; the darker "lip" under the body is the same pressable edge the
 * buttons use). Decorative only, so it is hidden from assistive technology.
 *
 *  - `wave`: raises an arm and waves once on load, then rests.
 *  - `cheer`: both arms up and a hop. Set it for a moment to react to what the visitor just did.
 *  - It blinks, its antenna sways, its eyes follow the pointer, and a click makes it cheer.
 *
 * Every movement is a CSS transform; `prefers-reduced-motion` turns them all off.
 */
@Component({
  selector: 'app-mascot',
  template: `
    <svg viewBox="0 0 200 230" aria-hidden="true" focusable="false">
      <ellipse class="ground" cx="100" cy="217" rx="56" ry="7" />
      <g class="bob">
        <g class="antenna">
          <line x1="100" y1="34" x2="100" y2="14" />
          <circle cx="100" cy="11" r="7.5" />
        </g>

        <rect class="leg" x="74" y="166" width="15" height="28" rx="7.5" />
        <rect class="leg" x="111" y="166" width="15" height="28" rx="7.5" />
        <rect class="shoe" x="62" y="190" width="34" height="17" rx="8.5" />
        <rect class="shoe" x="104" y="190" width="34" height="17" rx="8.5" />

        <g class="arm arm--l">
          <line x1="42" y1="104" x2="22" y2="138" />
          <circle class="hand" cx="21" cy="141" r="9" />
        </g>
        <g class="arm arm--r">
          <line x1="158" y1="104" x2="178" y2="138" />
          <circle class="hand" cx="179" cy="141" r="9" />
        </g>

        <rect class="lip" x="38" y="40" width="124" height="138" rx="26" />
        <rect class="body" x="38" y="30" width="124" height="140" rx="26" />

        <rect class="screen" x="52" y="44" width="96" height="60" rx="20" />
        <g class="eyes">
          <g class="eye">
            <ellipse class="pupil" cx="79" cy="70" rx="9" ry="11" />
            <circle class="glint" cx="82.5" cy="65" r="3.6" />
            <circle class="glint glint--s" cx="76" cy="75" r="1.5" />
          </g>
          <g class="eye">
            <ellipse class="pupil" cx="121" cy="70" rx="9" ry="11" />
            <circle class="glint" cx="124.5" cy="65" r="3.6" />
            <circle class="glint glint--s" cx="118" cy="75" r="1.5" />
          </g>
        </g>
        <circle class="cheek" cx="62" cy="88" r="7" />
        <circle class="cheek" cx="138" cy="88" r="7" />
        <path class="mouth mouth--smile" d="M91 84 Q100 95 109 84" />
        <path class="mouth mouth--open" d="M90 82 Q100 101 110 82 Z" />

        <rect class="key key--blue" x="52" y="111" width="19.5" height="22" rx="6" />
        <rect class="key" x="77.5" y="111" width="19.5" height="22" rx="6" />
        <rect class="key" x="103" y="111" width="19.5" height="22" rx="6" />
        <rect class="key" x="52" y="139" width="19.5" height="22" rx="6" />
        <rect class="key key--pink" x="77.5" y="139" width="19.5" height="22" rx="6" />
        <rect class="key" x="103" y="139" width="19.5" height="22" rx="6" />
        <rect class="key key--sun" x="128.5" y="111" width="19.5" height="50" rx="6" />
        <rect class="sign" x="133" y="131" width="10.5" height="3.4" rx="1.7" />
        <rect class="sign" x="133" y="138" width="10.5" height="3.4" rx="1.7" />
      </g>
    </svg>
  `,
  styleUrl: './mascot.scss',
  host: {
    '[style.width.px]': 'size()',
    '[class.is-wave]': 'mood() === "wave"',
    '[class.is-cheer]': 'cheering()',
    '(click)': 'cheer()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Mascot {
  readonly size = input(160);
  readonly mood = input<MascotMood>('idle');

  private readonly clicked = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;
  protected readonly cheering = computed(() => this.clicked() || this.mood() === 'cheer');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let frame = 0;
      // The pupils drift toward the pointer, never more than a few units, easing out at distance
      const look = (e: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = host.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height * 0.3);
          const d = Math.hypot(dx, dy) || 1;
          const k = Math.min(1, d / 240);
          host.style.setProperty('--ex', ((dx / d) * k * 5).toFixed(2));
          host.style.setProperty('--ey', ((dy / d) * k * 3.5).toFixed(2));
        });
      };
      window.addEventListener('pointermove', look, { passive: true });
      destroyRef.onDestroy(() => {
        window.removeEventListener('pointermove', look);
        cancelAnimationFrame(frame);
        clearTimeout(this.timer);
      });
    });
  }

  protected cheer(): void {
    clearTimeout(this.timer);
    this.clicked.set(true);
    this.timer = setTimeout(() => this.clicked.set(false), 1100);
  }
}
