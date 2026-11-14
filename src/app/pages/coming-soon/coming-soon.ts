import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { HOME_LOAN, calculatorPath, findCalculator } from '../../core/registry/calculators';
import { Mascot } from '../../shared/ui/mascot';

/**
 * The placeholder every unbuilt calculator routes to. Reads its entry from the registry,
 * so adding a calculator to the list is enough to give it a page.
 */
@Component({
  selector: 'app-coming-soon',
  imports: [RouterLink, MatButtonModule, MatIconModule, Mascot],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoon {
  /** Route param, bound by withComponentInputBinding(). */
  readonly slug = input<string>();

  protected readonly info = computed(() => findCalculator(this.slug()));
  protected readonly homeLoanPath = calculatorPath(HOME_LOAN);

  constructor() {
    const title = inject(Title);
    effect(() => {
      const c = this.info();
      title.setTitle(c ? `${c.title}: coming soon` : 'Calculator not found');
    });
  }
}
