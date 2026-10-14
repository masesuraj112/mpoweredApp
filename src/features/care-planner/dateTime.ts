// Pure date and time helpers for the appointment picker.
//
// An appointment's date and time is local wall-clock time. It is stored as
// `YYYY-MM-DDTHH:mm:ss` with no zone suffix (the column is `timestamp without time zone`). Every
// value here is built from local components. Never use toISOString() or a UTC conversion.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

export type Meridiem = 'AM' | 'PM';

/** A calendar day. `month` is 1 to 12. */
export type CalendarDay = { year: number; month: number; day: number };

/** A calendar day and a time of day in 24-hour form. `month` is 1 to 12. */
export type LocalDateTime = CalendarDay & { hour: number; minute: number };

/** One square of the month grid. `inMonth` is false for the days that fill the first/last week. */
export type MonthGridCell = CalendarDay & { inMonth: boolean };

/** Minutes move in steps of this many. */
export const MINUTE_STEP = 5;
/** The time suggested when nothing has been chosen yet: 9:00 AM. */
export const DEFAULT_HOUR_24 = 9;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Weekday headings, Monday first (the calendar's weeks run Monday to Sunday). */
export const WEEKDAY_HEADINGS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const;

const pad2 = (n: number) => String(n).padStart(2, '0');

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** 0 = Monday ... 6 = Sunday. */
export function weekdayIndexMondayFirst(year: number, month: number, day: number): number {
  const sundayFirst = new Date(year, month - 1, day).getDay();
  return (sundayFirst + 6) % 7;
}

/** True when the numbers make a real calendar day (rejects 31 February). */
export function isValidDay({ year, month, day }: CalendarDay): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

/**
 * The weeks of a month for a calendar that starts weeks on Monday. Every week has 7 cells; days
 * from the previous and next month fill the first and last week and have `inMonth: false`.
 */
export function buildMonthGrid(year: number, month: number): MonthGridCell[][] {
  const leading = weekdayIndexMondayFirst(year, month, 1);
  const total = daysInMonth(year, month);
  const weekCount = Math.ceil((leading + total) / 7);
  const weeks: MonthGridCell[][] = [];

  for (let week = 0; week < weekCount; week += 1) {
    const cells: MonthGridCell[] = [];
    for (let column = 0; column < 7; column += 1) {
      const offset = week * 7 + column - leading;
      // Date normalises day numbers outside the month into the neighbouring month.
      const date = new Date(year, month - 1, 1 + offset);
      cells.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        inMonth: offset >= 0 && offset < total,
      });
    }
    weeks.push(cells);
  }
  return weeks;
}

/** Moves a month forwards or backwards, rolling the year (December + 1 is January next year). */
export function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12 + 12) % 12 + 1 };
}

export function isSameDay(a: CalendarDay, b: CalendarDay): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/** 12 AM is hour 0, 12 PM is hour 12. */
export function to24Hour(hour12: number, meridiem: Meridiem): number {
  const base = hour12 % 12;
  return meridiem === 'PM' ? base + 12 : base;
}

/** Hour 0 is 12 AM, hour 12 is 12 PM. */
export function to12Hour(hour24: number): { hour: number; meridiem: Meridiem } {
  const meridiem: Meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour, meridiem };
}

/** Rounds a minute to the nearest step, wrapping 58 to 0. */
export function snapMinute(minute: number, step: number = MINUTE_STEP): number {
  const snapped = Math.round(minute / step) * step;
  return snapped >= 60 ? 0 : snapped;
}

/** `2026-10-21T14:30:00`. Local components only; seconds are always 00. */
export function formatLocalTimestamp(value: LocalDateTime): string {
  const date = `${String(value.year).padStart(4, '0')}-${pad2(value.month)}-${pad2(value.day)}`;
  return `${date}T${pad2(value.hour)}:${pad2(value.minute)}:00`;
}

/** The inverse of `formatLocalTimestamp`. Returns null for anything malformed or impossible. */
export function parseLocalTimestamp(value: string | null | undefined): LocalDateTime | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1, 6).map(Number);
  if (!isValidDay({ year, month, day })) return null;
  if (hour > 23 || minute > 59) return null;
  return { year, month, day, hour, minute };
}

/** "Tue 21 Oct 2026, 2:30 PM" (en-AU style, 12-hour). */
export function formatDisplayDateTime(value: LocalDateTime): string {
  const weekday = SHORT_WEEKDAY_NAMES[new Date(value.year, value.month - 1, value.day).getDay()];
  const { hour, meridiem } = to12Hour(value.hour);
  return `${weekday} ${value.day} ${SHORT_MONTH_NAMES[value.month - 1]} ${value.year}, ${hour}:${pad2(
    value.minute,
  )} ${meridiem}`;
}

/** "Tuesday 21 October 2026", for screen readers. */
export function formatAccessibleDate({ year, month, day }: CalendarDay): string {
  const weekday = WEEKDAY_NAMES[new Date(year, month - 1, day).getDay()];
  return `${weekday} ${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

/** "9:00 AM", for screen readers. */
export function formatTime(hour24: number, minute: number): string {
  const { hour, meridiem } = to12Hour(hour24);
  return `${hour}:${pad2(minute)} ${meridiem}`;
}

/** Today's calendar day from a `Date`, using local components. `now` is injectable for tests. */
export function toCalendarDay(now: Date): CalendarDay {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/** True when the date and time is before `now`. Compared as local wall-clock values. */
export function isPastDateTime(value: LocalDateTime, now: Date): boolean {
  return formatLocalTimestamp(value) < formatLocalTimestamp({
    ...toCalendarDay(now),
    hour: now.getHours(),
    minute: now.getMinutes(),
  });
}

/** What the picker shows when nothing has been chosen: today at 9:00 AM. */
export function defaultDateTime(now: Date): LocalDateTime {
  return { ...toCalendarDay(now), hour: DEFAULT_HOUR_24, minute: 0 };
}
