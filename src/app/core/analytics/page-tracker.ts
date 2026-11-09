import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Analytics } from './analytics.service';

/** Reports a page view each time the router finishes a navigation (the app is a single page). */
@Injectable({ providedIn: 'root' })
export class PageTracker {
  private readonly router = inject(Router);
  private readonly analytics = inject(Analytics);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private started = false;

  start(): void {
    if (this.started || !this.browser) return;
    this.started = true;
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      // The title strategy sets document.title in the same navigation; read it a tick later
      setTimeout(() => this.analytics.pageView(e.urlAfterRedirects.split('?')[0], document.title));
    });
  }
}
