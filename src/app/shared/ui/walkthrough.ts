import { ChangeDetectionStrategy, Component } from '@angular/core';
import { formatInr } from '../../core/formatting/format';
import { SAMPLE, SAMPLE_INPUT, SAMPLE_YEARS } from './sample-loan';
import { LoanScreen, ScheduleScreen, WorkingScreen } from './walk-screens';

/**
 * "Everyday Calc, start to finish": one home loan followed through the three things every
 * calculator does. Each step is a heading and a few lines, with a flat screen of what you would
 * see (see walk-screens). The figures come from the real engine and explainer through sample-loan,
 * so they are the calculator's own, and the text carries them in words for anyone who cannot see
 * the screens.
 *
 * Wide screens that support scroll timelines pin the screens in place while the steps scroll past,
 * and each screen takes over from the last (see the scss). Everywhere else the steps simply
 * stack, each beside or above its own screen, and nothing is hidden.
 */
@Component({
  selector: 'app-walkthrough',
  imports: [LoanScreen, ScheduleScreen, WorkingScreen],
  templateUrl: './walkthrough.html',
  styleUrl: './walkthrough.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Walkthrough {
  protected readonly emi = formatInr(SAMPLE.emi);
  protected readonly loan = `${formatInr(SAMPLE_INPUT.principal)} at ${SAMPLE_INPUT.annualRate}% for ${SAMPLE_YEARS} years`;
  protected readonly firstPrincipal = formatInr(SAMPLE.years[0].principal);
  protected readonly firstInterest = formatInr(SAMPLE.years[0].interest);
}
