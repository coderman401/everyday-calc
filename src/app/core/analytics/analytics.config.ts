import { InjectionToken } from '@angular/core';

export interface AnalyticsConfig {
  /** The GA4 measurement ID, "G-" followed by letters and digits. Leave the placeholder to switch analytics off. */
  measurementId: string;
  /** Log every event to the console instead of staying quiet. */
  debug: boolean;
}

export const PLACEHOLDER_ID = 'G-XXXXXXXXXX';

/**
 * The one place to set the GA4 measurement ID. Until a real ID is here, no script is loaded and no
 * event is sent, whatever the visitor chooses; the cookie banner still works.
 */
export const ANALYTICS_CONFIG = new InjectionToken<AnalyticsConfig>('ANALYTICS_CONFIG', {
  providedIn: 'root',
  factory: () => ({ measurementId: PLACEHOLDER_ID, debug: false }),
});

export function isConfigured(config: AnalyticsConfig): boolean {
  return config.measurementId !== PLACEHOLDER_ID && /^G-[A-Z0-9]{6,}$/.test(config.measurementId);
}
