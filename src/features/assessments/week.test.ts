import {
  addDays,
  addWeeks,
  formatWeekEndLabel,
  formatWeekRange,
  getLocalToday,
  getWeekEnd,
  getWeekStart,
  isFutureDate,
  listWeeks,
} from '@/features/assessments/week';

describe('getWeekStart (weeks run Monday to Sunday)', () => {
  it.each([
    ['a Friday gives its Monday', '2026-10-02', '2026-09-28'],
    ['a Sunday belongs to the previous Monday', '2026-10-04', '2026-09-28'],
    ['a Monday gives itself', '2026-10-05', '2026-10-05'],
    ['the year boundary gives the previous December Monday', '2027-01-01', '2026-12-28'],
  ])('%s', (_name, input, expected) => {
    expect(getWeekStart(input)).toBe(expected);
  });

  it('rejects text that is not a real date', () => {
    expect(() => getWeekStart('2026-02-30')).toThrow(RangeError);
    expect(() => getWeekStart('not a date')).toThrow(RangeError);
  });
});

describe('the week across the Victorian daylight-saving start', () => {
  it('has exactly 7 consecutive dates from Monday 2026-09-28 to Sunday 2026-10-04', () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays('2026-09-28', i));
    expect(days).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
    expect(getWeekEnd('2026-09-28')).toBe('2026-10-04');
  });
});

describe('listWeeks', () => {
  it('lists each Monday from the first week to the last week', () => {
    expect(listWeeks('2026-09-30', '2026-10-12')).toEqual([
      '2026-09-28',
      '2026-10-05',
      '2026-10-12',
    ]);
  });
});

describe('addWeeks', () => {
  it('moves a week start forward and back by whole weeks', () => {
    expect(addWeeks('2026-09-28', 1)).toBe('2026-10-05');
    expect(addWeeks('2026-09-28', -2)).toBe('2026-09-14');
    expect(addWeeks('2026-12-28', 1)).toBe('2027-01-04');
  });
});

describe('getLocalToday', () => {
  it('uses the device-local calendar date, zero padded', () => {
    expect(getLocalToday(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(getLocalToday(new Date(2026, 9, 3, 0, 1))).toBe('2026-10-03');
  });
});

describe('isFutureDate', () => {
  it('is true only for days after today', () => {
    expect(isFutureDate('2026-10-04', '2026-10-03')).toBe(true);
    expect(isFutureDate('2026-10-03', '2026-10-03')).toBe(false);
    expect(isFutureDate('2026-10-02', '2026-10-03')).toBe(false);
  });
});

describe('formatWeekRange (Monday to Sunday)', () => {
  it.each([
    ['inside one month', '2026-05-18', '18–24 May 2026'],
    ['zero pads single-digit days', '2026-05-04', '04–10 May 2026'],
    ['across two months', '2026-04-27', '27 Apr–03 May 2026'],
    ['across the daylight-saving start', '2026-09-28', '28 Sep–04 Oct 2026'],
    ['across a year boundary', '2026-12-28', '28 Dec 2026–03 Jan 2027'],
  ])('%s', (_name, weekStart, expected) => {
    expect(formatWeekRange(weekStart)).toBe(expected);
  });

  it('accepts any day of the week and formats that whole week', () => {
    expect(formatWeekRange('2026-05-21')).toBe('18–24 May 2026');
  });
});

describe('formatWeekEndLabel', () => {
  it('labels a week with its Sunday as dd/mm', () => {
    expect(formatWeekEndLabel('2026-05-18')).toBe('24/05');
    expect(formatWeekEndLabel('2026-04-27')).toBe('03/05');
    expect(formatWeekEndLabel('2026-12-28')).toBe('03/01');
  });
});
