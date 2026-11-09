import { type EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { Seo } from './seo.service';
import { SITE_CONFIG, type SiteConfig } from './site.config';
import site0 from './site.json';

/** Wires page titles, descriptions, canonical links and structured data into the app. */
export function provideSeo(site?: Partial<SiteConfig>): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(site ? [{ provide: SITE_CONFIG, useValue: { ...site0, ...site } }] : []),
    provideAppInitializer(() => inject(Seo).start()),
  ]);
}
