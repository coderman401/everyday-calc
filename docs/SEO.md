# SEO and AI visibility

This work makes the site easy to **read, understand and quote accurately**, using open standards
(static HTML, schema.org, robots.txt, sitemap.xml, llms.txt). It does not and cannot make any search
engine or AI assistant recommend the site.

## What was wrong (audit)

| Finding | Impact |
|---|---|
| The HTML for every page had an empty body: all text appeared only after JavaScript ran. Most AI crawlers and some search crawlers do not run JavaScript, so they saw nothing. | Critical |
| Every URL had the same title and description. | High |
| No robots.txt, sitemap.xml or llms.txt. | High |
| No structured data. | Medium |
| Icon names ("expand_more", "menu") were part of the page text. | Low |
| Calculator pages linked to nothing else. | Medium |

## What changed

1. **Every page is prerendered to static HTML** at build time (`Prerendered 12 static routes`): home, 9 calculators, FAQ, privacy. The formula, the worked example, the FAQ and the explanations are in the file. Angular then takes over in the browser (hydration), so nothing about use changed. Unknown addresses stay client-side and are marked `noindex`.
2. **Own title, description and social tags per page** (`core/seo`), from the calculator registry. Titles are 60 characters or fewer, descriptions about 155. A test fails if any two pages share one.
3. **Structured data (JSON-LD)**: `WebApplication` (free, INR, finance or health category) and `BreadcrumbList` on each calculator; `FAQPage` with every question on the FAQ; `WebSite`, `Organization` and an `ItemList` on the home page.
4. **robots.txt, sitemap.xml, llms.txt**, generated from the registry by `scripts/seo-files.mjs` before every build, so the page list cannot drift. robots.txt allows search and AI crawlers explicitly (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and others).
5. **Internal links**: each calculator ends with "More calculators", same group first.
6. **Clean text**: icons are named by attribute, not text.

## Before you publish

1. Put your public address in `src/app/core/seo/site.json` (`"url": "https://your-domain"`). This switches on canonical links, `og:url`, the URLs in structured data, and the addresses in sitemap.xml, robots.txt and llms.txt. Until then those use `https://calculators.example`, and the build warns.
2. Build with `npm run build` (it regenerates the three files first), and deploy the contents of `dist/calculators/browser`. Serve each page's own `index.html` (`/calculators/sip` → `calculators/sip/index.html`).
3. Add a 1200×630 share image and set `og:image` if you want a preview picture (not done: no image asset exists yet).

## After you publish (off-site: this is where most visibility comes from)

- Verify the site in **Google Search Console** and **Bing Webmaster Tools**, and submit `/sitemap.xml`. Check "Page indexing" for the 12 URLs.
- Ask for indexing of the home page and a couple of calculators.
- Run **Rich Results Test** on a calculator and the FAQ to confirm the structured data reads.
- Earn real links and mentions: personal-finance and health communities, forums, and any site that would reasonably cite a tool. There is no shortcut and no trick that works.
- Keep numbers and formulas correct and dated. Assistants quote what they can read, so accuracy is the lever you control.

## Checking AI visibility

Once the site is live, ask the questions a person would ask ("EMI calculator for a ₹50 lakh home loan", "how is SIP return calculated", "pregnancy due date from last period") in a few phrasings, on a few assistants, and write down whether the site appears and what is cited. Repeat monthly. Results vary run to run and are not a ranking; one snapshot proves little, a series shows direction. Changes take at least about 30 days to show. **Recheck on or after 9 December 2026.**

This was not run for this change because the site is not published yet.

## Things not to do

Hidden text, keyword stuffing, fake reviews or ratings, or text written to instruct AI systems. They get sites penalised and are the opposite of what this work is for.
