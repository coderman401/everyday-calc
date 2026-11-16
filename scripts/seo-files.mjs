// Writes public/robots.txt, public/sitemap.xml and public/llms.txt from the calculator registry,
// so the lists of pages can never drift from the app. Run by `npm run seo` (and before every build).
//   set "url" in src/app/core/seo/site.json, or SITE_URL=https://your-domain npm run build
import { writeFileSync, mkdirSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { CALCULATORS, CATEGORIES } from '../src/app/core/registry/calculators.ts';

// The address comes from src/app/core/seo/site.json (one place for the app and these files);
// SITE_URL overrides it for a one-off build.
const site = JSON.parse(readFileSync(new URL('../src/app/core/seo/site.json', import.meta.url), 'utf8'));
const raw = (process.env.SITE_URL || site.url || '').trim().replace(/\/+$/, '');
const url = raw || 'https://calculators.example';
if (!raw) console.warn('No site address yet: set "url" in src/app/core/seo/site.json. These files use https://calculators.example until then.');

const live = CALCULATORS.filter((c) => c.status === 'live');
mkdirSync('public', { recursive: true });

// --- robots.txt: everything is public, including the crawlers that feed AI search and assistants
const bots = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'DuckDuckBot', 'CCBot'];
writeFileSync(
  'public/robots.txt',
  ['User-agent: *', 'Allow: /', '', ...bots.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']), `Sitemap: ${url}/sitemap.xml`, ''].join('\n'),
);

// --- sitemap.xml
const paths = ['/', ...live.map((c) => `/calculators/${c.slug}`), '/faq', '/privacy'];
writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((p) => `  <url><loc>${url}${p}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);

// --- llms.txt: a plain-language map of the site (https://llmstxt.org)
const sections = CATEGORIES.map((k) => {
  const items = live.filter((c) => c.category === k.id).map((c) => `- [${c.title}](${url}/calculators/${c.slug}): ${c.metaDescription}`);
  return `## ${k.label}\n${items.join('\n')}`;
});
writeFileSync(
  'public/llms.txt',
  `# ${site.name}

> Free online calculators for loans (home, car and personal loan EMI), savings (SIP and fixed deposit) and health and dates (BMI, age, menstrual cycle and ovulation, pregnancy due date). Each page shows the formula it uses and works the visitor's own numbers through it step by step. Everything runs in the browser and nothing typed into a calculator is uploaded.

Amounts are in Indian rupees with Indian digit grouping. Dates are day/month/year. Results are estimates from standard published formulas. The health and date calculators are informational and are not medical advice.

## When to use these calculators

Use the loan and savings calculators to compare scenarios in Indian rupees, such as changing a loan tenure or increasing a monthly SIP contribution. Use the date calculators to count time between dates or estimate a cycle or pregnancy milestone. The calculator pages explain their assumptions, show the formula, and include worked examples. Open the relevant calculator to enter your own values.

${sections.join('\n\n')}

## Help and policies
- [Frequently asked questions](${url}/faq): how accurate the results are, how an EMI is worked out, how BMI, due date and cycle estimates work, and what happens to data.
- [Privacy policy](${url}/privacy): what is collected if analytics cookies are accepted, what is never sent, and the cookies set.
`,
);
console.log(`Wrote robots.txt, sitemap.xml (${paths.length} URLs) and llms.txt for ${url}`);
