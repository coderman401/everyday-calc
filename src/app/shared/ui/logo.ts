import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The mark: Tally's face. A pocket calculator in Ecto Green with a lip underneath, a dark screen
 * with lime eyes and a smile, and three keys. It is flat colour, so it reads the same in light and
 * dark. The eyes open once on load and the face perks up when the pointer rests on the brand.
 */
@Component({
  selector: 'app-logo',
  template: `
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect class="lip" y="3" width="40" height="37" rx="11" />
      <rect class="face" width="40" height="37" rx="11" />
      <rect class="screen" x="6" y="5.5" width="28" height="17" rx="5" />
      <ellipse class="eye eye--l" cx="14.6" cy="12.8" rx="2.4" ry="3.3" />
      <ellipse class="eye eye--r" cx="25.4" cy="12.8" rx="2.4" ry="3.3" />
      <path class="smile" d="M16.2 17.8Q20 20.8 23.8 17.8" />
      <rect class="key key--b" x="6" y="26" width="7.4" height="5.6" rx="2" />
      <rect class="key key--w" x="16.3" y="26" width="7.4" height="5.6" rx="2" />
      <rect class="key key--y" x="26.6" y="26" width="7.4" height="5.6" rx="2" />
    </svg>
  `,
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Logo {}
