import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

/**
 * The native adapter reads "14/03/1995" as month 14. This one reads day/month/year, which is
 * how dates are typed in India, and rejects dates that do not exist (31/02/2024).
 */
@Injectable()
export class DayFirstDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (typeof value !== 'string') return super.parse(value);
    const text = value.trim();
    if (!text) return null;
    const m = /^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{4})$/.exec(text);
    if (!m) return this.invalid();
    const day = Number(m[1]);
    const month = Number(m[2]) - 1;
    const year = Number(m[3]);
    const date = new Date(year, month, day);
    const real = date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
    return real ? date : this.invalid();
  }
}
