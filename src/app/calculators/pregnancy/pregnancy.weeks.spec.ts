import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DATE_PROVIDERS } from '../../core/dates/date-providers';
import { PregnancyCalculator } from './pregnancy-calculator';
import { WEEKS, article, formatLength, formatWeight, weekInfo } from './pregnancy.weeks';

describe('week by week data', () => {
  it('covers weeks 1 to 40 in order', () => {
    expect(WEEKS.map((w) => w.week)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
  });

  it('has a note and an icon for every week, and a fruit from week 4', () => {
    for (const w of WEEKS) {
      expect(w.note.length).toBeGreaterThan(20);
      expect(w.icon).toBeTruthy();
      if (w.week >= 4) expect(w.name).toBeTruthy();
    }
  });

  it('only grows: length rises, weight never falls', () => {
    const sized = WEEKS.filter((w) => w.cm !== null);
    for (let i = 1; i < sized.length; i++) {
      expect(sized[i].cm!).toBeGreaterThan(sized[i - 1].cm!);
      expect(sized[i].g!).toBeGreaterThanOrEqual(sized[i - 1].g!);
    }
    expect(weekInfo(40).g).toBe(3500);
    expect(weekInfo(12).name).toBe('kiwi');
  });

  it('stays on week 40 with a late note after the due date, and on week 1 before it', () => {
    expect(weekInfo(43).week).toBe(40);
    expect(weekInfo(43).note).toContain('Past the due date');
    expect(weekInfo(0).week).toBe(1);
  });

  it('formats size and weight with both unit systems', () => {
    expect(formatLength(5.4)).toBe('5.4 cm · 2.1 in');
    expect(formatLength(0.1)).toBe('1 mm');
    expect(formatLength(null)).toBe('Not measured yet');
    expect(formatWeight(14)).toBe('14 g · 0.5 oz');
    expect(formatWeight(1500)).toBe('1.5 kg · 3.3 lb');
    expect(formatWeight(0)).toBe('Under 1 g');
    expect(article('avocado')).toBe('an');
    expect(article('kiwi')).toBe('a');
  });
});

describe('PregnancyCalculator guides', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [PregnancyCalculator],
      providers: [provideRouter([]), ...DATE_PROVIDERS],
    }).compileComponents();
    const fixture = TestBed.createComponent(PregnancyCalculator);
    await fixture.whenStable();
    return fixture;
  }

  it('shows this week\'s fruit in the results, and all 40 weeks as tiles', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    expect(el.querySelector('.baby')?.textContent).toContain('size of');
    expect(el.querySelectorAll('.wk')).toHaveLength(40);
    expect(el.querySelectorAll('app-trimester-guide .tg__col')).toHaveLength(3);
    expect(el.querySelectorAll('.wk.is-current')).toHaveLength(1);
  });

  it('opens another week when its tile is pressed, and goes back', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const tile = [...el.querySelectorAll<HTMLButtonElement>('.wk')].find((b) => b.getAttribute('aria-label')?.startsWith('Week 28,'))!;
    tile.click();
    await fixture.whenStable();
    expect(el.querySelector('.wg__detail h3')?.textContent).toContain('eggplant');
    expect(el.querySelector('.wg__detail')?.textContent).toContain('Third trimester');

    el.querySelector<HTMLButtonElement>('.wg__back')!.click();
    await fixture.whenStable();
    expect(el.querySelector('.wg__back')).toBeNull();
  });
});
