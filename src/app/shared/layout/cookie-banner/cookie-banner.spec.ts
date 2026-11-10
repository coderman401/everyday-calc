import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Consent } from '../../../core/analytics';
import { CookieBanner } from './cookie-banner';

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'calc_consent=; max-age=0; path=/';
  });

  async function render() {
    await TestBed.configureTestingModule({ imports: [CookieBanner], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(CookieBanner);
    await fixture.whenStable();
    return fixture;
  }

  const buttons = (el: HTMLElement) => [...el.querySelectorAll<HTMLButtonElement>('.banner__actions button')];

  it('shows until the visitor chooses, with Accept and Decline side by side and a policy link', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    expect(el.querySelector('.banner')).toBeTruthy();
    expect(buttons(el).map((b) => b.textContent?.trim())).toEqual(['Decline', 'Accept analytics']);
    expect(el.querySelector('a[href="/privacy"]')).toBeTruthy();
    expect(el.querySelector('[role=dialog]')?.getAttribute('aria-labelledby')).toBe('cookie-h');
  });

  it('records the choice and goes away', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    buttons(el)[1].click();
    await fixture.whenStable();
    expect(TestBed.inject(Consent).choice()).toBe('granted');
    expect(el.querySelector('.banner')).toBeNull();
  });

});
