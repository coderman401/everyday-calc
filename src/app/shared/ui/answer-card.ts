import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TileVisual } from '../charts/tile-visual';
import type { Everyday } from './everyday';

/**
 * What one calculator looks like answering one question: what you enter, what you get, and the
 * first lines of its working. A flat card in the app's own parts. It is decorative (the home
 * page's text says the same in words), so the page hides it from assistive technology.
 *
 * Where the walkthrough pins its cards, each part arrives in turn as the card's step scrolls in,
 * read from the step's timeline (`--tl`, set on the step). Elsewhere the finished card is simply
 * there.
 */
@Component({
  selector: 'app-answer-card',
  imports: [MatIconModule, TileVisual],
  templateUrl: './answer-card.html',
  styleUrl: './answer-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerCard {
  readonly sum = input.required<Everyday>();
}
