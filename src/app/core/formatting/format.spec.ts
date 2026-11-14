import {
  formatCompactInr,
  formatDuration,
  formatInr,
  formatPlain,
  formatWords,
  parseNumber,
} from './format';

describe('format', () => {
  it('groups rupees the Indian way', () => {
    expect(formatInr(5_000_000)).toBe('₹50,00,000');
    expect(formatInr(43391.16)).toBe('₹43,391');
    expect(formatPlain(1234567)).toBe('12,34,567');
    expect(formatPlain(8.5, 2)).toBe('8.5');
  });

  it('says amounts in lakh and crore', () => {
    expect(formatWords(5_000_000)).toBe('₹50 lakh');
    expect(formatWords(12_000_000)).toBe('₹1.2 crore');
    expect(formatWords(75_000)).toBe('₹75,000');
  });

  it('shortens amounts for chart axes', () => {
    expect(formatCompactInr(0)).toBe('₹0');
    expect(formatCompactInr(50_000)).toBe('₹50K');
    expect(formatCompactInr(200_000)).toBe('₹2L');
    expect(formatCompactInr(150_000)).toBe('₹1.5L');
    expect(formatCompactInr(15_000_000)).toBe('₹1.5Cr');
  });

  it('words durations', () => {
    expect(formatDuration(240)).toBe('20 yrs');
    expect(formatDuration(12)).toBe('1 yr');
    expect(formatDuration(208)).toBe('17 yrs 4 mos');
    expect(formatDuration(8)).toBe('8 mos');
    expect(formatDuration(1)).toBe('1 mo');
  });

  it('parses typed numbers and rejects the rest', () => {
    expect(parseNumber('50,00,000')).toBe(5_000_000);
    expect(parseNumber('₹ 1,00,000')).toBe(100_000);
    expect(parseNumber('8.25')).toBe(8.25);
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('1e5')).toBeNull();
    expect(parseNumber('-5')).toBeNull();
    expect(parseNumber('.')).toBeNull();
  });
});
