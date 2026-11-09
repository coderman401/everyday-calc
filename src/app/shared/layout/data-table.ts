import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A card with a heading and a table of ready-formatted strings. The first column reads left,
 * the rest are figures and align right. A long table scrolls inside the card with its header
 * pinned; the scroll area is focusable so the keyboard can reach it.
 */
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable {
  readonly heading = input.required<string>();
  readonly lead = input('');
  readonly columns = input.required<string[]>();
  readonly rows = input.required<string[][]>();
}
