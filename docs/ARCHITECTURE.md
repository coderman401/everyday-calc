# Architecture: analytics, consent and structure

## 1. Requirements

**Functional**
- Google Analytics 4: page views, calculations performed, browser/device, approximate location.
- Core Web Vitals reported to the same property.
- A cookie banner; a privacy policy page; an FAQ page.

**Non-functional**
- Consent first: no Google script, no Google cookie, no event before the visitor accepts.
- No personal data in events. Health and date calculators are sensitive: they never send what was entered.
- No effect on first load: analytics code is small, Google's script loads only after consent, web-vitals is its own chunk.
- Static site, no backend: everything runs in the browser.

**Constraints** Angular 22 SPA, no server, a small team. Hence a client-side tag with Consent Mode rather than a server-side collector.

## 2. High-level design

```
 router NavigationEnd ──► PageTracker ───────┐
 calculator pages ──► trackCalculation() ────┤            ┌──────────────┐
 web-vitals (own chunk) ──► WebVitals ───────┼──► Analytics ──► gtag.js ──► Google Analytics 4
                                             │       ▲        └──────────────┘  (loaded only after accept)
 cookie banner ──► Consent ──(choice signal)─┴───────┘
                     │
                     └─► localStorage "cookie-consent" + cookie "calc_consent" (6 months)
```

`Consent` owns one signal, `choice`: `null` (not asked), `'granted'`, `'denied'`. `Analytics` reacts to it with an `effect`:

| choice | what happens |
|---|---|
| `null` | Consent Mode default = all denied. No script. Events dropped. |
| `granted` | `consent update` granted, gtag.js injected once, `config` (no auto page view, no Google signals), current page reported. |
| `denied` | `consent update` denied, `ga-disable-<ID>` set, `_ga*` cookies removed, held web vitals discarded. |

Events are dropped, never queued, while consent is missing. The exception is Core Web Vitals, which settle late (LCP, CLS on page hide): they are held in memory (30 at most) until the choice and then sent or discarded.

## 3. What is collected

| Data | Source | Notes |
|---|---|---|
| Page views | `PageTracker` | path, title, location. |
| Calculations | `trackCalculation()` | event `calculation`, after inputs rest for 1.5 s; first (default) run skipped. |
| Browser, OS, screen, language | Google, automatically | not sent by our code. |
| Location (country, region, city) | Google, from the IP | the IP is not stored by GA4. Not sent by our code. |
| Web vitals | `WebVitals` | event `web_vitals`: name, value, rating, id. |
| Cookies | Google (`_ga`, `_ga_<ID>`), us (`calc_consent`) | |

Calculation payloads (the only thing that leaves a calculator):

| Calculator | Sent |
|---|---|
| Home, car, personal loan | amount band, rate, years, prepayment / extra EMI / step-up switches |
| SIP | yearly-investment band, rate, years, step-up switch |
| Fixed deposit | amount band, rate, months, compounding |
| BMI | unit system, cut-off set (no height, weight or result) |
| Pregnancy | method only (no dates) |
| Age, menstrual cycle | nothing (the event only) |

The "all the calculation performed" request is met as *every calculation is counted*; exact inputs are deliberately not sent (see trade-offs).

## 4. Code layout

```
src/app/
  app.config.ts, app.routes.ts, app.ts|html|scss
  core/
    analytics/   config, consent, analytics (gtag), web-vitals, page-tracker, calculation-tracking, buckets, providers
    formatting/  format.ts          (rupees, durations, parsing)
    dates/       dates.ts, date-adapter.ts, date-providers.ts
    theme/       theme.ts
    registry/    calculators.ts     (the list every menu and page reads)
  shared/
    layout/      calc-shell, doc-page, explainer, data-table, cookie-banner/
    forms/       number-field, date-field, tenure-field, option
    charts/      donut-chart, scale, tile-visual
    ui/          breakup, count, fruit-icon, logo
  pages/         home, privacy, faq, coming-soon
  calculators/   loan (home, car, personal), sip, fixed-deposit, bmi, age, menstrual-cycle, pregnancy
                 date-calculators.routes.ts
```

Dependencies point one way: `calculators` and `pages` use `shared` and `core`; `shared` uses `core`; `core` uses nothing above it.

**Duplication removed in this pass**
- Year/Month tenure input and its conversion: one `app-tenure-field` (was copied in the loan and FD pages).
- The "results card", "badge", segmented-group, back-link, FAQ and pill styles: one copy in `styles.scss` (were repeated in up to five component sheets).
- Three `*.routes.ts` files for the date calculators: one `date-calculators.routes.ts`.

