import { TestBed } from '@angular/core/testing';
import { Theme } from './theme';

describe('Theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('starts from the system and switches to the other theme on toggle', () => {
    const theme = TestBed.inject(Theme);
    const first = theme.current();
    theme.toggle();
    expect(theme.current()).toBe(first === 'dark' ? 'light' : 'dark');
    expect(localStorage.getItem('theme')).toBe(theme.current());
  });

  it('writes the choice to <html> so the stylesheet can follow it', () => {
    const theme = TestBed.inject(Theme);
    theme.toggle();
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe(theme.current());
    theme.toggle();
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe(theme.current());
  });
});
