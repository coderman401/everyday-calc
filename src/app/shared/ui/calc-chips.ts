import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CALCULATORS, calculatorPath } from '../../core/registry/calculators';
import { CATEGORY_COLOR } from './everyday';
import { examples } from './examples';

/**
 * All the calculators, each with the answer it gives for its own example, as links to them. These
 * are the things that go into the engine in the diagram beside them. As the diagram scrolls into
 * view they arrive one after another; without scroll timelines they are simply there.
 */
@Component({
  selector: 'app-calc-chips',
  imports: [MatIconModule, RouterLink],
  template: `
    <ul>
      @for (c of chips; track c.slug) {
        <li [style.--i]="$index" [style.--cat]="c.color">
          <a class="card lift" [routerLink]="c.path">
            <span class="ico"><mat-icon [fontIcon]="c.icon" aria-hidden="true" /></span>
            <span class="txt">
              <span class="name">{{ c.short }}</span>
              <span class="fig num">{{ c.figure }}</span>
            </span>
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
    }
    ul {
      display: grid;
      height: 100%;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--g, var(--s-3));
      margin: 0;
      padding: 0;
      list-style: none;
    }
    a {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      height: 100%;
      padding: var(--s-2) var(--s-3);
      border-bottom-width: 3px;
      text-decoration: none;
    }
    .ico {
      flex: none;
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border: var(--edge) solid var(--cat);
      border-radius: var(--r-sm);
      background: color-mix(in srgb, var(--cat) 22%, var(--card));
      color: var(--heading);
    }
    .txt {
      display: flex;
      flex-direction: column;
      min-width: 0;
      line-height: 1.25;
    }
    .name {
      font-weight: 800;
      color: var(--heading);
    }
    .fig {
      font-size: 0.8125rem;
      color: var(--muted);
      overflow-wrap: anywhere;
    }
    @media (min-width: 900px) {
      ul {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: repeat(9, minmax(0, 1fr));
      }
    }
    @keyframes stamp {
      from {
        opacity: 0;
        transform: translateX(-24px) scale(0.92);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      @supports (animation-timeline: view()) {
        li {
          animation: stamp backwards var(--ease-out);
          animation-timeline: --eng;
          animation-range: entry calc(var(--i) * 3%) entry calc(26% + var(--i) * 3%);
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalcChips {
  private readonly ex = examples();
  protected readonly chips = CALCULATORS.filter((c) => c.status === 'live').map((c) => ({
    slug: c.slug,
    short: c.short,
    icon: c.icon,
    color: CATEGORY_COLOR[c.category],
    path: calculatorPath(c),
    figure: this.ex[c.slug].figure,
  }));
}
