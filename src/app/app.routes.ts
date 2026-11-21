import { Route, Routes } from '@angular/router';
import {
  CAR_LOAN_CONFIG,
  HOME_LOAN_CONFIG,
  PERSONAL_LOAN_CONFIG,
  type LoanConfig,
} from './calculators/loan/loan.config';

/** The three EMI calculators share one page; the route hands it the config that differs. */
const loan = (config: LoanConfig): Route => ({
  path: `calculators/${config.slug}`,
  data: { config },
  loadComponent: () => import('./calculators/loan/loan-calculator').then((m) => m.LoanCalculator),
});

/**
 * Every calculator has its own lazy route and must be declared before the `:slug` placeholder,
 * which serves anything still on the list as "not built yet" and unknown addresses.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  loan(HOME_LOAN_CONFIG),
  loan(CAR_LOAN_CONFIG),
  loan(PERSONAL_LOAN_CONFIG),
  {
    path: 'calculators/sip',
    loadComponent: () => import('./calculators/sip/sip-calculator').then((m) => m.SipCalculator),
  },
  {
    path: 'calculators/fixed-deposit',
    loadComponent: () => import('./calculators/fixed-deposit/fd-calculator').then((m) => m.FdCalculator),
  },
  {
    path: 'calculators/bmi',
    loadComponent: () => import('./calculators/bmi/bmi-calculator').then((m) => m.BmiCalculator),
  },
  {
    path: 'calculators/bmr',
    loadComponent: () => import('./calculators/bmr/bmr-calculator').then((m) => m.BmrCalculator),
  },
  {
    path: 'calculators/time',
    loadComponent: () => import('./calculators/time/time-calculator').then((m) => m.TimeCalculator),
  },
  { path: 'calculators/date', loadChildren: () => import('./calculators/date-calculators.routes').then((m) => m.DATE_ROUTES) },
  { path: 'calculators/age', loadChildren: () => import('./calculators/date-calculators.routes').then((m) => m.AGE_ROUTES) },
  { path: 'calculators/menstrual-cycle', loadChildren: () => import('./calculators/date-calculators.routes').then((m) => m.CYCLE_ROUTES) },
  { path: 'calculators/pregnancy', loadChildren: () => import('./calculators/date-calculators.routes').then((m) => m.PREGNANCY_ROUTES) },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq').then((m) => m.FaqPage),
  },
  {
    path: 'calculators/:slug',
    loadComponent: () => import('./pages/coming-soon/coming-soon').then((m) => m.ComingSoon),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/coming-soon/coming-soon').then((m) => m.ComingSoon),
  },
];
