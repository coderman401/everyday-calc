import { InjectionToken } from '@angular/core';
import site from './site.json';

export interface SiteConfig {
  name: string;
  /** The public address with no trailing slash. Set it in site.json; empty means canonical and social URLs are left out. */
  url: string;
  locale: string;
}

export const SITE_CONFIG = new InjectionToken<SiteConfig>('SITE_CONFIG', {
  providedIn: 'root',
  factory: () => ({ ...site }),
});
