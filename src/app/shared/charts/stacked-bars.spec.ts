import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StackedBars, niceScale, type BarRow, type BarSeries } from './stacked-bars';

const SERIES: BarSeries[] = [
  { id: 'a', label: 'Principal', color: 'blue' },
  { id: 'b', label: 'Interest', color: 'orange' },
];
const ROWS: BarRow[] = [
  { label: '1', values: [100, 300] },
  { label: '2', values: [150, 250] },
  { label: '3', values: [300, 100] },
];

@Component({
  imports: [StackedBars],
  template: `<app-stacked-bars
    heading="Interest against principal"
    [series]="series"
    [rows]="rows()"
    summary="Three years."
    totalLabel="paid in the year"
  />`,
})
class Host {
  series = SERIES;
  rows = signal(ROWS);
}

describe('niceScale', () => {
  it('rounds the top of the axis to a clean step', () => {
    expect(niceScale(590_844)).toEqual({ max: 600_000, step: 200_000 });
    expect(niceScale(400)).toEqual({ max: 400, step: 100 });
    expect(niceScale(0)).toEqual({ max: 4, step: 1 });
  });
});

describe('StackedBars', () => {
  async function render() {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('draws one bar per row with the first series at the bottom of the stack', async () => {
    const { el } = await render();
    const bars = el.querySelectorAll('.bar');
    expect(bars).toHaveLength(3);
    // drawn top first: interest, then principal
    const segs = bars[0].querySelectorAll<HTMLElement>('.seg');
    expect(segs[0].style.getPropertyValue('--c')).toBe('orange');
    expect(segs[1].style.getPropertyValue('--c')).toBe('blue');
    expect(segs[0].style.getPropertyValue('--v')).toBe('300');
  });

  it('scales every bar against the same axis', async () => {
    const { el } = await render();
    const tops = Array.from(el.querySelectorAll<HTMLElement>('.bar')).map((b) =>
      Number(b.style.getPropertyValue('--top')),
    );
    // every year pays 400 in total, so the bars are equal and fill an axis that tops out at 400
    expect(tops).toEqual([1, 1, 1]);
    expect(el.querySelectorAll('.tick')).toHaveLength(5);
  });

  it('names both series in a legend', async () => {
    const { el } = await render();
    expect(Array.from(el.querySelectorAll('.legend li')).map((l) => l.textContent?.trim())).toEqual(
      ['Principal', 'Interest'],
    );
  });

  it('lets go of a bar that has gone when the rows get fewer', async () => {
    const { fixture, el } = await render();
    const plot = el.querySelector<HTMLElement>('.plot')!;
    plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    await fixture.whenStable();
    expect(el.querySelector('.tip__t')?.textContent).toBe('Year 3');
    fixture.componentInstance.rows.set(ROWS.slice(0, 2));
    await fixture.whenStable();
    expect(el.querySelector('.tip')).toBeNull();
    expect(plot.classList.contains('has-active')).toBe(false);
  });

  it('opens a tooltip from the keyboard and says it aloud', async () => {
    const { fixture, el } = await render();
    const plot = el.querySelector<HTMLElement>('.plot')!;
    expect(el.querySelector('.tip')).toBeNull();
    plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    await fixture.whenStable();
    expect(el.querySelector('.tip__t')?.textContent).toBe('Year 2');
    expect(el.querySelector('.tip')?.textContent).toContain('paid in the year');
    expect(el.querySelector('.sr')?.textContent).toBe('Year 2: 150 principal, 250 interest.');
    plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(el.querySelector('.tip')).toBeNull();
  });
});
