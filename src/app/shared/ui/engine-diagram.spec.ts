import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CALCULATORS } from '../../core/registry/calculators';
import { EngineDiagram } from './engine-diagram';

describe('EngineDiagram', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [EngineDiagram],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(EngineDiagram);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const live = CALCULATORS.filter((c) => c.status === 'live');

  it('puts every calculator into the engine, each linking to its page with its own answer', async () => {
    const el = await render();
    const chips = Array.from(el.querySelectorAll<HTMLAnchorElement>('app-calc-chips a'));
    expect(chips).toHaveLength(live.length);
    expect(chips.map((a) => a.querySelector('.name')?.textContent?.trim())).toEqual(
      live.map((c) => c.short),
    );
    expect(chips[0].getAttribute('href')).toBe('/calculators/home-loan-emi');
    for (const a of chips) expect(a.querySelector('.fig')?.textContent?.trim()).toBeTruthy();
  });

  it('has one engine and three things that read its result', async () => {
    const el = await render();
    expect(el.querySelector('.node--engine')?.textContent).toContain(`${live.length} calculators`);
    expect(Array.from(el.querySelectorAll('.out h3')).map((h) => h.textContent?.trim())).toEqual([
      'Figure and chart',
      'Table of working',
      'Worked example',
    ]);
    expect(el.querySelector('.out .formula')?.textContent).toContain('BMI = weight');
  });

  it('draws a wire with one branch per box on each side, and keeps the wires out of the reading order', async () => {
    const el = await render();
    const fans = Array.from(el.querySelectorAll('app-engine-fan'));
    expect(fans.map((f) => [f.getAttribute('data-flow'), f.querySelectorAll('i').length])).toEqual([
      ['in', live.length],
      ['out', 3],
    ]);
    for (const f of fans) expect(f.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.link')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('says what stays in the browser', async () => {
    const el = await render();
    expect(el.querySelector('.flow__cap')?.textContent).toContain('Nothing you type is uploaded');
  });
});
