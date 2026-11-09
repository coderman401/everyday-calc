import { type EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { ANALYTICS_CONFIG, type AnalyticsConfig } from './analytics.config';
import { Analytics } from './analytics.service';
import { PageTracker } from './page-tracker';
import { WebVitals } from './web-vitals.service';

/** Wires analytics into the app: the service, page views and web vitals. One line in app.config. */
export function provideAnalytics(config?: Partial<AnalyticsConfig>): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(config ? [{ provide: ANALYTICS_CONFIG, useValue: { measurementId: 'G-XXXXXXXXXX', debug: false, ...config } }] : []),
    provideAppInitializer(() => {
      inject(Analytics);
      inject(PageTracker).start();
      inject(WebVitals).start();
    }),
  ]);
}
