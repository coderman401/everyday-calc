import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The mark: Tally's face. A pocket calculator in Ecto Green with a lip underneath, a white screen
 * with big friendly eyes, blushing cheeks and a smile, and three keys. It is flat colour, so it reads the same in light and
 * dark. The eyes open once on load and the face perks up when the pointer rests on the brand.
 */
@Component({
  selector: 'app-logo',
  template: `
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect class="lip" y="3" width="40" height="37" rx="12" />
      <rect class="face" width="40" height="37" rx="12" />
      <rect class="screen" x="5" y="5" width="30" height="20" rx="8" />
      <g class="eye">
        <circle class="pupil" cx="14" cy="13.5" r="3.4" />
        <circle class="glint" cx="15.2" cy="12.2" r="1.2" />
      </g>
      <g class="eye">
        <circle class="pupil" cx="26" cy="13.5" r="3.4" />
        <circle class="glint" cx="27.2" cy="12.2" r="1.2" />
      </g>
      <circle class="cheek" cx="9.3" cy="19.4" r="2.3" />
      <circle class="cheek" cx="30.7" cy="19.4" r="2.3" />
      <path class="smile" d="M17.2 18.6Q20 21.6 22.8 18.6" />
      <rect class="key key--b" x="6" y="28" width="7.4" height="5" rx="2" />
      <rect class="key key--w" x="16.3" y="28" width="7.4" height="5" rx="2" />
      <rect class="key key--y" x="26.6" y="28" width="7.4" height="5" rx="2" />
    </svg>
  `,
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Logo {}
