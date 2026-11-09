import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { provideAnalytics } from './core/analytics';
import { provideSeo } from './core/seo';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Set your GA4 ID here, e.g. provideAnalytics({ measurementId: 'G-ABC123XYZ9' })
    provideAnalytics(),
    // Your public address lives in core/seo/site.json (canonical links, sitemap and llms.txt read it)
    provideSeo(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideClientHydration(),
  ],
};
