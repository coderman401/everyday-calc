import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Fruit } from '../../shared/ui/fruit-icon';
import { TRIMESTERS } from './pregnancy.trimesters';
import { WEEKS, article, formatLength, formatWeight, weekInfo } from './pregnancy.weeks';

/**
 * Every week of the 40, as tiles. The week you are in is marked and open; tap any other week to
 * read about it. Tiles are real buttons, so the keyboard works and the picked one is announced.
 */
@Component({
  selector: 'app-week-guide',
  imports: [MatButtonModule, Fruit],
  templateUrl: './week-guide.html',
  styleUrl: './week-guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekGuide {
  /** Completed weeks of pregnancy, 0 to 40 and beyond. */
  readonly current = input.required<number>();
  readonly started = input(true);

  private readonly picked = signal<number | null>(null);

  protected readonly currentWeek = computed(() => Math.min(40, Math.max(1, this.current())));
  protected readonly shown = computed(() => this.picked() ?? this.currentWeek());
  protected readonly info = computed(() => weekInfo(this.shown() === this.currentWeek() ? this.current() : this.shown()));

  protected readonly trimester = computed(() => (this.shown() < 14 ? 1 : this.shown() < 28 ? 2 : 3));
  protected readonly trimesterName = computed(() => TRIMESTERS[this.trimester() - 1].name);

  protected readonly title = computed(() => {
    const i = this.info();
    return i.name ? `About the size of ${article(i.name)} ${i.name}` : 'No embryo yet';
  });

  protected readonly length = computed(() => formatLength(this.info().cm));
  protected readonly weight = computed(() => formatWeight(this.info().g));

  protected readonly groups = TRIMESTERS.map((t) => ({
    t,
    weeks: WEEKS.filter((w) => (t.id === 1 ? w.week < 14 : t.id === 2 ? w.week >= 14 && w.week < 28 : w.week >= 28)),
  }));

  protected pick(week: number): void {
    this.picked.set(week === this.currentWeek() ? null : week);
  }

  protected backToCurrent(): void {
    this.picked.set(null);
  }
}
