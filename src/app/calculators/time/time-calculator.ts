import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { trackCalculation } from '../../core/analytics';
import { formatPlain } from '../../core/formatting/format';
import { NumberField } from '../../shared/forms/number-field';
import { CalcShell } from '../../shared/layout/calc-shell';
import { Explainer } from '../../shared/layout/explainer';
import { dayOffsetText, formatClock, formatClock12, formatSpan, shiftTime, timeBetween, toMinutes } from './time.engine';
import { buildTimeBetweenExplainer, buildTimeShiftExplainer } from './time.explainer';

type Mode = 'between' | 'shift';

@Component({
  selector: 'app-time-calculator',
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule, CalcShell, Explainer, NumberField],
  templateUrl: './time-calculator.html',
  styleUrl: './time-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeCalculator {
  protected readonly mode = signal<Mode>('between');
  protected readonly sign = signal<1 | -1>(1);

  protected readonly startH = signal(9);
  protected readonly startM = signal(30);
  protected readonly endH = signal(17);
  protected readonly endM = signal(45);
  protected readonly spanH = signal(2);
  protected readonly spanM = signal(45);

  private readonly start = computed(() => toMinutes(this.startH(), this.startM()));
  private readonly end = computed(() => toMinutes(this.endH(), this.endM()));
  private readonly delta = computed(() => this.sign() * toMinutes(this.spanH(), this.spanM()));

  protected readonly between = computed(() => timeBetween(this.start(), this.end()));
  protected readonly moved = computed(() => shiftTime(this.start(), this.delta()));

  protected readonly heroText = computed(() =>
    this.mode() === 'shift' ? formatClock(this.moved().minutes) : formatSpan(this.between()),
  );

  protected readonly noteText = computed(() => {
    if (this.mode() === 'shift') {
      const m = this.moved();
      return `${formatClock12(m.minutes)}. ${dayOffsetText(m.dayOffset)}.`;
    }
    return this.end() < this.start() ? 'The end time is on the next day.' : '';
  });

  protected readonly rows = computed(() => {
    if (this.mode() === 'shift') {
      return [
        { label: 'Start time', value: `${formatClock(this.start())} (${formatClock12(this.start())})` },
        { label: this.sign() === 1 ? 'Added' : 'Subtracted', value: formatSpan(Math.abs(this.delta())) },
      ];
    }
    const m = this.between();
    return [
      { label: 'In decimal hours', value: formatPlain(m / 60, 2) },
      { label: 'In minutes', value: formatPlain(m) },
      { label: 'Start and end', value: `${formatClock12(this.start())} to ${formatClock12(this.end())}` },
    ];
  });

  protected readonly explainer = computed(() =>
    this.mode() === 'shift'
      ? buildTimeShiftExplainer(this.start(), this.delta(), this.moved())
      : buildTimeBetweenExplainer(this.start(), this.end(), this.between()),
  );

  constructor() {
    // Nothing the visitor entered is sent, only that the calculator was used
    trackCalculation('time', () => [this.mode(), this.sign(), this.start(), this.end(), this.delta()]);
  }

  protected setMode(next: Mode): void {
    if (next) this.mode.set(next);
  }

  protected setSign(next: 1 | -1): void {
    if (next) this.sign.set(next);
  }

  protected reset(): void {
    this.mode.set('between');
    this.sign.set(1);
    this.startH.set(9);
    this.startM.set(30);
    this.endH.set(17);
    this.endM.set(45);
    this.spanH.set(2);
    this.spanM.set(45);
  }
}
