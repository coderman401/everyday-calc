import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { addDays, diffDays, formatDate, formatDateLong, relativeDays, startOfDay } from '../../core/dates/dates';
import { trackCalculation } from '../../core/analytics';
import { CalcShell } from '../../shared/layout/calc-shell';
import { DataTable } from '../../shared/layout/data-table';
import { DateField } from '../../shared/forms/date-field';
import { Explainer } from '../../shared/layout/explainer';
import { NumberField } from '../../shared/forms/number-field';
import { Fruit } from '../../shared/ui/fruit-icon';
import { Scale, type ScaleSegment } from '../../shared/charts/scale';
import { calculatePregnancy, type Method } from './pregnancy.engine';
import { buildPregnancyExplainer } from './pregnancy.explainer';
import { article, formatLength, formatWeight, weekInfo } from './pregnancy.weeks';
import { TrimesterGuide } from './trimester-guide';
import { WeekGuide } from './week-guide';

const TODAY = startOfDay(new Date());
const DEFAULT_LMP = addDays(TODAY, -12 * 7 - 3);

const SEGMENTS: ScaleSegment[] = [
  {
    id: '1',
    label: 'First trimester',
    range: 'weeks 1 to 13',
    from: 0,
    to: 14,
    color: 'color-mix(in srgb, var(--accent) 35%, var(--card))',
  },
  {
    id: '2',
    label: 'Second trimester',
    range: 'weeks 14 to 27',
    from: 14,
    to: 28,
    color: 'color-mix(in srgb, var(--accent) 65%, var(--card))',
  },
  { id: '3', label: 'Third trimester', range: 'weeks 28 to 40', from: 28, to: 40, color: 'var(--accent)' },
];

@Component({
  selector: 'app-pregnancy-calculator',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    CalcShell,
    DataTable,
    DateField,
    Explainer,
    NumberField,
    Scale,
    Fruit,
    WeekGuide,
    TrimesterGuide,
  ],
  templateUrl: './pregnancy-calculator.html',
  styleUrl: './pregnancy-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PregnancyCalculator {
  protected readonly method = signal<Method>('lmp');
  protected readonly date = signal(DEFAULT_LMP);
  protected readonly cycleLength = signal(28);

  protected readonly minDate = addDays(TODAY, -300);
  protected readonly maxDate = TODAY;
  protected readonly segments = SEGMENTS;

  protected readonly result = computed(() =>
    calculatePregnancy({
      method: this.method(),
      date: this.date(),
      cycleLength: this.cycleLength(),
      today: TODAY,
    }),
  );

  protected readonly dateLabel = computed(() =>
    this.method() === 'lmp' ? 'First day of your last period' : 'Date of conception',
  );

  protected readonly dueText = computed(() => formatDate(this.result().due));

  protected readonly dueNote = computed(() => {
    const r = this.result();
    const day = formatDateLong(r.due);
    if (r.state === 'overdue') return `${day}. ${-r.daysToDue} days past the due date.`;
    return `${day}. ${r.daysToDue} days to go.`;
  });

  protected readonly progress = computed(() => {
    const r = this.result();
    if (r.state === 'notStarted') return 'Not started yet by this date';
    const w = `${r.weeks} ${r.weeks === 1 ? 'week' : 'weeks'} ${r.days} ${r.days === 1 ? 'day' : 'days'}`;
    return `${w} pregnant`;
  });

  protected readonly markerText = computed(() => {
    const r = this.result();
    return `${r.weeks}w ${r.days}d`;
  });

  /** Completed weeks, for the week guide; before the start it stays on week 1. */
  protected readonly weeksDone = computed(() => (this.result().state === 'notStarted' ? 0 : this.result().weeks));
  protected readonly started = computed(() => this.result().state !== 'notStarted');

  protected readonly baby = computed(() => {
    const r = this.result();
    const i = weekInfo(r.state === 'overdue' ? 41 : Math.max(1, r.weeks));
    return {
      icon: i.icon,
      tone: i.tone,
      title: i.name ? `Baby is about the size of ${article(i.name)} ${i.name}` : 'No embryo yet this week',
      facts: i.cm === null ? '' : `${formatLength(i.cm)}  ·  ${formatWeight(i.g)}`,
    };
  });

  protected readonly activeId = computed(() => String(this.result().trimester));

  protected readonly scaleSummary = computed(() => {
    const r = this.result();
    return `${this.progress()}, trimester ${r.trimester}. The scale runs from week 0 to week 40.`;
  });

  protected readonly rows = computed(() => {
    const r = this.result();
    const trimester = ['First', 'Second', 'Third'][r.trimester - 1] + ' trimester';
    return [
      { label: 'Trimester', value: r.state === 'notStarted' ? '–' : trimester },
      {
        label: 'Conception (estimated)',
        value: formatDate(r.conception),
        sub: relativeDays(diffDays(TODAY, r.conception)),
      },
    ];
  });

  protected readonly tableRows = computed(() =>
    this.result().milestones.map((m) => [m.label, `${m.week} weeks`, formatDate(m.date)]),
  );

  protected readonly barText = computed(() => `${this.dueText()} · ${this.progress()}`);

  protected readonly explainer = computed(() =>
    buildPregnancyExplainer(
      { method: this.method(), date: this.date(), cycleLength: this.cycleLength() },
      this.result(),
    ),
  );

  constructor() {
    // Health data: only which method was used is sent, never a date
    trackCalculation(
      'pregnancy',
      () => this.result(),
      () => ({ method: this.method() }),
    );
  }

  protected setMethod(next: Method): void {
    if (!next || next === this.method()) return;
    // Keep the same moment on screen: conception falls 14 days after the last period starts.
    this.date.set(addDays(this.date(), next === 'conception' ? 14 : -14));
    if (this.date() > TODAY) this.date.set(TODAY);
    this.method.set(next);
  }

  protected reset(): void {
    this.method.set('lmp');
    this.date.set(DEFAULT_LMP);
    this.cycleLength.set(28);
  }
}
