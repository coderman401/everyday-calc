import { TestBed } from '@angular/core/testing';
import { CALCULATORS } from '../../core/registry/calculators';
import { formatInr } from '../../core/formatting/format';
import { EngineDiagram } from './engine-diagram';
import { SAMPLE } from './sample-loan';

describe('EngineDiagram', () => {
  async function render() {
    await TestBed.configureTestingModule({ imports: [EngineDiagram] }).compileComponents();
    const fixture = TestBed.createComponent(EngineDiagram);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('has what you enter, the engine and three readers of its result', async () => {
    const el = await render();
    expect(el.querySelector('.node--in')?.textContent).toContain('₹50,00,000');
    expect(el.querySelector('.node--engine h3')?.textContent).toContain('maths');
    expect(Array.from(el.querySelectorAll('.out h3')).map((h) => h.textContent?.trim())).toEqual([
      'Figure and chart',
      'Year-by-year schedule',
      'Worked example',
    ]);
  });

  it("shows the engine's own numbers and the number of calculators", async () => {
    const el = await render();
    expect(el.querySelector('.out')?.textContent).toContain(formatInr(SAMPLE.emi));
    expect(el.querySelectorAll('.out')[1].textContent).toContain(`${SAMPLE.years.length} rows`);
    expect(el.querySelector('.node--engine')?.textContent).toContain(
      `${CALCULATORS.length} calculators`,
    );
  });

  it('keeps the wires out of the reading order and says what stays in the browser', async () => {
    const el = await render();
    expect(el.querySelector('.link')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('app-engine-fan')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.flow__cap')?.textContent).toContain('Nothing you type is uploaded');
  });
});
