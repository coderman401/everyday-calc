import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CALCULATORS } from '../../core/registry/calculators';
import { Home } from './home';

describe('Home', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    return fixture;
  }

  it('shows a live sample worked by the loan engine', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    expect(el.querySelector('.sample .hero-fig')?.textContent).toContain('₹43,391');
    expect(el.querySelector('.sample app-donut svg')).toBeTruthy();
  });

  it('re-works the sample when a tenure is chosen', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    [...el.querySelectorAll<HTMLButtonElement>('.sample mat-button-toggle button')]
      .find((b) => b.textContent?.includes('30 yrs'))
      ?.click();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 700)); // the figure counts up to its new value
    // ₹50 lakh at 8.5% over 30 years is about ₹38,446 a month
    expect(el.querySelector('.sample .note')?.textContent).toContain('30 years');
    expect(el.querySelector('.sample .hero-fig')?.textContent).toContain('₹38,4');
  });

  it('asks everyday questions and shows how one engine feeds every number', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    expect(el.querySelector('app-walkthrough h2')?.getAttribute('aria-label')).toBe(
      'Everyday Calc, start to finish',
    );
    expect(el.querySelector('app-engine-diagram h2')?.getAttribute('aria-label')).toBe(
      'One engine behind every number',
    );
    // the loan question is worked from the calculator's own defaults, so it agrees with the hero sample
    expect(el.querySelector('app-walkthrough app-answer-card .fig')?.textContent).toContain(
      '₹43,391',
    );
  });

  it('gives every calculator a card with its own worked example', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    const tiles = el.querySelectorAll('.tile');
    expect(tiles).toHaveLength(CALCULATORS.length);
    for (const t of Array.from(tiles)) {
      expect(t.querySelector('.tile__figure')?.textContent?.trim()).toBeTruthy();
      expect(t.querySelector('.tile__caption')?.textContent?.trim()).toBeTruthy();
    }
  });
});
