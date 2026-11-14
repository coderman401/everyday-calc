import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CAR_LOAN_CONFIG, HOME_LOAN_CONFIG, type LoanConfig } from './loan.config';
import { LoanCalculator } from './loan-calculator';

describe('LoanCalculator', () => {
  async function render(
    config: LoanConfig = HOME_LOAN_CONFIG,
    params: Record<string, string> = {},
  ) {
    await TestBed.configureTestingModule({
      imports: [LoanCalculator],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(LoanCalculator);
    fixture.componentRef.setInput('config', config);
    for (const [k, v] of Object.entries(params)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
    return fixture;
  }

  it('shows the EMI, interest and total for the default home loan', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.hero-fig')?.textContent).toContain('₹43,391');
    const rows = [...el.querySelectorAll('app-breakup .rows .row__value')].map((d) =>
      d.textContent?.trim(),
    );
    expect(rows).toEqual(['₹50,00,000', '₹54,13,879', '₹1,04,13,879']);
    expect(el.querySelector('app-donut svg')?.getAttribute('aria-label')).toContain('interest');
  });

  it('charts every year of the loan as interest against principal, from the same schedule as the table', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const bars = el.querySelectorAll('app-stacked-bars .bar');
    expect(bars).toHaveLength(20); // 20 years by default
    expect(el.querySelectorAll('app-loan-schedule tbody tr')).toHaveLength(20);
    // Year 1: ₹99,511 of principal and ₹4,21,182 of interest on the default loan
    const first = Array.from(bars[0].querySelectorAll<HTMLElement>('.seg')).map((s) =>
      Math.round(Number(s.style.getPropertyValue('--v'))),
    );
    expect(first).toEqual([421182, 99511]); // interest on top, principal below
    expect(
      Array.from(el.querySelectorAll('app-stacked-bars .legend li')).map((l) =>
        l.textContent?.trim(),
      ),
    ).toEqual(['Principal', 'Interest']);
  });

  it('counts extra payments as principal in the chart and says so', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const lead = () => el.querySelector('app-stacked-bars .sb__lead')?.textContent ?? '';
    const principalOfYear1 = () =>
      Math.round(
        Number(
          el
            .querySelector<HTMLElement>('app-stacked-bars .bar .seg:last-child')!
            .style.getPropertyValue('--v'),
        ),
      );
    expect(lead()).not.toContain('extra payments');
    const plain = principalOfYear1();

    (fixture.componentInstance as unknown as { extraOn: { set(v: boolean): void } }).extraOn.set(
      true,
    );
    await fixture.whenStable();

    expect(lead()).toContain('Your extra payments count as principal.');
    // one extra EMI a year is paid at the end of year 1, so that year clears more of the loan
    expect(principalOfYear1()).toBeGreaterThan(plain);
  });

  it('starts from the amount, rate and years in the address, kept inside the allowed range', async () => {
    const fixture = await render(HOME_LOAN_CONFIG, { amount: '3000000', rate: '9', years: '15' });
    const el = fixture.nativeElement as HTMLElement;
    const fields = [...el.querySelectorAll<HTMLInputElement>('input.num')]
      .slice(0, 3)
      .map((i) => i.value);
    expect(fields).toEqual(['30,00,000', '9', '15']);
  });

  it('clamps wild values from the address and ignores text', async () => {
    const fixture = await render(HOME_LOAN_CONFIG, {
      amount: '999999999999',
      rate: 'abc',
      years: '99',
    });
    const fields = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('input.num'),
    ]
      .slice(0, 3)
      .map((i) => i.value);
    expect(fields).toEqual(['5,00,00,000', '8.5', '30']);
  });

  it('uses the config for a car loan', async () => {
    const fixture = await render(CAR_LOAN_CONFIG);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Car Loan EMI Calculator');
    // ₹8,00,000 at 9% for 5 years
    expect(el.querySelector('.hero-fig')?.textContent).toContain('₹16,607');
  });

  it('shows the extras block only once an option is on', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.save')).toBeNull();
    el.querySelector<HTMLButtonElement>('mat-slide-toggle button')?.click();
    await fixture.whenStable();
    expect(el.querySelector('.save')?.textContent).toContain('Interest saved');
  });

  it('keeps closed options inert', async () => {
    const fixture = await render();
    const body = (fixture.nativeElement as HTMLElement).querySelector('.opt__body');
    expect(body?.hasAttribute('inert')).toBe(true);
  });

  it('converts tenure when the unit changes', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    [...el.querySelectorAll<HTMLButtonElement>('mat-button-toggle button')]
      .find((b) => b.textContent?.includes('Month'))
      ?.click();
    await fixture.whenStable();
    expect(el.querySelectorAll<HTMLInputElement>('input.num')[2].value).toBe('240');
  });

  it('explains the calculation with the entered numbers', async () => {
    const fixture = await render();
    const text =
      (fixture.nativeElement as HTMLElement).querySelector('app-explainer')?.textContent ?? '';
    expect(text).toContain('EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)');
    expect(text).toContain('₹43,391');
  });
});
