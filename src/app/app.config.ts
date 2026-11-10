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
    // The GA4 measurement ID (Google Analytics > Admin > Data streams). Analytics stays off until a real one is here.
    provideAnalytics({ measurementId: 'G-5XX2M5182G' }),
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
