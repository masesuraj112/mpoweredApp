import { isFutureDate } from '@/features/assessments/week';
import { fail, ok, type Result } from '@/lib/result';

export type EntryDateContext = {
  /** The day the entry refers to ('YYYY-MM-DD'). */
  entryDate: string;
  /** The device-local date today. */
  today: string;
  /** The Monday of the week the user joined. If omitted, the database checks it instead. */
  startWeek?: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const invalidDate = () =>
  fail({
    code: 'VALIDATION',
    message: 'The entry date is not a valid date.',
    detail: 'INVALID_DATE',
    field: 'entryDate',
  });

export function validateEntryDate({ entryDate, today, startWeek }: EntryDateContext): Result<string> {
  if (!DATE_PATTERN.test(entryDate)) return invalidDate();
  try {
    if (isFutureDate(entryDate, today)) {
      return fail({ code: 'FUTURE_DATE', message: 'The entry date cannot be in the future.', field: 'entryDate' });
    }
    if (startWeek !== undefined && entryDate < startWeek) {
      return fail({
        code: 'BEFORE_START',
        message: 'The entry date is before you started using the app.',
        field: 'entryDate',
      });
    }
  } catch {
    return invalidDate();
  }
  return ok(entryDate);
}