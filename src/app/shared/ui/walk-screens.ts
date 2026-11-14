import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HOME_LOAN_CONFIG } from '../../calculators/loan/loan.config';
import { formatInr, formatPercent } from '../../core/formatting/format';
import { Donut, type Slice } from '../charts/donut-chart';
import { Mascot } from './mascot';
import {
  SAMPLE,
  SAMPLE_AT,
  SAMPLE_FORMULA,
  SAMPLE_INPUT,
  SAMPLE_STEPS,
  SAMPLE_YEARS,
} from './sample-loan';

/*
 * The three screens of the home page walkthrough. Each is a flat picture of what you would see,
 * drawn from the real engine and explainer (see sample-loan). They are decorative: the walkthrough's
 * text says the same in words, so the host element is hidden from assistive technology there.
 *
 * Where the walkthrough pins its screens, a screen's rows arrive one after another as its step
 * scrolls in. The timeline comes from the step (--tl is set on it); without scroll timelines or with
 * reduced motion the finished screen is simply there.
 */

const HEADING = `
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--s-4);
  }
  .h {
    font: 600 1.5rem/1.2 var(--font-display);
    letter-spacing: -0.01em;
    color: var(--heading);
  }
`;

const SLIDE_IN = `
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(-18px);
    }
  }
`;

