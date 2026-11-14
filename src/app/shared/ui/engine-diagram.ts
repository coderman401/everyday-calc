import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CALCULATORS } from '../../core/registry/calculators';
import { TileVisual } from '../charts/tile-visual';
import { CalcChips } from './calc-chips';
import { EngineFan } from './engine-fan';
import { BMI_FORMULA } from './everyday';
import { examples } from './examples';

/**
 * "One engine behind every number": every calculator in the app, each with the answer it gives
 * for its own example, all built the same way. What you type goes into the calculator's maths, one
 * plain function that is tested on its own, and three things read from its result: the figure and
 * chart, the table of working and the worked example. They cannot disagree because none of them
 * works anything out itself.
 *
 * A row on wide screens (nine calculators, one engine, three readers) and a column on narrow ones.
 * As it scrolls into view it assembles in the order the data flows, and without scroll timelines or
 * with reduced motion it is simply there, complete. The figures are the calculators' own, from
 * their engines (see examples).
 */
@Component({
  selector: 'app-engine-diagram',
  imports: [CalcChips, EngineFan, MatIconModule, TileVisual],
  templateUrl: './engine-diagram.html',
  styleUrl: './engine-diagram.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineDiagram {
  protected readonly headWords = 'One engine behind every number'.split(' ');
  protected readonly count = CALCULATORS.filter((c) => c.status === 'live').length;
  protected readonly split = examples()['home-loan-emi'].visual;
  protected readonly formula = BMI_FORMULA;
}
