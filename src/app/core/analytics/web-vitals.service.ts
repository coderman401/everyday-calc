import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject } from '@angular/core';
import type { Metric } from 'web-vitals';
import { Analytics } from './analytics.service';
import { Consent } from './consent.service';

/**
 * Core Web Vitals (LCP, INP, CLS) plus FCP and TTFB, measured with Google's web-vitals library
 * and sent to GA as `web_vitals` events. The library loads on its own chunk. Metrics arrive late
 * (LCP and CLS settle when the page is hidden), so they are held until the visitor has chosen:
 * accept sends them, decline drops them.
 */
@Injectable({ providedIn: 'root' })
export class WebVitals {
  private readonly analytics = inject(Analytics);
  private readonly consent = inject(Consent);
  private held: Metric[] = [];
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private started = false;

  constructor() {
    effect(() => {
      const choice = this.consent.choice();
      if (choice === 'granted') this.flush();
      else if (choice === 'denied') this.held = [];
    });
  }

  start(): void {
    if (this.started || !this.browser || !this.analytics.enabled) return;
    this.started = true;
    void import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      for (const observe of [onCLS, onFCP, onINP, onLCP, onTTFB]) observe((m) => this.report(m));
    });
  }

  private report(m: Metric): void {
    const choice = this.consent.choice();
    if (choice === 'granted') this.send(m);
    else if (choice === null && this.held.length < 30) this.held.push(m);
  }

  private flush(): void {
    const held = this.held;
    this.held = [];
    for (const m of held) this.send(m);
  }

  private send(m: Metric): void {
    // CLS is a small unitless score, so it is sent times 1000 to survive rounding
    const scale = m.name === 'CLS' ? 1000 : 1;
    this.analytics.event('web_vitals', {
      metric_name: m.name,
      metric_value: Math.round(m.value * scale),
      metric_delta: Math.round(m.delta * scale),
      metric_rating: m.rating,
      metric_id: m.id,
      navigation_type: m.navigationType,
      page_path: location.pathname,
    });
  }
}
