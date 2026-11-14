import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CATEGORIES, calculatorPath } from '../../core/registry/calculators';
import { AnswerCard } from './answer-card';
import { EVERYDAY } from './everyday';
import { Mascot } from './mascot';

/**
 * "Everyday Calc, start to finish": five questions from an ordinary day, each taken from the
 * question to an answer you can check, by a different calculator. A question and a few lines of
 * what to type on one side, a card of what you would see on the other (see answer-card).
 *
 * Wide screens that support scroll timelines pin the cards while the questions scroll past. The
 * card, the plate of colour behind it and Tally all follow the scroll: each question's words spring
 * up as it arrives, the card swaps and its parts arrive in turn, the plate changes colour and
 * Tally hops at every handover (see the scss). Everywhere else the questions stack, each beside or
 * above its own card, and nothing is hidden.
 */
@Component({
  selector: 'app-walkthrough',
  imports: [AnswerCard, MatIconModule, Mascot, RouterLink],
  templateUrl: './walkthrough.html',
  styleUrl: './walkthrough.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Walkthrough {
  protected readonly headWords = 'Everyday Calc, start to finish'.split(' ');

  protected readonly items = EVERYDAY.map((sum) => ({
    sum,
    words: sum.question.split(' '),
    group: CATEGORIES.find((c) => c.id === sum.info.category)!.label,
    path: calculatorPath(sum.info),
  }));
}
