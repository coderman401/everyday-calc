import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CALCULATORS } from '../../core/registry/calculators';
import { formatInr } from '../../core/formatting/format';
import { TileVisual, type TileVisualSpec } from '../charts/tile-visual';
import { EngineFan } from './engine-fan';
import { SAMPLE, SAMPLE_FORMULA, SAMPLE_INPUT, SAMPLE_YEARS } from './sample-loan';

/**
 * "One engine behind every number": what happens between typing a number and reading the answer.
 * What you enter goes into the calculator's maths, one plain function that is tested on its own,
 * and three things read from the same result: the figure and chart, the year-by-year schedule and
 * the worked example. They cannot disagree because they never work anything out themselves.
 *
 * The figures are the home loan calculator's defaults, worked by its real engine (see
 * sample-loan). Laid out as a row on wide screens and a column on narrow ones. As it scrolls into
 * view the diagram assembles in the order the data flows; without scroll timelines or with
 * reduced motion it is simply there, complete.
 */
@Component({
  selector: 'app-engine-diagram',
  imports: [EngineFan, MatIconModule, TileVisual],
  templateUrl: './engine-diagram.html',
  styleUrl: './engine-diagram.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineDiagram {
  protected readonly amount = formatInr(SAMPLE_INPUT.principal);
  protected readonly terms = `${SAMPLE_INPUT.annualRate}% for ${SAMPLE_YEARS} years`;
  protected readonly emi = formatInr(SAMPLE.emi);
  protected readonly rows = SAMPLE.years.length;
  protected readonly formula = SAMPLE_FORMULA;
  protected readonly count = CALCULATORS.length;

  protected readonly split: TileVisualSpec = {
    type: 'donut',
    parts: [
      { value: SAMPLE.principal, color: 'var(--c-principal)' },
      { value: SAMPLE.totalInterest, color: 'var(--c-interest)' },
    ],
  };

  /** What you still owe at the start and at the end of every year. */
  protected readonly owed: TileVisualSpec = {
    type: 'line',
    points: [SAMPLE.principal, ...SAMPLE.years.map((y) => y.closing)],
  };
}
