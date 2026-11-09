import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TRIMESTERS } from './pregnancy.trimesters';

/** What each trimester brings, for the baby, for you, and the checks to expect. */
@Component({
  selector: 'app-trimester-guide',
  template: `
    <section class="card tg" aria-labelledby="tg-h">
      <h2 id="tg-h">What each trimester brings</h2>
      <div class="tg__grid">
        @for (t of trimesters; track t.id) {
          <article class="tg__col" [class.is-current]="current() === t.id">
            <h3>
              {{ t.name }}
              @if (current() === t.id) {
                <span class="here">Now</span>
              }
            </h3>
            <p class="label">{{ t.weeks }}</p>
            <p>{{ t.summary }}</p>

            <h4>Your baby</h4>
            <ul>
              @for (b of t.baby; track b) {
                <li>{{ b }}</li>
              }
            </ul>
            <h4>You</h4>
            <ul>
              @for (b of t.you; track b) {
                <li>{{ b }}</li>
              }
            </ul>
            <h4>Checks to expect</h4>
            <ul>
              @for (b of t.checks; track b) {
                <li>{{ b }}</li>
              }
            </ul>
          </article>
        }
      </div>
      <p class="note">General guidance only. Follow the plan your own doctor or midwife gives you.</p>
    </section>
  `,
  styleUrl: './trimester-guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrimesterGuide {
  readonly current = input<number | null>(null);
  protected readonly trimesters = TRIMESTERS;
}
