import {
  addMonths,
  buildMonthGrid,
  daysInMonth,
  defaultDateTime,
  formatAccessibleDate,
  formatDisplayDateTime,
  formatLocalTimestamp,
  formatTime,
  isPastDateTime,
  isSameDay,
  isValidDay,
  parseLocalTimestamp,
  snapMinute,
  to12Hour,
  to24Hour,
  weekdayIndexMondayFirst,
} from './dateTime';

// Fixed "now": Wednesday 21 October 2026, 2:30 PM local time.
const NOW = new Date(2026, 9, 21, 14, 30, 0);

describe('daysInMonth', () => {
  it('handles leap and non-leap February', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2100, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
  });

  it('handles 30 and 31 day months', () => {
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});

describe('weekdayIndexMondayFirst', () => {
  it('maps Monday to 0 and Sunday to 6', () => {
    expect(weekdayIndexMondayFirst(2026, 10, 19)).toBe(0); // Monday
    expect(weekdayIndexMondayFirst(2026, 10, 25)).toBe(6); // Sunday
  });
});

describe('isValidDay', () => {
  it('rejects impossible days', () => {
    expect(isValidDay({ year: 2026, month: 2, day: 29 })).toBe(false);
    expect(isValidDay({ year: 2024, month: 2, day: 29 })).toBe(true);
    expect(isValidDay({ year: 2026, month: 13, day: 1 })).toBe(false);
    expect(isValidDay({ year: 2026, month: 4, day: 31 })).toBe(false);
  });
});

describe('buildMonthGrid', () => {
  const flat = (year: number, month: number) => buildMonthGrid(year, month).flat();

  it('always makes whole weeks of 7', () => {
    for (let month = 1; month <= 12; month += 1) {
      const weeks = buildMonthGrid(2026, month);
      expect(weeks.every((week) => week.length === 7)).toBe(true);
      expect(weeks.length).toBeGreaterThanOrEqual(4);
      expect(weeks.length).toBeLessThanOrEqual(6);
    }
  });

  it('starts weeks on Monday: June 2026 begins on a Monday, so no leading days', () => {
    const [firstWeek] = buildMonthGrid(2026, 6);
    expect(firstWeek[0]).toEqual({ year: 2026, month: 6, day: 1, inMonth: true });
  });

  it('fills the first week with the previous month when the 1st is a Sunday (Feb 2026)', () => {
    const [firstWeek] = buildMonthGrid(2026, 2);
    expect(firstWeek.slice(0, 6).every((cell) => !cell.inMonth)).toBe(true);
    expect(firstWeek[0]).toEqual({ year: 2026, month: 1, day: 26, inMonth: false });
    expect(firstWeek[6]).toEqual({ year: 2026, month: 2, day: 1, inMonth: true });
  });

  it('puts the 1st in the right column for months starting on every weekday', () => {
    // 2026: Jun 1 Mon, Sep 1 Tue, Apr 1 Wed, Oct 1 Thu, May 1 Fri, Aug 1 Sat, Feb 1 Sun
    const starts: [number, number][] = [
      [6, 0],
      [9, 1],
      [4, 2],
      [10, 3],
      [5, 4],
      [8, 5],
      [2, 6],
    ];
    starts.forEach(([month, column]) => {
      const first = flat(2026, month).findIndex((cell) => cell.inMonth);
      expect(first).toBe(column);
    });
  });

  it('includes every day of the month exactly once as inMonth', () => {
    const days = flat(2026, 10).filter((cell) => cell.inMonth).map((cell) => cell.day);
    expect(days).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
  });

  it('has 29 days in a leap-year February and a 4-week grid when it fits', () => {
    expect(flat(2024, 2).filter((cell) => cell.inMonth)).toHaveLength(29);
    // Feb 2027 starts on a Monday and has 28 days: exactly 4 weeks.
    expect(buildMonthGrid(2027, 2)).toHaveLength(4);
  });

  it('rolls trailing days into the next month and year (December)', () => {
    const weeks = buildMonthGrid(2026, 12);
    const last = weeks[weeks.length - 1];
    expect(last.some((cell) => !cell.inMonth && cell.year === 2027 && cell.month === 1)).toBe(true);
  });
});

describe('addMonths', () => {
  it('rolls December to January of the next year', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });

  it('rolls January back to December of the previous year', () => {
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });

  it('moves by more than a year', () => {
    expect(addMonths(2026, 6, 18)).toEqual({ year: 2027, month: 12 });
    expect(addMonths(2026, 6, -18)).toEqual({ year: 2024, month: 12 });
  });
});

describe('isSameDay', () => {
  it('compares year, month and day', () => {
    expect(isSameDay({ year: 2026, month: 10, day: 21 }, { year: 2026, month: 10, day: 21 })).toBe(true);
    expect(isSameDay({ year: 2026, month: 10, day: 21 }, { year: 2025, month: 10, day: 21 })).toBe(false);
  });
});

