import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * The wires between a column of boxes and the box they feed, or that feeds them: one trunk with a
 * branch to the middle of each of `rows` boxes (the rows here and in the column beside it share
 * their height and gap, `--g`, which the diagram sets). `flow="in"` gathers branches into the
 * trunk and sends one wire on, `flow="out"` takes one wire in and fans out, with arrowheads on the
 * ends. A short label rides the single wire. Only drawn when the diagram is a row.
 */
@Component({
  selector: 'app-engine-fan',
  host: { '[attr.data-flow]': 'flow()', '[style.--rows]': 'rows()' },
  template: `
    @for (r of range(); track r) {
      <i></i>
    }
    <b></b>
    @if (label()) {
      <span class="t">{{ label() }}</span>
    }
  `,
  styles: `
    :host {
      display: none;
    }
    @keyframes draw {
      from {
        transform: scaleX(0);
      }
    }
    @media (min-width: 900px) {
      :host {
        position: relative;
        display: grid;
        grid-template-rows: repeat(var(--rows), minmax(0, 1fr));
        row-gap: var(--g);
        width: 120px;
      }
      /* The trunk, and the single wire between it and the box on the other side */
      :host::before,
      :host::after,
      i::before {
        content: '';
        position: absolute;
        height: var(--wire);
        background: var(--heading);
      }
      :host::before {
        left: 50%;
        width: var(--wire);
        height: auto;
        top: calc((100% - (var(--rows) - 1) * var(--g)) / (2 * var(--rows)));
        bottom: calc((100% - (var(--rows) - 1) * var(--g)) / (2 * var(--rows)));
        translate: -1px 0;
      }
      :host::after {
        top: 50%;
        translate: 0 -1px;
      }
      i {
        position: relative;
      }
      i::before {
        top: 50%;
        translate: 0 -1px;
      }
      b,
      i::after {
        position: absolute;
        top: 50%;
        right: 0;
        translate: 0 -50%;
        border: 6px solid transparent;
        border-left: 8px solid var(--heading);
        border-right: 0;
      }
      i::after {
        content: '';
      }
      :host([data-flow='out']) {
        &::after {
          left: 0;
          width: 50%;
        }
        i::before {
          left: 50%;
          right: 0;
        }
        b {
          display: none;
        }
      }
      :host([data-flow='in']) {
        &::after {
          left: 50%;
          right: 0;
        }
        i::before {
          left: 0;
          right: 50%;
        }
        i::after {
          display: none;
        }
      }
      .t {
        position: absolute;
        top: calc(50% - 2.6em);
        width: 50%;
        padding-inline: 2px;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1.25;
        text-align: center;
        color: var(--muted);
      }
      :host([data-flow='out']) .t {
        left: 0;
      }
      :host([data-flow='in']) .t {
        right: 0;
      }
      @media (prefers-reduced-motion: no-preference) {
        @supports (animation-timeline: view()) {
          :host {
            transform-origin: left;
            animation: draw backwards var(--ease-out);
            animation-timeline: --eng;
          }
          :host([data-flow='in']) {
            animation-range: entry 38% entry 54%;
          }
          :host([data-flow='out']) {
            animation-range: entry 62% entry 78%;
          }
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineFan {
  readonly rows = input(3);
  readonly flow = input<'in' | 'out'>('out');
  readonly label = input('');
  protected readonly range = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
}
