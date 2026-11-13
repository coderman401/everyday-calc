import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { CALCULATORS, CATEGORIES, calculatorPath, type CalculatorInfo } from './core/registry/calculators';
import { Theme } from './core/theme/theme';
import { Logo } from './shared/ui/logo';
import { Mascot } from './shared/ui/mascot';
import { Consent } from './core/analytics';
import { CookieBanner } from './shared/layout/cookie-banner/cookie-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, Logo, Mascot, CookieBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  protected readonly theme = inject(Theme);
  protected readonly consent = inject(Consent);

  protected readonly year = new Date().getFullYear();
  protected readonly groups = CATEGORIES.map((category) => ({
    category,
    items: CALCULATORS.filter((c) => c.category === category.id),
  }));

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** The category of the calculator on screen, for the bar under its header link. */
  protected readonly activeCategory = computed(
    () => CALCULATORS.find((c) => this.url().split('?')[0].endsWith(`/${c.slug}`))?.category ?? null,
  );

  constructor() {
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-rounded');
  }

  protected path(c: CalculatorInfo): string {
    return calculatorPath(c);
  }
}
