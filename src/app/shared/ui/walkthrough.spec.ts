import { TestBed } from '@angular/core/testing';
import { calculateLoan } from '../../calculators/loan/loan.engine';
import { formatInr } from '../../core/formatting/format';
import { SAMPLE, SAMPLE_INPUT, SAMPLE_STEPS } from './sample-loan';
import { Walkthrough } from './walkthrough';

describe('Walkthrough', () => {
  async function render() {
    await TestBed.configureTestingModule({ imports: [Walkthrough] }).compileComponents();
    const fixture = TestBed.createComponent(Walkthrough);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('follows the three steps in order, each with a screen', async () => {
    const el = await render();
    const steps = Array.from(el.querySelectorAll('.step'));
    expect(steps.map((s) => s.querySelector('h3')?.textContent?.trim())).toEqual([
      'Enter your loan',
      'Read it year by year',
      'Check the working',
    ]);
    for (const s of steps)
      expect(s.querySelector('.screen')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the figures the loan engine itself gives for the calculator defaults', async () => {
    const el = await render();
    const expected = calculateLoan(SAMPLE_INPUT);
    expect(SAMPLE.emi).toBeCloseTo(expected.emi, 6);
    // the EMI is in the words, so it is not only in the picture
    expect(el.querySelector('.step')?.textContent).toContain(formatInr(expected.emi));
    expect(el.querySelector('app-loan-screen .hero-fig')?.textContent).toContain(
      formatInr(expected.emi),
    );
  });

  it("lists the first years of the schedule and the explainer's worked steps", async () => {
    const el = await render();
    expect(el.querySelectorAll('app-schedule-screen .yr:not(.head)')).toHaveLength(6);
    expect(el.querySelectorAll('app-working-screen .work li')).toHaveLength(SAMPLE_STEPS.length);
    expect(el.querySelector('app-working-screen .formula')?.textContent).toContain('EMI = P × r');
  });
});
