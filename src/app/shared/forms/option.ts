import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

let nextId = 0;

/**
 * An optional extra: a title, a line of help, a switch, and fields that open when it is on.
 * The text is clickable too (the switch alone is a small target). Closed fields are `inert`,
 * so they take no focus and are hidden from screen readers.
 */
@Component({
  selector: 'app-option',
  imports: [MatSlideToggleModule],
  templateUrl: './option.html',
  styleUrl: './option.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Option {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly on = model(false);

  protected readonly titleId = `opt-${nextId++}`;
}
