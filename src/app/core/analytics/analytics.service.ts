import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject } from '@angular/core';
import { ANALYTICS_CONFIG, isConfigured } from './analytics.config';
import { Consent } from './consent.service';

export type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const DENIED = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
} as const;

/**
 * Google Analytics 4, behind consent.
 *
 *  - Consent Mode v2 starts with everything denied, so Google sets no cookie before a choice.
 *  - The gtag.js script is not even requested until the visitor accepts.
 *  - Declining (or changing to decline later) turns analytics off and removes the _ga cookies.
 *  - Events sent while consent is missing are dropped, never queued: there is no backlog to leak.
 *
 * GA reads the browser, device, language and approximate location (from the IP, which it does not
 * store) on its own; this service adds page views, calculations and web vitals on top, and never
 * sends anything a visitor typed. See docs/ARCHITECTURE.md.
 */
@Injectable({ providedIn: 'root' })
export class Analytics {
  private readonly config = inject(ANALYTICS_CONFIG);
  private readonly consent = inject(Consent);

  /** Off on the server and without a real ID. */
  readonly enabled = isPlatformBrowser(inject(PLATFORM_ID)) && isConfigured(this.config);
  private loaded = false;
  /** The page being viewed, so a visitor who accepts mid-page still counts it once. */
  private lastPage: { path: string; title: string } | null = null;

  constructor() {
    if (!this.enabled) return;
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag() {
      // gtag.js reads `arguments` objects from the dataLayer, not arrays
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('consent', 'default', { ...DENIED, wait_for_update: 500 });

    effect(() => {
      const choice = this.consent.choice();
      if (choice === 'granted') this.start();
      else if (choice === 'denied') this.stop();
    });
  }

  /** A page was viewed. */
  pageView(path: string, title: string): void {
    this.lastPage = { path, title };
    this.sendPageView();
  }

  /** A custom event. Dropped unless analytics is configured, consented and running. */
  event(name: string, params: EventParams = {}): void {
    if (!this.canSend()) return;
    if (this.config.debug) console.debug('[analytics]', name, params);
    window.gtag!('event', name, params);
  }

  private canSend(): boolean {
    return this.enabled && this.consent.choice() === 'granted' && this.loaded;
  }

  private sendPageView(): void {
    if (!this.lastPage) return;
    this.event('page_view', {
      page_path: this.lastPage.path,
      page_title: this.lastPage.title,
      page_location: location.origin + this.lastPage.path,
    });
  }

  private start(): void {
    const id = this.config.measurementId;
    (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = false;
    window.gtag!('consent', 'update', { analytics_storage: 'granted' });
    if (this.loaded) return;
    this.loaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);

    window.gtag!('js', new Date());
    // Page views are sent by the router, so the automatic one is off. Ad features are off too.
    window.gtag!('config', id, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    this.sendPageView();
  }

  private stop(): void {
    const id = this.config.measurementId;
    (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true;
    window.gtag!('consent', 'update', DENIED);
    this.removeCookies();
  }

  /** Expire every _ga cookie on this host and its parent domains. */
  private removeCookies(): void {
    const names = document.cookie
      .split(';')
      .map((c) => c.split('=')[0].trim())
      .filter((n) => n === '_gid' || n === '_gat' || n.startsWith('_ga'));
    const parts = location.hostname.split('.');
    const domains = parts.map((_, i) => '.' + parts.slice(i).join('.')).concat(location.hostname);
    for (const n of names) {
      for (const d of domains) document.cookie = `${n}=; max-age=0; path=/; domain=${d}`;
      document.cookie = `${n}=; max-age=0; path=/`;
    }
  }
}
