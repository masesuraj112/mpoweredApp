import { addDays, getWeekEnd, getWeekStart, listWeeks } from '@/features/assessments/week';

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
