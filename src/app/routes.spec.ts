import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { CALCULATORS } from './core/registry/calculators';

describe('calculator routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
  });

  for (const calc of CALCULATORS) {
    it(`renders ${calc.title} with its working shown`, async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(`/calculators/${calc.slug}`);
      await harness.fixture.whenStable();
      const el = harness.routeNativeElement as HTMLElement;

      expect(el.querySelector('h1')?.textContent).toContain(calc.title);
      // the write-up under every calculator: a formula, a worked example and questions
      expect(el.querySelector('app-explainer .formula')).toBeTruthy();
      expect(el.querySelector('app-explainer .steps li')).toBeTruthy();
      expect(el.querySelector('app-explainer .faq__q')).toBeTruthy();
      // and a results card
      expect(el.querySelector('[slot=results], app-loan-results, app-breakup')).toBeTruthy();
    });
  }

  it('renders the privacy policy with its cookie table and the choice button', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/privacy');
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Privacy policy');
    expect(el.textContent).toContain('_ga');
    expect(el.textContent).toContain('What is never sent');
    expect(el.querySelectorAll('.tbl tbody tr').length).toBeGreaterThanOrEqual(5);
    expect(el.querySelector('.linklike')?.textContent).toContain('cookie settings');
  });

  it('renders the FAQ with every group, open in full', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/faq');
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Frequently asked questions');
    expect(el.querySelectorAll('section.group')).toHaveLength(5);
    expect(el.querySelectorAll('.faq__q').length).toBeGreaterThanOrEqual(15);
    expect(el.querySelectorAll('.faq__a').length).toBe(el.querySelectorAll('.faq__q').length);
    expect(el.querySelector('details')).toBeNull();
  });

  it('sends unknown calculators to the not-found page', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/calculators/nope');
    await harness.fixture.whenStable();
    expect((harness.routeNativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'isn\'t here',
    );
  });
});
