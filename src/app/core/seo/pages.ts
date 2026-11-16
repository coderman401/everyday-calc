import { FAQ_GROUPS } from '../../pages/faq/faq.data';
import { CALCULATORS, CATEGORIES, findCalculator, type CalculatorInfo } from '../registry/calculators';
import type { SiteConfig } from './site.config';

type Json = Record<string, unknown>;

export interface PageSeo {
  title: string;
  description: string;
  /** Kept out of search results (unknown addresses). */
  noindex?: boolean;
  /** Builds the structured data for the page; `abs` makes an absolute URL (empty-safe). */
  jsonLd: (site: SiteConfig, path: string) => Json[];
}

const abs = (site: SiteConfig, path: string) => (site.url ? site.url + path : undefined);
const clean = <T extends Json>(o: T): T => JSON.parse(JSON.stringify(o)) as T;

const breadcrumb = (site: SiteConfig, trail: { name: string; path: string }[]): Json =>
  clean({
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(site, t.path) })),
  });

const APP_TYPE: Record<CalculatorInfo['category'], string> = {
  loans: 'FinanceApplication',
  investing: 'FinanceApplication',
  health: 'HealthApplication',
};

function calculatorPage(c: CalculatorInfo): PageSeo {
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    jsonLd: (site, path) => [
      clean({
        '@type': 'WebApplication',
        name: c.title,
        url: abs(site, path),
        description: c.metaDescription,
        applicationCategory: APP_TYPE[c.category],
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        inLanguage: 'en-IN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'INR' },
      }),
      breadcrumb(site, [
        { name: site.name, path: '/' },
        { name: CATEGORIES.find((k) => k.id === c.category)!.label, path: '/#all' },
        { name: c.title, path },
      ]),
    ],
  };
}

const HOME: PageSeo = {
  title: 'Everyday Calculator: EMI, SIP, FD, BMI, Age, Due Date',
  description:
    'Free calculators for loan EMI, SIP, fixed deposit, BMI, age, ovulation and pregnancy due date. Each shows the formula and works your own numbers through it.',
  jsonLd: (site) => [
    clean({ '@type': 'WebSite', name: site.name, url: abs(site, '/'), inLanguage: 'en-IN' }),
    clean({ '@type': 'Organization', name: site.name, url: abs(site, '/'), logo: abs(site, '/logo.svg') }),
    {
      '@type': 'ItemList',
      name: `${site.name} calculators`,
      itemListElement: CALCULATORS.map((c, i) => clean({ '@type': 'ListItem', position: i + 1, name: c.title, url: abs(site, `/calculators/${c.slug}`) })),
    },
  ],
};

const FAQ: PageSeo = {
  title: 'FAQ: How the Calculators Work and Your Data',
  description:
    'Answers on how accurate the calculators are, how an EMI is worked out, how BMI, due date and cycle estimates work, and what happens to your data.',
  jsonLd: (site) => [
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    breadcrumb(site, [{ name: site.name, path: '/' }, { name: 'FAQ', path: '/faq' }]),
  ],
};

const PRIVACY: PageSeo = {
  title: 'Privacy Policy: What Is Collected',
  description:
    'What Everyday Calculator collects if you accept analytics cookies, what is never sent, the cookies set, and how to change your choice at any time.',
  jsonLd: (site) => [
    { '@type': 'WebPage', name: 'Privacy policy', url: abs(site, '/privacy') },
    breadcrumb(site, [{ name: site.name, path: '/' }, { name: 'Privacy policy', path: '/privacy' }]),
  ],
};

const NOT_FOUND: PageSeo = {
  title: 'Page not found | Everyday Calculator',
  description: 'This calculator is not here. Pick one from the list.',
  noindex: true,
  jsonLd: () => [],
};

/** The search listing and structured data for an address. */
export function pageSeo(path: string): PageSeo {
  const p = path.replace(/\/+$/, '') || '/';
  if (p === '/') return HOME;
  if (p === '/faq') return FAQ;
  if (p === '/privacy') return PRIVACY;
  const m = /^\/calculators\/([^/]+)$/.exec(p);
  const calc = m ? findCalculator(m[1]) : undefined;
  return calc ? calculatorPage(calc) : NOT_FOUND;
}
