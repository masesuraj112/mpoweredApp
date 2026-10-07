/**
 * Calendar-date helpers for values with no time of day (e.g. date of birth).
 *
 * Dates are held as a local-midnight `Date` in state, stored as ISO `YYYY-MM-DD`,
 * and only formatted for display. Never use `new Date('YYYY-MM-DD')` or
 * `toISOString()` for these: both go through UTC and can shift the day by one.
 */

/** Local-midnight `Date` → `YYYY-MM-DD`, e.g. for sending to Supabase. */
export function toIsoDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** `YYYY-MM-DD` → local-midnight `Date`. Returns null for malformed or impossible dates (e.g. 2020-02-31). */
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  // Date rolls invalid days over (Feb 31 → Mar 2), so check nothing moved.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

/** Unambiguous display format, e.g. "28 January 1968". */
export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** True if `date` falls on a later calendar day than today. */
export function isFutureDate(date: Date, today: Date = new Date()): boolean {
  return toIsoDate(date) > toIsoDate(today);
}
