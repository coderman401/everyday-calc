import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EVERYDAY } from './everyday';
import { Walkthrough } from './walkthrough';

describe('Walkthrough', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [Walkthrough],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Walkthrough);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('asks each everyday question with its own card', async () => {
    const el = await render();
    const steps = Array.from(el.querySelectorAll('.step'));
    expect(steps).toHaveLength(EVERYDAY.length);
    expect(
      steps.map((s) => s.querySelector('.q')?.textContent?.replace(/\s+/g, ' ').trim()),
    ).toEqual(EVERYDAY.map((e) => e.question));
    for (const s of steps)
      expect(s.querySelector('app-answer-card')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('says each answer in words, so the cards are not the only place it appears', async () => {
    const el = await render();
    EVERYDAY.forEach((e, i) => {
      const ans = el.querySelectorAll('.step')[i].querySelector('.ans')?.textContent ?? '';
      expect(ans).toContain(e.result.label);
      expect(ans).toContain(e.result.figure);
    });
  });

  it('links each question to its calculator', async () => {
    const el = await render();
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.step a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(links).toEqual([
      '/calculators/home-loan-emi',
      '/calculators/sip',
      '/calculators/bmi',
      '/calculators/age',
      '/calculators/pregnancy',
    ]);
  });

  it('shows what you enter, the answer and the working on every card', async () => {
    const el = await render();
    el.querySelectorAll('app-answer-card').forEach((card, i) => {
      expect(card.querySelectorAll('.fld')).toHaveLength(EVERYDAY[i].enter.length);
      expect(card.querySelector('.fig')?.textContent?.trim()).toBe(EVERYDAY[i].result.figure);
      expect(card.querySelectorAll('.work li')).toHaveLength(3);
    });
  });

  it('names a timeline for each step so its card can follow it', async () => {
    const el = await render();
    const names = Array.from(el.querySelectorAll<HTMLElement>('.step')).map((s) =>
      s.style.getPropertyValue('--tl'),
    );
    expect(names).toEqual(['--t1', '--t2', '--t3', '--t4', '--t5']);
  });
});
