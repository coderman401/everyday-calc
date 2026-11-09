import type { Provider } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, type MatDateFormats } from '@angular/material/core';
import { DayFirstDateAdapter } from './date-adapter';

/** dd/mm/yyyy in the field, so 9/11 is never read as September. */
const FORMATS: MatDateFormats = {
  parse: { dateInput: null },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

/**
 * Date handling for the calculators that take a date. Registered on those routes only, so the
 * adapter loads with them and not with the first page.
 */
export const DATE_PROVIDERS: Provider[] = [
  { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },
  { provide: DateAdapter, useClass: DayFirstDateAdapter },
  { provide: MAT_DATE_FORMATS, useValue: FORMATS },
];