/* 1. Enter your loan: the three fields with their sliders, and the answer beside them */
@Component({
  selector: 'app-loan-screen',
  imports: [Donut],
  template: `
    <div class="s1">
      <div class="col">
        <p class="h">Your loan</p>
        @for (f of fields; track f.label) {
          <div [style.--at]="f.at">
            <p class="fld">
              <span class="l">{{ f.label }}</span
              ><span class="v num">{{ f.value }}</span>
            </p>
            <span class="track"><i></i><b></b></span>
          </div>
        }
      </div>
      <div class="col">
        <p class="label">Monthly EMI</p>
        <p class="hero-fig num">{{ emi }}</p>
        <div class="chart">
          <app-donut
            [slices]="slices"
            [summary]="summary"
            centreLabel="Interest share"
            [centreValue]="share"
          />
        </div>
        <p class="row">
          <span class="dot" style="--dot: var(--c-principal)"></span>Principal<b class="num">{{
            principal
          }}</b>
        </p>
        <p class="row">
          <span class="dot" style="--dot: var(--c-interest)"></span>Interest<b class="num">{{
            interest
          }}</b>
        </p>
      </div>
    </div>
  `,
  styles: `
    ${HEADING}
    .s1 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--s-6);
    }
    .col {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      min-width: 0;
    }
    .chart {
      width: 100%;
      max-width: 148px;
      align-self: center;
    }
    .fld {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--s-2);
      margin: 0;
      padding: var(--s-2) var(--s-3);
      border: var(--edge) solid var(--line);
      border-radius: var(--r-sm);
    }
    .l {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--muted);
    }
    .v {
      font-weight: 800;
      color: var(--heading);
    }
    /* The slider, as the calculator draws it: a track, the part you have dragged, and the thumb */
    .track {
      position: relative;
      display: block;
      height: 10px;
      margin: var(--s-3) 8px 0;
      border-radius: 5px;
      background: var(--line);
    }
    .track i {
      position: absolute;
      inset: 0 auto 0 0;
      width: calc(var(--at) * 100%);
      border-radius: inherit;
      background: var(--ecto);
    }
    .track b {
      position: absolute;
      top: 50%;
      left: calc(var(--at) * 100%);
      width: 22px;
      height: 22px;
      translate: -50% -50%;
      border: 4px solid var(--card);
      border-radius: 50%;
      background: var(--ecto);
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      margin: 0;
      font-size: 0.9375rem;
    }
    .row b {
      margin-left: auto;
      font-weight: 800;
      color: var(--heading);
    }
    .dot {
      flex: none;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--dot);
    }
    @media (max-width: 599px) {
      .s1 {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanScreen {
  protected readonly emi = formatInr(SAMPLE.emi);
  protected readonly principal = formatInr(SAMPLE.principal);
  protected readonly interest = formatInr(SAMPLE.totalInterest);
  protected readonly share = formatPercent((SAMPLE.totalInterest / SAMPLE.totalPayment) * 100);
  protected readonly summary = `Of ${formatInr(SAMPLE.totalPayment)} paid, ${this.principal} is principal and ${this.interest} is interest.`;
  protected readonly slices: Slice[] = [
    { id: 'principal', label: 'Principal', value: SAMPLE.principal, color: 'var(--c-principal)' },
    { id: 'interest', label: 'Interest', value: SAMPLE.totalInterest, color: 'var(--c-interest)' },
  ];
  protected readonly fields = [
    {
      label: HOME_LOAN_CONFIG.amountLabel,
      value: formatInr(SAMPLE_INPUT.principal),
      at: SAMPLE_AT.amount,
    },
    { label: 'Interest rate (per year)', value: `${SAMPLE_INPUT.annualRate}%`, at: SAMPLE_AT.rate },
    { label: 'Loan tenure', value: `${SAMPLE_YEARS} years`, at: SAMPLE_AT.years },
  ];
}

/* 2. Read it year by year: the first years of the schedule, with principal against interest */
@Component({
  selector: 'app-schedule-screen',
  template: `
    <p class="h">Year-by-year schedule</p>
    <div class="yr head label">
      <span>Year</span><span>Principal</span><span>Interest</span><span>Balance</span><span></span>
    </div>
    @for (y of years; track y.year) {
      <div class="yr num" [style.--i]="$index" [style.--mix]="y.mix">
        <span>{{ y.year }}</span
        ><span>{{ y.principal }}</span
        ><span>{{ y.interest }}</span
        ><span>{{ y.closing }}</span>
        <span class="mix"><i></i></span>
      </div>
    }
  `,
  styles: `
    ${HEADING}
    .yr {
      display: grid;
      grid-template-columns: 2.5rem repeat(3, minmax(0, 1fr)) 4.5rem;
      gap: var(--s-2);
      align-items: center;
      padding-block: var(--s-2);
      border-bottom: 1px solid var(--line);
      font-size: 0.9375rem;
    }
    .yr span:nth-child(n + 2):nth-child(-n + 4) {
      text-align: right;
    }
    .head {
      padding-block: 0 var(--s-2);
      font-weight: 700;
    }
    .yr:last-child {
      border-bottom: 0;
    }
    /* Principal against interest in that year: blue climbs, orange shrinks */
    .mix {
      display: block;
      height: 10px;
      border-radius: 5px;
      background: var(--c-interest);
      overflow: hidden;
    }
    .mix i {
      display: block;
      width: calc(var(--mix) * 100%);
      height: 100%;
      background: var(--c-principal);
    }
    @media (max-width: 599px) {
      .yr {
        grid-template-columns: 2rem repeat(3, minmax(0, 1fr));
        font-size: 0.8125rem;
      }
      .yr > :last-child {
        display: none;
      }
    }

    ${SLIDE_IN}
    @keyframes grow {
      from {
        transform: scaleX(0);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      @supports (animation-timeline: view()) and (timeline-scope: --a) {
        .yr:not(.head) {
          animation: slide-in linear backwards;
          animation-timeline: var(--tl);
          animation-range: entry calc(14% + var(--i) * 5%) entry calc(46% + var(--i) * 5%);
        }
        .mix i {
          transform-origin: left;
          animation: grow linear backwards;
          animation-timeline: var(--tl);
          animation-range: entry calc(20% + var(--i) * 5%) entry calc(54% + var(--i) * 5%);
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleScreen {
  protected readonly years = SAMPLE.years.slice(0, 6).map((y) => ({
    year: y.year,
    principal: formatInr(y.principal),
    interest: formatInr(y.interest),
    closing: formatInr(y.closing),
    mix: y.principal / (y.principal + y.interest),
  }));
}

/* 3. Check the working: the formula, then the numbers worked through it, with Tally on the edge */
@Component({
  selector: 'app-working-screen',
  imports: [Mascot],
  template: `
    <p class="h">How it's calculated</p>
    <p class="formula num">{{ formula }}</p>
    <ol class="work">
      @for (s of steps; track s.label) {
        <li [style.--i]="$index">
          <svg viewBox="0 0 20 20" focusable="false">
            <circle cx="10" cy="10" r="10" />
            <path d="M5.5 10.5 8.5 13.5 14.5 7" />
          </svg>
          <span>{{ s.label }}</span>
          <b class="num">{{ s.value }}</b>
        </li>
      }
    </ol>
    <app-mascot class="buddy" [size]="96" />
  `,
  styles: `
    ${HEADING}
    .formula {
      margin: 0;
      padding: var(--s-3) var(--s-4);
      border-radius: var(--r-md);
      background: var(--fill);
      font-size: 0.9375rem;
      font-weight: 600;
    }
    .work {
      list-style: none;
      margin: 0;
      padding: 0;
      border: 1px solid var(--line);
      border-radius: var(--r-md);
      overflow: hidden;
    }
    .work li {
      display: grid;
      grid-template-columns: 20px minmax(0, 1fr) auto;
      gap: var(--s-3);
      align-items: center;
      padding: 6px var(--s-4);
      border-bottom: 1px solid var(--line);
      font-size: 0.8125rem;
      line-height: 1.35;
    }
    .work li:last-child {
      border-bottom: 0;
      background: var(--selected-bg);
      color: var(--selected-text);
    }
    .work b {
      font-weight: 800;
      text-align: right;
    }
    circle {
      fill: var(--ecto);
    }
    path {
      fill: none;
      stroke: #ffffff;
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 14;
    }
    /* Tally stands on the card's top edge, as in the hero */
    .buddy {
      position: absolute;
      right: var(--s-6);
      bottom: calc(100% - 6px);
    }

    ${SLIDE_IN}
    @keyframes check-in {
      from {
        stroke-dashoffset: 14;
      }
    }
    @keyframes stamp {
      from {
        opacity: 0;
        transform: scale(0.4) translateY(10px);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      @supports (animation-timeline: view()) and (timeline-scope: --a) {
        .work li {
          animation: slide-in linear backwards;
          animation-timeline: var(--tl);
          animation-range: entry calc(12% + var(--i) * 5%) entry calc(40% + var(--i) * 5%);
        }
        path {
          animation: check-in linear backwards;
          animation-timeline: var(--tl);
          animation-range: entry calc(26% + var(--i) * 5%) entry calc(56% + var(--i) * 5%);
        }
        .buddy {
          animation: stamp backwards;
          animation-timing-function: var(--ease-pop);
          animation-timeline: var(--tl);
          animation-range: entry 40% entry 100%;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkingScreen {
  protected readonly formula = SAMPLE_FORMULA;
  protected readonly steps = SAMPLE_STEPS;
}
