import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The wires from the engine to the three things that read from it: one trunk and three branches
 * with arrowheads. Only drawn when the diagram is a row (wide screens); in the column layout the
 * outputs hang off a rail instead. The three rows share their height and gap with the output
 * cards beside them (`--g` comes from the diagram), so each branch meets the middle of its card.
 */
@Component({
  selector: 'app-engine-fan',
  template: '<i></i><i></i><i></i>',
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
        grid-template-rows: repeat(3, minmax(0, 1fr));
        row-gap: var(--g);
        width: 96px;
      }
      :host::before,
      :host::after {
        content: '';
        position: absolute;
        background: var(--heading);
      }
      :host::before {
        left: 50%;
        width: var(--wire);
        top: calc((100% - 2 * var(--g)) / 6);
        bottom: calc((100% - 2 * var(--g)) / 6);
        translate: -1px 0;
      }
      :host::after {
        left: 0;
        width: 50%;
        top: 50%;
        height: var(--wire);
        translate: 0 -1px;
      }
      i {
        position: relative;
      }
      i::before {
        content: '';
        position: absolute;
        left: 50%;
        right: 0;
        top: 50%;
        height: var(--wire);
        translate: 0 -1px;
        background: var(--heading);
      }
      i::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        translate: 0 -50%;
        border: 6px solid transparent;
        border-left: 8px solid var(--heading);
        border-right: 0;
      }
      @media (prefers-reduced-motion: no-preference) {
        @supports (animation-timeline: view()) {
          :host {
            transform-origin: left;
            animation: draw backwards var(--ease-out);
            animation-timeline: --eng;
            animation-range: entry 58% entry 76%;
          }
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineFan {}
