import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CALCULATORS, calculatorPath } from '../../core/registry/calculators';

/**
 * "More calculators" at the foot of a calculator page: others from the same group first, then
 * the rest. Plain links to real pages, so a visitor, a search engine and an AI crawler can all
 * follow them to the rest of the site.
 */
@Component({
  selector: 'app-related-calculators',
  imports: [RouterLink],
  template: `
    @if (related().length) {
      <nav class="rel" aria-labelledby="rel-h">
        <h2 id="rel-h">More calculators</h2>
        <ul>
          @for (c of related(); track c.slug) {
            <li>
              <a class="card lift" [routerLink]="path(c)">
                <span class="rel__title">{{ c.title }}</span>
                <span class="muted">{{ c.summary }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    h2 {
      margin-bottom: var(--s-4);
      font-size: 1.375rem;
    }
    ul {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
      gap: var(--s-4);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    a {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      height: 100%;
      padding: var(--s-5);
      color: var(--ink);
      text-decoration: none;
    }
    .rel__title {
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedCalculators {
  private readonly router = inject(Router);

  protected readonly related = computed(() => {
    const here = this.router.url.split(/[?#]/)[0].split('/').pop();
    const current = CALCULATORS.find((c) => c.slug === here);
    if (!current) return [];
    const others = CALCULATORS.filter((c) => c.slug !== current.slug && c.status === 'live');
    const same = others.filter((c) => c.category === current.category);
    const rest = others.filter((c) => c.category !== current.category);
    return [...same, ...rest].slice(0, 3);
  });

  protected path = calculatorPath;
}
