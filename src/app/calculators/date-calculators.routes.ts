import type { Routes } from '@angular/router';
import { DATE_PROVIDERS } from '../core/dates/date-providers';
import type { Type } from '@angular/core';

/**
 * The calculators that take a date. Each is a lazy child route that provides the day/month/year
 * date handling, so the date adapter loads with these pages and not with the first one.
 */
const datePage = (load: () => Promise<Type<unknown>>): Routes => [
  { path: '', providers: DATE_PROVIDERS, loadComponent: load },
];

export const AGE_ROUTES = datePage(() =>
  import('./age/age-calculator').then((m) => m.AgeCalculator),
);

export const CYCLE_ROUTES = datePage(() =>
  import('./menstrual-cycle/cycle-calculator').then((m) => m.CycleCalculator),
);

export const PREGNANCY_ROUTES = datePage(() =>
  import('./pregnancy/pregnancy-calculator').then((m) => m.PregnancyCalculator),
);

export const DATE_ROUTES = datePage(() =>
  import('./date/date-calculator').then((m) => m.DateCalculator),
);
