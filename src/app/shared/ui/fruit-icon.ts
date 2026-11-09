import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A full-colour fruit or vegetable on a soft tint of its own colour. It uses the system's colour
 * emoji; the three seeds no emoji covers (poppy, sesame, lentil) are small drawn shapes, kept
 * deliberately tiny inside the circle because they are tiny.
 */
@Component({
  selector: 'app-fruit',
  template: `
    @if (seed(); as s) {
      <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        @switch (s) {
          @case ('poppy') {
            <circle cx="20" cy="20" r="2.6" fill="#4a4a6a" />
            <circle cx="19.2" cy="19.2" r="0.8" fill="#ffffff" opacity="0.45" />
          }
          @case ('sesame') {
            <ellipse cx="20" cy="20" rx="4.2" ry="2.5" transform="rotate(-35 20 20)" fill="#f0dca8" stroke="#c9a86a" stroke-width="0.8" />
          }
          @default {
            <ellipse cx="20" cy="20" rx="5.6" ry="5.6" fill="#d98a4a" />
            <ellipse cx="18.4" cy="18.2" rx="1.8" ry="1.2" fill="#fff" opacity="0.35" />
          }
        }
      </svg>
    } @else {
      <span class="emoji" aria-hidden="true">{{ icon() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      flex: none;
      width: calc(var(--size, 56) * 1px);
      height: calc(var(--size, 56) * 1px);
      border-radius: 50%;
      background: color-mix(in srgb, var(--tone, #ccc) 22%, var(--card));
    }
    svg {
      width: 100%;
      height: 100%;
    }
    .emoji {
      font-size: calc(var(--size, 56) * 0.52px);
      line-height: 1;
      font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
    }
  `,
  host: { '[style.--size]': 'size()', '[style.--tone]': 'tone()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Fruit {
  readonly icon = input.required<string>();
  readonly tone = input('#cccccc');
  readonly size = input(56);

  protected readonly seed = computed(() => (this.icon().startsWith('seed:') ? this.icon().slice(5) : null));
}
