import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ANALYTICS_CONFIG } from './analytics.config';
import { Analytics } from './analytics.service';
import { amountBand } from './buckets';
import { trackCalculation } from './calculation-tracking';
import { Consent } from './consent.service';

const ID = 'G-TEST123456';

/** What gtag has been told, as plain arrays: [command, name, params]. */
const calls = () => (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>));
const scripts = () => document.querySelectorAll('script[src*="googletagmanager.com"]');

function reset() {
  localStorage.clear();
  for (const c of document.cookie.split(';')) document.cookie = `${c.split('=')[0].trim()}=; max-age=0; path=/`;
  document.querySelectorAll('script[src*="googletagmanager.com"]').forEach((s) => s.remove());
  delete window.dataLayer;
  delete window.gtag;
}

describe('Consent', () => {
  beforeEach(reset);

  it('has no choice until the visitor makes one, and shows the banner', () => {
    const c = TestBed.inject(Consent);
    expect(c.choice()).toBeNull();
    expect(c.showBanner()).toBe(true);
  });

  it('remembers a choice in local storage and a first-party cookie', () => {
    const c = TestBed.inject(Consent);
    c.grant();
    expect(c.choice()).toBe('granted');
    expect(c.showBanner()).toBe(false);
    expect(JSON.parse(localStorage.getItem('cookie-consent')!).choice).toBe('granted');
    expect(document.cookie).toContain('calc_consent=granted');
  });

  it('reads a saved choice back, and falls back to the cookie when storage is empty', () => {
    TestBed.inject(Consent).deny();
    TestBed.resetTestingModule();
    expect(TestBed.inject(Consent).choice()).toBe('denied');

    localStorage.clear();
    TestBed.resetTestingModule();
    expect(TestBed.inject(Consent).choice()).toBe('denied');
  });

  it('asks again after about six months', () => {
    const old = new Date(Date.now() - 200 * 86_400_000).toISOString();
    localStorage.setItem('cookie-consent', JSON.stringify({ v: 1, choice: 'granted', at: old }));
    document.cookie = 'calc_consent=; max-age=0; path=/';
    expect(TestBed.inject(Consent).choice()).toBeNull();
  });
});

describe('Analytics', () => {
  beforeEach(reset);

  function setup(measurementId = ID) {
    TestBed.configureTestingModule({
      providers: [{ provide: ANALYTICS_CONFIG, useValue: { measurementId, debug: false } }],
    });
    const consent = TestBed.inject(Consent);
    const analytics = TestBed.inject(Analytics);
    TestBed.tick();
    return { consent, analytics };
  }

  it('does nothing at all without a real measurement ID', () => {
    const { consent, analytics } = setup('G-XXXXXXXXXX');
    consent.grant();
    TestBed.tick();
    analytics.event('x');
    expect(analytics.enabled).toBe(false);
    expect(scripts()).toHaveLength(0);
    expect(window.dataLayer).toBeUndefined();
  });

  it('starts with every storage type denied and requests no Google script before a choice', () => {
    setup();
    const def = calls().find((c) => c[0] === 'consent' && c[1] === 'default');
    expect(def?.[2]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    expect(scripts()).toHaveLength(0);
  });

  it('drops events while there is no consent', () => {
    const { analytics } = setup();
    analytics.event('calculation', { calculator: 'sip' });
    analytics.pageView('/faq', 'FAQ');
    expect(calls().filter((c) => c[0] === 'event')).toHaveLength(0);
  });

  it('loads Google and reports once the visitor accepts, including the page they are on', () => {
    const { consent, analytics } = setup();
    analytics.pageView('/calculators/sip', 'SIP Calculator');
    consent.grant();
    TestBed.tick();

    expect(scripts()).toHaveLength(1);
    expect(scripts()[0].getAttribute('src')).toContain(`id=${ID}`);
    expect(calls().find((c) => c[0] === 'consent' && c[1] === 'update')?.[2]).toMatchObject({ analytics_storage: 'granted' });
    const config = calls().find((c) => c[0] === 'config');
    expect(config?.[1]).toBe(ID);
    expect(config?.[2]).toMatchObject({ send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    expect(calls().find((c) => c[0] === 'event' && c[1] === 'page_view')?.[2]).toMatchObject({ page_path: '/calculators/sip' });

    analytics.event('calculation', { calculator: 'sip' });
    expect(calls().some((c) => c[0] === 'event' && c[1] === 'calculation')).toBe(true);
  });

  it('stops, switches Google off and removes its cookies when the visitor declines', () => {
    const { consent, analytics } = setup();
    consent.grant();
    TestBed.tick();
    document.cookie = '_ga=GA1.1.123; path=/';
    document.cookie = `_ga_${ID.slice(2)}=GS1.1.1; path=/`;

    consent.deny();
    TestBed.tick();
    analytics.event('calculation');

    expect((window as unknown as Record<string, unknown>)[`ga-disable-${ID}`]).toBe(true);
    expect(document.cookie).not.toContain('_ga');
    expect(calls().filter((c) => c[0] === 'consent' && c[1] === 'update').at(-1)?.[2]).toMatchObject({ analytics_storage: 'denied' });
    expect(calls().filter((c) => c[0] === 'event' && c[1] === 'calculation')).toHaveLength(0);
  });
});

describe('calculation tracking', () => {
  afterEach(() => vi.useRealTimers());

  function setup() {
    const event = vi.fn();
    TestBed.configureTestingModule({ providers: [{ provide: Analytics, useValue: { event } }] });
    return event;
  }

  it('skips the first run, waits for the inputs to settle, and sends only the chosen params', () => {
    vi.useFakeTimers();
    const event = setup();
    const secret = signal(1_234_567);
    TestBed.runInInjectionContext(() =>
      trackCalculation('home-loan-emi', () => secret(), () => ({ amount_band: amountBand(secret()) })),
    );
    TestBed.tick();
    vi.advanceTimersByTime(5000);
    expect(event).not.toHaveBeenCalled(); // the defaults are not a calculation

    secret.set(7_500_000);
    TestBed.tick();
    secret.set(8_500_000);
    TestBed.tick();
    vi.advanceTimersByTime(1499);
    expect(event).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(event).toHaveBeenCalledTimes(1);
    expect(event).toHaveBeenCalledWith('calculation', { calculator: 'home-loan-emi', amount_band: '50 lakh-1 crore' });
    expect(JSON.stringify(event.mock.calls)).not.toContain('8500000');
  });

  it('can report a calculation with no params at all (health and date calculators)', () => {
    vi.useFakeTimers();
    const event = setup();
    const dob = signal(new Date(1995, 2, 14));
    TestBed.runInInjectionContext(() => trackCalculation('age', () => dob()));
    TestBed.tick();
    dob.set(new Date(1990, 0, 1));
    TestBed.tick();
    vi.advanceTimersByTime(1600);
    expect(event).toHaveBeenCalledWith('calculation', { calculator: 'age' });
  });
});

describe('amountBand', () => {
  it('turns an exact amount into a coarse range', () => {
    expect(amountBand(50_000)).toBe('under 1 lakh');
    expect(amountBand(500_000)).toBe('5-10 lakh');
    expect(amountBand(5_000_000)).toBe('50 lakh-1 crore');
    expect(amountBand(200_000_000)).toBe('5 crore and above');
  });
});
