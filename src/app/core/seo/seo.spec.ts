import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CALCULATORS } from '../registry/calculators';
import { pageSeo } from './pages';
import { Seo } from './seo.service';
import { SITE_CONFIG } from './site.config';

const ADDRESSES = ['/', '/faq', '/privacy', ...CALCULATORS.map((c) => `/calculators/${c.slug}`)];
const SITE = { name: 'Calculators', url: 'https://calculators.test', locale: 'en_IN' };

describe('page listings', () => {
  it('give every address its own title and description, at search-result lengths', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const a of ADDRESSES) {
      const p = pageSeo(a);
      expect(p.title.length, a).toBeLessThanOrEqual(60);
      expect(p.description.length, a).toBeGreaterThan(70);
      expect(p.description.length, a).toBeLessThanOrEqual(165);
      titles.add(p.title);
      descriptions.add(p.description);
    }
    expect(titles.size).toBe(ADDRESSES.length);
    expect(descriptions.size).toBe(ADDRESSES.length);
  });

  it('describes a calculator as a free web application, with a breadcrumb', () => {
    const graph = pageSeo('/calculators/sip').jsonLd(SITE, '/calculators/sip');
    const app = graph.find((g) => g['@type'] === 'WebApplication')!;
    expect(app).toMatchObject({
      name: 'SIP Calculator',
      url: 'https://calculators.test/calculators/sip',
      applicationCategory: 'FinanceApplication',
      isAccessibleForFree: true,
    });
    expect(graph.find((g) => g['@type'] === 'BreadcrumbList')).toBeTruthy();
    expect(pageSeo('/calculators/bmi').jsonLd(SITE, '/calculators/bmi')[0]['applicationCategory']).toBe('HealthApplication');
  });

  it('puts every FAQ question into FAQPage data, with its answer', () => {
    const faq = pageSeo('/faq').jsonLd(SITE, '/faq').find((g) => g['@type'] === 'FAQPage') as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(15);
    for (const q of faq.mainEntity) {
      expect(q.name.endsWith('?')).toBe(true);
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(20);
    }
  });

  it('leaves unknown addresses out of search', () => {
    const p = pageSeo('/calculators/nope');
    expect(p.noindex).toBe(true);
    expect(p.jsonLd(SITE, '/calculators/nope')).toEqual([]);
  });

  it('leaves URLs out of structured data until there is a site address', () => {
    const app = pageSeo('/calculators/sip').jsonLd({ ...SITE, url: '' }, '/calculators/sip')[0];
    expect('url' in app).toBe(false);
  });
});

describe('Seo service', () => {
  function setup(url: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }]), { provide: SITE_CONFIG, useValue: { ...SITE, url } }],
    });
    document.head.querySelectorAll('link[rel=canonical], script#ld-json, meta[name=description], meta[property^="og:"]').forEach((n) => n.remove());
    TestBed.inject(Seo).start();
    return TestBed.inject(Router);
  }
  const meta = (sel: string) => document.head.querySelector(sel)?.getAttribute('content');

  it('writes title, description, social tags, canonical link and JSON-LD for the page navigated to', async () => {
    const router = setup(SITE.url);
    await router.navigateByUrl('/calculators/fixed-deposit');
    expect(document.title).toBe('FD Calculator: Maturity Value and Interest');
    expect(meta('meta[name=description]')).toContain('Fixed deposit calculator');
    expect(meta('meta[name=robots]')).toBe('index, follow');
    expect(meta('meta[property="og:title"]')).toBe(document.title);
    expect(meta('meta[property="og:url"]')).toBe('https://calculators.test/calculators/fixed-deposit');
    expect(document.head.querySelector<HTMLLinkElement>('link[rel=canonical]')?.href).toBe('https://calculators.test/calculators/fixed-deposit');
    const ld = JSON.parse(document.head.querySelector('script#ld-json')!.textContent!);
    expect(ld['@graph'][0]['@type']).toBe('WebApplication');
  });

  it('replaces the tags on the next page instead of stacking them', async () => {
    const router = setup(SITE.url);
    await router.navigateByUrl('/faq');
    await router.navigateByUrl('/privacy');
    expect(document.head.querySelectorAll('script#ld-json')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel=canonical]')).toHaveLength(1);
    expect(document.title).toContain('Privacy');
    expect(JSON.parse(document.head.querySelector('script#ld-json')!.textContent!)['@graph'][0]['@type']).toBe('WebPage');
  });

  it('writes no canonical or og:url without a site address, and marks unknown pages noindex', async () => {
    const router = setup('');
    await router.navigateByUrl('/calculators/sip');
    expect(document.head.querySelector('link[rel=canonical]')).toBeNull();
    expect(meta('meta[property="og:url"]')).toBeUndefined();
    await router.navigateByUrl('/calculators/unknown');
    expect(meta('meta[name=robots]')).toBe('noindex, follow');
    expect(document.head.querySelector('script#ld-json')).toBeNull();
  });
});