## 5. Trade-offs

| Decision | Why | Cost |
|---|---|---|
| Client-side gtag with Consent Mode v2 | No backend to run | Ad-blockers hide some visits; GA sees what the browser sends |
| Script loaded only after accept | Strongest reading of consent; nothing before | A first page view by a new visitor is counted only after they accept |
| Banner with equal Accept / Decline | Avoids steering; accepted regulator practice | Slightly lower opt-in rate |
| Dropping events without consent | No backlog of untracked-user data | Early-session data lost for decliners (intended) |
| Bands, not exact amounts | Inputs can be financial or health data | Less precise usage analysis |
| Health calculators send nothing entered | Sensitive category | Cannot see which BMI or cycle lengths are common |
| Consent kept in localStorage and a cookie | Survives either being cleared | Two places to keep in step (one `save()`) |
| `web-vitals` in a lazy chunk | No first-load cost | Metrics start a moment after boot |

## 6. Hosting and deployment

```
 npm run build
   prebuild   scripts/seo-files.mjs   robots.txt, sitemap.xml, llms.txt  (address from core/seo/site.json)
   ng build   prerender 12 pages to static HTML   ->  dist/calculators/browser
   postbuild  scripts/post-build.mjs  index.csr.html -> 404.html
 npm run deploy  ->  firebase deploy --only hosting  ->  https://everyday-calc.web.app
```

- **Firebase Hosting** (project `everyday-calc`, `.firebaserc`; rules in `firebase.json`): static files on a CDN with HTTPS, no server to run.
- **Caching:** hashed `js`/`css` are immutable for a year; HTML is `no-cache` so a deploy shows at once; icons a day; robots/sitemap/llms an hour.
- **404:** unknown addresses get `404.html` with a real 404 status (the app shell, which shows its "not here" page), so search engines do not index junk URLs as pages.
- **Headers:** `nosniff`, `X-Frame-Options: DENY`, strict referrer policy, a locked-down permissions policy. HSTS is added by Firebase.
- **Automatic deploys:** none for Firebase at the moment (the earlier `deploy.yml` failed at the deploy step: its service-account secret was not valid JSON, and the file has since been removed). `.github/workflows/pages.yml` deploys to GitHub Pages on every push to `main`: install, test, build with the Pages base path, publish. A failing test stops the deploy.
  - One-time setup: in the Firebase console open *Project settings → Service accounts → Generate new private key* (or run `firebase init hosting:github` in the repo, which does this for you), then add the file's contents as the GitHub repository secret `FIREBASE_SERVICE_ACCOUNT_EVERYDAY_CALC` (*Settings → Secrets and variables → Actions*). Never commit the key.
- **Preview:** `npm run preview:hosting` deploys to a temporary preview URL that expires in 7 days.
- **Not done yet:** a Content-Security-Policy. It needs a hash for the inline theme script and allowances for Google Tag and Google Fonts; add it once the tag set is stable, and test it on a preview channel first.

## 7. Set-up checklist

1. Create a GA4 property and a web data stream; copy the ID (`G-…`).
2. In `app.config.ts`: `provideAnalytics({ measurementId: 'G-…' })` (done: `G-5XX2M5182G`). A `GTM-…` Tag Manager ID does not work here: this app talks to GA4 directly.
3. In GA4, register custom dimensions for event parameters you want in reports: `calculator`, `amount_band`, `rate`, `years`, `months`, `compounding`, `prepayment`, `extra_emi`, `step_up`, `units`, `standard`, `method`, `metric_name`, `metric_rating`. Custom metric for `metric_value`.
4. Set data retention to 14 months (Admin → Data settings → Data retention); the privacy page says "up to 14 months".
5. Replace the stand-in contact `coderman401.ai@gmail.com` in `pages/privacy/privacy.ts`.
6. Have the privacy text reviewed against the laws that apply to your visitors (GDPR, India's DPDP Act). It is a sound draft, not legal advice.

## 7. What to revisit as it grows

- Server-side tagging (own domain) if ad-blocker loss or a stricter consent posture matters.
- A preference centre with separate categories if a second non-essential tool is added.
- Sampling or batching calculation events if traffic makes GA quotas bite (GA4 standard: 500 distinct events, 25 custom dimensions).
- A proper CSP once the tag set is stable (`script-src` for googletagmanager.com, `connect-src` for google-analytics.com).
- Moving the FAQ and privacy copy to content files if non-developers will edit them.