describe('12 and 24 hour conversion', () => {
  it('treats 12 AM as 00 and 12 PM as 12', () => {
    expect(to24Hour(12, 'AM')).toBe(0);
    expect(to24Hour(12, 'PM')).toBe(12);
  });

  it('converts ordinary hours', () => {
    expect(to24Hour(9, 'AM')).toBe(9);
    expect(to24Hour(2, 'PM')).toBe(14);
    expect(to24Hour(11, 'PM')).toBe(23);
  });

  it('converts back', () => {
    expect(to12Hour(0)).toEqual({ hour: 12, meridiem: 'AM' });
    expect(to12Hour(12)).toEqual({ hour: 12, meridiem: 'PM' });
    expect(to12Hour(23)).toEqual({ hour: 11, meridiem: 'PM' });
    expect(to12Hour(9)).toEqual({ hour: 9, meridiem: 'AM' });
  });

  it('round-trips every hour', () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const { hour: h, meridiem } = to12Hour(hour);
      expect(to24Hour(h, meridiem)).toBe(hour);
    }
  });
});

describe('snapMinute', () => {
  it('rounds to the step and wraps at the hour', () => {
    expect(snapMinute(0)).toBe(0);
    expect(snapMinute(7)).toBe(5);
    expect(snapMinute(8)).toBe(10);
    expect(snapMinute(58)).toBe(0);
  });
});

describe('local timestamp format and parse', () => {
  it('formats with no timezone suffix', () => {
    const text = formatLocalTimestamp({ year: 2026, month: 10, day: 21, hour: 14, minute: 30 });
    expect(text).toBe('2026-10-21T14:30:00');
    expect(text).not.toMatch(/Z|[+-]\d{2}:\d{2}$/);
  });

  it('pads single digits', () => {
    expect(formatLocalTimestamp({ year: 2026, month: 1, day: 2, hour: 0, minute: 5 })).toBe(
      '2026-01-02T00:05:00',
    );
  });

  it('keeps the calendar day for a time near midnight', () => {
    expect(formatLocalTimestamp({ year: 2026, month: 12, day: 31, hour: 23, minute: 55 })).toBe(
      '2026-12-31T23:55:00',
    );
  });

  it('parses what it formats', () => {
    const value = { year: 2026, month: 10, day: 21, hour: 14, minute: 30 };
    expect(parseLocalTimestamp(formatLocalTimestamp(value))).toEqual(value);
  });

  it('returns null for malformed or impossible values', () => {
    expect(parseLocalTimestamp(null)).toBeNull();
    expect(parseLocalTimestamp('')).toBeNull();
    expect(parseLocalTimestamp('2026-10-21')).toBeNull();
    expect(parseLocalTimestamp('2026-02-30T09:00:00')).toBeNull();
    expect(parseLocalTimestamp('2026-10-21T25:00:00')).toBeNull();
    expect(parseLocalTimestamp('2026-10-21T09:60:00')).toBeNull();
  });
});

describe('display formatting', () => {
  it('formats the field value', () => {
    expect(formatDisplayDateTime({ year: 2026, month: 10, day: 21, hour: 14, minute: 30 })).toBe(
      'Wed 21 Oct 2026, 2:30 PM',
    );
  });

  it('formats midnight and noon', () => {
    expect(formatDisplayDateTime({ year: 2026, month: 6, day: 10, hour: 0, minute: 0 })).toBe(
      'Wed 10 Jun 2026, 12:00 AM',
    );
    expect(formatDisplayDateTime({ year: 2026, month: 6, day: 10, hour: 12, minute: 30 })).toBe(
      'Wed 10 Jun 2026, 12:30 PM',
    );
  });

  it('spells out the date for screen readers', () => {
    expect(formatAccessibleDate({ year: 2026, month: 10, day: 21 })).toBe('Wednesday 21 October 2026');
  });

  it('formats a time', () => {
    expect(formatTime(23, 55)).toBe('11:55 PM');
    expect(formatTime(0, 0)).toBe('12:00 AM');
  });
});

describe('isPastDateTime and defaultDateTime', () => {
  it('compares date and time against the injected now', () => {
    expect(isPastDateTime({ year: 2026, month: 10, day: 21, hour: 14, minute: 29 }, NOW)).toBe(true);
    expect(isPastDateTime({ year: 2026, month: 10, day: 21, hour: 14, minute: 30 }, NOW)).toBe(false);
    expect(isPastDateTime({ year: 2026, month: 10, day: 22, hour: 0, minute: 0 }, NOW)).toBe(false);
    expect(isPastDateTime({ year: 2025, month: 12, day: 31, hour: 23, minute: 59 }, NOW)).toBe(true);
  });

  it('suggests today at 9:00 AM', () => {
    expect(defaultDateTime(NOW)).toEqual({ year: 2026, month: 10, day: 21, hour: 9, minute: 0 });
  });
});
