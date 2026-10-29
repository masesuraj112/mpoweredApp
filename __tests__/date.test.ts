import { formatDisplayDate, parseIsoDate, toIsoDate } from '@/services/date';

describe('date helpers', () => {
  it('round-trips ISO dates through local midnight', () => {
    const date = parseIsoDate('1968-01-28');
    expect(date).not.toBeNull();
    expect(date!.getHours()).toBe(0);
    expect(toIsoDate(date!)).toBe('1968-01-28');
  });

  it('rejects malformed and impossible dates', () => {
    expect(parseIsoDate('hello')).toBeNull();
    expect(parseIsoDate('31/02/2020')).toBeNull();
    expect(parseIsoDate('2020-02-31')).toBeNull();
    expect(parseIsoDate('2020-13-01')).toBeNull();
    expect(parseIsoDate('2020-02-29')).not.toBeNull();
  });

  it('formats unambiguously for display', () => {
    expect(formatDisplayDate(new Date(1990, 3, 3))).toBe('3 April 1990');
  });
});
