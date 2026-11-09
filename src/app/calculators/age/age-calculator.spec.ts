import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DATE_PROVIDERS } from '../../core/dates/date-providers';
import { AgeCalculator } from './age-calculator';

describe('AgeCalculator', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [AgeCalculator],
      providers: [provideRouter([]), ...DATE_PROVIDERS],
    }).compileComponents();
    const fixture = TestBed.createComponent(AgeCalculator);
    await fixture.whenStable();
    return fixture;
  }

  it('has no chart, only the figures', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    expect(el.querySelector('app-donut')).toBeNull();
    expect(el.querySelector('.rows .row')).toBeTruthy();
  });

  it('sets the Age on date back to today from the button beside it', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const today = el.querySelector<HTMLButtonElement>('.today')!;
    expect(today.disabled).toBe(true); // it starts as today

    (fixture.componentInstance as any).asOf.set(new Date(2030, 0, 1));
    await fixture.whenStable();
    expect(today.disabled).toBe(false);

    today.click();
    await fixture.whenStable();
    expect(today.disabled).toBe(true);
  });
});
