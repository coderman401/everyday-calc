import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

/** The frame of a reading page (privacy, FAQ): back link, title, a lead line, then the content. */
@Component({
  selector: 'app-doc-page',
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="wrap doc">
      <header class="doc__head">
        <a class="back" routerLink="/"><mat-icon fontIcon="arrow_back" />All calculators</a>
        <h1 class="doc__title">{{ title() }}</h1>
        <p class="doc__lead">{{ lead() }}</p>
        @if (meta()) {
          <p class="note">{{ meta() }}</p>
        }
      </header>
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .doc {
      padding-block: var(--s-6) var(--s-9);
    }
    .doc__head {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-3);
      margin-bottom: var(--s-7);
    }
    .doc__title {
      font-size: clamp(2rem, 1.4rem + 2vw, 2.75rem);
    }
    .doc__lead {
      font-size: 1.125rem;
      color: var(--muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPage {
  readonly title = input.required<string>();
  readonly lead = input.required<string>();
  readonly meta = input('');
}
