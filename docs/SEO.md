# Search visibility

Firebase Hosting serves the canonical site at https://everyday-calc.web.app. The GitHub Pages
mirror declares the corresponding Firebase URL as canonical on each page. Change the public
address in `src/app/core/seo/site.json` if you move the primary site.

The production build prerenders 12 pages: the home page, nine calculators, FAQ and privacy
policy. Calculator formulas, worked examples and links are in the initial HTML. Each page has
a title, description, canonical URL, social metadata and structured data. Firebase serves unknown
URLs with HTTP 404 and a `noindex` directive.

`npm run build` generates `robots.txt`, `sitemap.xml` and `llms.txt` and builds the static site.
The sitemap lists the canonical pages and omits modification dates unless they can be backed by
page-level changes. Robots rules allow search crawlers including Googlebot, Bingbot,
OAI-SearchBot, Claude-SearchBot and PerplexityBot. The `llms.txt` file describes available tools and
links to their canonical pages.

## Submit and check the sitemap

- In [Google Search Console](https://search.google.com/search-console), open the
  `https://everyday-calc.web.app/` URL-prefix property. The homepage contains the Google
  verification tag. Submit `sitemap.xml` in **Sitemaps**, then inspect the homepage and important
  calculator URLs in **URL Inspection** to see index status or request indexing.
- In [Bing Webmaster Tools](https://www.bing.com/webmasters/), verify the Firebase site and
  submit the same sitemap. Use **AI Performance** to check for citations across supported
  Microsoft AI experiences once data is available.

Search engines decide whether to index and cite a page. Track indexed URLs in Search Console and
Bing Webmaster Tools and check Google’s generative AI performance report when available.
