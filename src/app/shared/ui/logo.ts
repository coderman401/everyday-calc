import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The mark: a donut chart (the break-up every result card shows) with an equals sign for a
 * hole. One colour pair from the theme, so it follows light and dark. The ring draws itself
 * once on load and turns a quarter when the pointer rests on it.
 */
@Component({
  selector: 'app-logo',
  template: `
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect class="tile" width="40" height="40" rx="11" />
      <g class="ring" fill="none" stroke-width="4.5">
        <circle class="arc arc--a" cx="20" cy="20" r="10.5" pathLength="100" />
        <circle class="arc arc--b" cx="20" cy="20" r="10.5" pathLength="100" />
      </g>
      <rect class="bar" x="16.5" y="17" width="7" height="2.2" rx="1.1" />
      <rect class="bar" x="16.5" y="20.8" width="7" height="2.2" rx="1.1" />
    </svg>
  `,
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Logo {}
