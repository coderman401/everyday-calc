import { Injectable, computed, signal } from '@angular/core';

export type ConsentChoice = 'granted' | 'denied';

const KEY = 'cookie-consent';
const COOKIE = 'calc_consent';
/** Ask again after about six months. */
const MAX_AGE_DAYS = 180;

interface Stored {
  v: 1;
  choice: ConsentChoice;
  at: string;
}

function read(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Stored;
      const age = (Date.now() - new Date(s.at).getTime()) / 86_400_000;
      if ((s.choice === 'granted' || s.choice === 'denied') && age >= 0 && age < MAX_AGE_DAYS) return s.choice;
    }
  } catch {
    /* storage blocked: fall through to the cookie */
  }
  const m = /(?:^|;\s*)calc_consent=(granted|denied)/.exec(typeof document === 'undefined' ? '' : document.cookie);
  return (m?.[1] as ConsentChoice | undefined) ?? null;
}

/**
 * The visitor's cookie choice. Nothing is decided for them: until they pick, the choice is null
 * and analytics stays off. The pick is kept on this device in localStorage and in a first-party
 * cookie (so it survives either being cleared), and expires after about six months.
 */
@Injectable({ providedIn: 'root' })
export class Consent {
  private readonly stored = signal<ConsentChoice | null>(read());
  /** Set when the visitor reopens the banner from the footer to change their mind. */
  private readonly reopened = signal(false);

  readonly choice = this.stored.asReadonly();
  readonly showBanner = computed(() => this.stored() === null || this.reopened());

  grant(): void {
    this.save('granted');
  }

  deny(): void {
    this.save('denied');
  }

  reopen(): void {
    // this.reopened.set(true);
  }

  private save(choice: ConsentChoice): void {
    this.stored.set(choice);
    this.reopened.set(false);
    const value: Stored = { v: 1, choice, at: new Date().toISOString() };
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      /* private mode: the cookie below still remembers it */
    }
    document.cookie = `${COOKIE}=${choice}; max-age=${MAX_AGE_DAYS * 86_400}; path=/; SameSite=Lax`;
  }
}
