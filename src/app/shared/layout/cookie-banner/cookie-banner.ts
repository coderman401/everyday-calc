import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Consent } from '../../../core/analytics';

/**
 * Asks before any analytics cookie exists. Accept and Decline are the same size and weight, so
 * neither is steered. It stays until the visitor picks, and the footer's "Cookie settings" reopens it.
 */
@Component({
  selector: 'app-cookie-banner',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieBanner {
  protected readonly consent = inject(Consent);
}
