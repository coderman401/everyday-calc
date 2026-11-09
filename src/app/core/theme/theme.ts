import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemeName = 'light' | 'dark';

const KEY = 'theme';

function read(): ThemeName | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Light or dark. Follows the system until the visitor picks one; the pick is remembered on
 * this device. The choice is one attribute on <html>: the stylesheet does the rest.
 */
@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly doc = inject(DOCUMENT);
  private readonly picked = signal<ThemeName | null>(read());
  private readonly systemDark = signal(false);

  readonly current = computed<ThemeName>(() => this.picked() ?? (this.systemDark() ? 'dark' : 'light'));

  constructor() {
    if (typeof matchMedia === 'function') {
      const mq = matchMedia('(prefers-color-scheme: dark)');
      this.systemDark.set(mq.matches);
      mq.addEventListener('change', (e) => this.systemDark.set(e.matches));
    }
    effect(() => {
      const p = this.picked();
      const root = this.doc.documentElement;
      if (p) root.setAttribute('data-theme', p);
      else root.removeAttribute('data-theme');
    });
  }

  toggle(): void {
    const next: ThemeName = this.current() === 'dark' ? 'light' : 'dark';
    this.picked.set(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode: the choice lasts for this visit only */
    }
  }
}
