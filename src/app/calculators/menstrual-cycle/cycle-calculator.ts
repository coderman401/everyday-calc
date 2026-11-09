import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { addDays, diffDays, formatDate, formatDateLong, formatDay, relativeDays, startOfDay } from '../../core/dates/dates';
import { trackCalculation } from '../../core/analytics';
import { CalcShell } from '../../shared/layout/calc-shell';
import { DataTable } from '../../shared/layout/data-table';
import { DateField } from '../../shared/forms/date-field';
import { Donut, type Slice } from '../../shared/charts/donut-chart';
import { Explainer } from '../../shared/layout/explainer';
import { NumberField } from '../../shared/forms/number-field';
import { calculateCycle } from './cycle.engine';
import { buildCycleExplainer } from './cycle.explainer';
import { PHASE_GUIDE } from './cycle.phases';

const TODAY = startOfDay(new Date());
const DEFAULT_LAST = addDays(TODAY, -10);

const COLORS: Record<string, string> = {
  period: 'var(--c-high)',
  before: 'color-mix(in srgb, var(--muted) 45%, transparent)',
  fertile: 'var(--c-gain)',
  after: 'var(--c-principal)',
};

@Component({
  selector: 'app-cycle-calculator',
  imports: [MatButtonModule, MatIconModule, CalcShell, DataTable, DateField, Donut, Explainer, NumberField],
  templateUrl: './cycle-calculator.html',
  styleUrl: './cycle-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CycleCalculator {
  protected readonly lastPeriod = signal(DEFAULT_LAST);
  protected readonly cycleLength = signal(28);
  protected readonly periodLength = signal(5);

  protected readonly minLast = addDays(TODAY, -365);
  protected readonly maxLast = TODAY;

  protected readonly result = computed(() =>
    calculateCycle({
      lastPeriod: this.lastPeriod(),
      cycleLength: this.cycleLength(),
      periodLength: this.periodLength(),
      today: TODAY,
    }),
  );

  protected readonly phases = computed(() => this.result().phases.filter((p) => p.days > 0));

  protected readonly slices = computed<Slice[]>(() =>
    this.phases().map((p) => ({ id: p.id, label: p.label, value: p.days, color: COLORS[p.id] })),
  );

  /** The phase you are in today, when the last period has begun. */
  protected readonly currentPhase = computed(() => {
    const day = this.result().cycleDay;
    if (day === null) return null;
    return this.phases().find((p) => day >= p.fromDay && day <= p.toDay)?.id ?? null;
  });

  /** Highlighted on the ring when its card or row is hovered or focused. */
  protected readonly activePhase = signal<string | null>(null);

  protected readonly guide = computed(() =>
    this.phases().map((p) => ({
      phase: p,
      info: PHASE_GUIDE[p.id],
      range: p.fromDay === p.toDay ? `Day ${p.fromDay}` : `Days ${p.fromDay} to ${p.toDay}`,
      dates: this.phaseDates(p.fromDay, p.toDay),
    })),
  );

  /** The dates of a phase in the cycle you are in now (or the next, if the last one is over). */
  private phaseDates(from: number, to: number): string {
    const start = this.result().focus.start;
    return `${formatDay(addDays(start, from - 1))} to ${formatDay(addDays(start, to - 1))}`;
  }

  protected readonly colorOf = (id: string) => COLORS[id];

  protected readonly nextDay = computed(() => formatDay(this.result().next.start));
  protected readonly nextNote = computed(() => {
    const r = this.result();
    return `${relativeDays(r.daysToNext)}, on ${formatDateLong(r.next.start)}`;
  });

  protected readonly centreLabel = computed(() => `of ${this.cycleLength()} days`);
  protected readonly centreValue = computed(() => {
    const d = this.result().cycleDay;
    return d === null ? 'Not yet' : `Day ${d}`;
  });

  protected readonly summary = computed(() => {
    const r = this.result();
    const day = r.cycleDay === null ? 'The last period you entered has not started yet.' : `Today is cycle day ${r.cycleDay}.`;
    return `${day} ${this.phases().map((p) => `${p.label}: days ${p.fromDay} to ${p.toDay}`).join('; ')}.`;
  });

  protected readonly ovulationText = computed(() => {
    const f = this.result().focus;
    const away = diffDays(TODAY, f.ovulation);
    return { date: formatDateLong(f.ovulation), when: relativeDays(away) };
  });

  protected readonly fertileText = computed(() => {
    const f = this.result().focus;
    const away = diffDays(TODAY, f.fertileStart);
    return {
      range: `${formatDay(f.fertileStart)} to ${formatDay(f.fertileEnd)}`,
      when: away > 0 ? `starts ${relativeDays(away)}` : 'under way now',
    };
  });

  protected readonly tableRows = computed(() =>
    this.result().cycles.map((c, i) => [
      i === 0 && this.result().current ? `${formatDate(c.start)} (this cycle)` : formatDate(c.start),
      formatDay(c.periodEnd),
      formatDay(c.ovulation),
      `${formatDay(c.fertileStart)} to ${formatDay(c.fertileEnd)}`,
    ]),
  );

  protected readonly barText = computed(() => `${this.nextDay()}, ${relativeDays(this.result().daysToNext)}`);

  protected readonly explainer = computed(() =>
    buildCycleExplainer(
      { lastPeriod: this.lastPeriod(), cycleLength: this.cycleLength(), periodLength: this.periodLength() },
      this.result(),
    ),
  );

  constructor() {
    // Health data: nothing the visitor entered is sent, only that the calculator was used
    trackCalculation('menstrual-cycle', () => this.result());
  }

  protected reset(): void {
    this.lastPeriod.set(DEFAULT_LAST);
    this.cycleLength.set(28);
    this.periodLength.set(5);
  }
}
