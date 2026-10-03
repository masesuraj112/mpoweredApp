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

/** The Monday of every week from the week containing `from` to the week containing `to`. */
export function listWeeks(from: string, to: string): string[] {
  const last = getWeekStart(to);
  const weeks: string[] = [];
  for (let week = getWeekStart(from); week <= last; week = addDays(week, 7)) {
    weeks.push(week);
  }
  return weeks;
}
