import { effect, inject } from '@angular/core';
import { Analytics, type EventParams } from './analytics.service';

/** How long the inputs must stay still before a calculation counts as "performed". */
const SETTLE_MS = 1500;

/**
 * Reports that a calculator was used, once the visitor stops changing its inputs.
 *
 * `watch` reads the inputs so the effect knows when they change; whatever it returns is NEVER sent.
 * `params` is the only thing that leaves the page, and each calculator decides it: loans and savings
 * send bands and settings (never the exact amount); the health and date calculators send nothing
 * the visitor entered. The first run (the defaults) is skipped. Call from a constructor.
 */
export function trackCalculation(calculator: string | (() => string), watch: () => unknown, params: () => EventParams = () => ({})): void {
  const analytics = inject(Analytics);
  let first = true;
  effect((onCleanup) => {
    watch();
    const p = params();
    if (first) {
      first = false;
      return;
    }
    const timer = setTimeout(() => analytics.event('calculation', { calculator: typeof calculator === 'string' ? calculator : calculator(), ...p }), SETTLE_MS);
    onCleanup(() => clearTimeout(timer));
  });
}
