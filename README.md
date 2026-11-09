# Calculators

Angular 22 + Angular Material 3. Standalone components, signals, zoneless, lazy routes.

Nine calculators, each with a results card and a "How it's calculated" section (the formula, a worked
example using the numbers you entered, notes and common questions):

| Loans | Savings and investing | Health and dates |
|---|---|---|
| Home loan EMI | SIP | BMI |
| Car loan EMI | Fixed deposit | Age |
| Personal loan EMI | | Menstrual cycle |
| | | Pregnancy |

The three EMI calculators have prepayment, extra EMIs every year and a yearly EMI step-up. SIP has a yearly
step-up. Amounts are in rupees with Indian grouping; dates are day/month/year.

The home page has a live sample (a slider and four tenures, worked by the real loan engine) whose
"Open with these numbers" link starts the home loan calculator from `?amount=&rate=&years=`. The header has a
light/dark switch that remembers the choice; the logo is `public/logo.svg` (also the favicon) and the
`app-logo` component draws the same mark in the theme's colours.

## Run

Angular 22 needs Node `^22.22.3`, `^24.15` or `>=26` (see `.nvmrc`).

```bash
nvm use          # picks 22.23.3
npm install
npm start        # http://localhost:4200
npm test         # unit tests (Vitest)
npm run build    # production build in dist/
```

## Layout

```
src/app/
  core/       analytics/ (consent, GA4, web vitals), formatting/, dates/, theme/, registry/
  shared/     layout/ (calc-shell, doc-page, explainer, data-table, cookie-banner), forms/, charts/, ui/
  pages/      home, privacy, faq, coming-soon
  calculators/ loan (home, car, personal), sip, fixed-deposit, bmi, age, menstrual-cycle, pregnancy
docs/ARCHITECTURE.md   analytics design, what is collected, trade-offs, set-up checklist
```

Each calculator keeps its maths in a pure `*.engine.ts` with a spec, so the numbers are tested apart from
the UI. Each explainer is a function of the live inputs, so the worked example always matches the result.

## SEO

Every page is prerendered to static HTML (text is readable without JavaScript), with its own title,
description, social tags and structured data. `robots.txt`, `sitemap.xml` and `llms.txt` are generated from the
registry (`npm run seo`, run before every build). Set your address in `src/app/core/seo/site.json`. See
`docs/SEO.md`.

## Analytics

Google Analytics 4 and Core Web Vitals, behind a cookie banner. Nothing loads or is sent until the visitor
accepts; what is and is not sent is in `docs/ARCHITECTURE.md`. To switch it on, set your ID in `app.config.ts`:
`provideAnalytics({ measurementId: 'G-…' })`.

## Adding a calculator

1. Add it to `src/app/core/calculators.ts` (`status: 'live'`).
2. Add its lazy route in `src/app/app.routes.ts`, **above** the `calculators/:slug` fallback. A calculator
   that takes dates goes in `calculators/date-calculators.routes.ts`, which provides the date handling.
3. Build the page inside `<app-calc-shell>` with `slot="inputs"` and `slot="results"`, reuse the shared
   pieces, and add an `*.explainer.ts`. `routes.spec.ts` checks that every calculator renders a formula,
   a worked example and questions. Call `trackCalculation()` from its constructor and choose what it sends.

## The maths in brief

- **EMI:** `EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)`, with `r` the monthly rate and `n` the months. The loan is
  then simulated month by month; extras go straight to principal and shorten the loan.
- **SIP:** `FV = P × [((1 + i)ⁿ − 1) ÷ i] × (1 + i)` (instalments at the start of each month).
- **Fixed deposit:** `A = P × (1 + r ÷ n)^(n × t)`, interest reinvested.
- **BMI:** `weight (kg) ÷ height (m)²`, with WHO global and Asia-Pacific cut-offs.
- **Age:** calendar subtraction (whole years, then months, then days).
- **Cycle:** ovulation is 14 days before the next period; the fertile window is 5 days before it to 1 day after.
- **Pregnancy:** due date is the last period + 280 days (+ cycle length − 28), or conception + 266 days.
