// Week helpers: weeks run Monday to Sunday and dates are 'YYYY-MM-DD' strings.
// All arithmetic is done in UTC so daylight saving can never shift a date.

const DAY_MS = 24 * 60 * 60 * 1000;

function parse(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  const date = match ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])) : null;
  if (!date || format(date) !== isoDate) {
    throw new RangeError(`Invalid date: ${isoDate}`);
  }
  return date;
}

function format(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  return format(new Date(parse(isoDate).getTime() + days * DAY_MS));
}

/** The Monday of the week containing the date (Sunday belongs to the previous Monday). */
export function getWeekStart(isoDate: string): string {
  const daysSinceMonday = (parse(isoDate).getUTCDay() + 6) % 7;
  return addDays(isoDate, -daysSinceMonday);
}

/** The Sunday of the week containing the date. */
export function getWeekEnd(isoDate: string): string {
  return addDays(getWeekStart(isoDate), 6);
}

export function addWeeks(weekStart: string, weeks: number): string {
  return addDays(weekStart, weeks * 7);
}

/** Today's date in the device's own timezone (the week comes from the date the user sees). */
export function getLocalToday(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function isFutureDate(date: string, today: string): boolean {
  return parse(date).getTime() > parse(today).getTime();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parts(isoDate: string) {
  const date = parse(isoDate);
  return {
    day: String(date.getUTCDate()).padStart(2, '0'),
    month: MONTHS[date.getUTCMonth()],
    monthNumber: String(date.getUTCMonth() + 1).padStart(2, '0'),
    year: date.getUTCFullYear(),
  };
}

/** For example '18–24 May 2026', '27 Apr–03 May 2026' or '28 Dec 2026–03 Jan 2027'. */
export function formatWeekRange(weekStart: string): string {
  const start = parts(getWeekStart(weekStart));
  const end = parts(getWeekEnd(weekStart));
  if (start.year !== end.year) {
    return `${start.day} ${start.month} ${start.year}–${end.day} ${end.month} ${end.year}`;
  }
  if (start.month !== end.month) {
    return `${start.day} ${start.month}–${end.day} ${end.month} ${end.year}`;
  }
  return `${start.day}–${end.day} ${end.month} ${end.year}`;
}

/** The Sunday of the week as dd/mm, used to label a week on the chart (for example '24/05'). */
export function formatWeekEndLabel(weekStart: string): string {
  const end = parts(getWeekEnd(weekStart));
  return `${end.day}/${end.monthNumber}`;
}

/** The Monday of every week from the week containing `from` to the week containing `to`. */
export function listWeeks(from: string, to: string): string[] {
  const last = getWeekStart(to);
  const weeks: string[] = [];
  for (let week = getWeekStart(from); week <= last; week = addDays(week, 7)) {
    weeks.push(week);
  }
  return weeks;
}
