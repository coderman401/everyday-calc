import { dayOffsetText, formatClock, formatClock12, formatSpan, shiftTime, timeBetween, toMinutes } from './time.engine';

describe('time engine', () => {
  it('finds the time between two times', () => {
    expect(timeBetween(toMinutes(9, 30), toMinutes(17, 45))).toBe(495);
    expect(formatSpan(495)).toBe('8 h 15 min');
  });

  it('treats an earlier end as the next day, and equal times as zero', () => {
    expect(timeBetween(toMinutes(22, 0), toMinutes(6, 0))).toBe(480);
    expect(timeBetween(600, 600)).toBe(0);
  });

  it('moves a time across midnight in both directions', () => {
    expect(shiftTime(toMinutes(23, 0), 150)).toEqual({ minutes: 90, dayOffset: 1 });
    expect(shiftTime(toMinutes(1, 0), -120)).toEqual({ minutes: 1380, dayOffset: -1 });
    expect(shiftTime(toMinutes(9, 0), 60)).toEqual({ minutes: 600, dayOffset: 0 });
    expect(dayOffsetText(2)).toBe('2 days later');
  });

  it('formats 24-hour and 12-hour clocks', () => {
    expect(formatClock(toMinutes(9, 5))).toBe('09:05');
    expect(formatClock12(0)).toBe('12:00 am');
    expect(formatClock12(toMinutes(12, 0))).toBe('12:00 pm');
    expect(formatClock12(toMinutes(17, 45))).toBe('5:45 pm');
  });
});
