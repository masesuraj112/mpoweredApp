// Shared save step for the five weekly assessments. Returns a Result and never throws to the UI.

import { mapError } from '@/lib/errors';
import { fail, ok, run, type Result } from '@/lib/result';

type SubmissionResponse = { data: number | null; error: unknown };

/**
 * Saves a weekly assessment and returns its submission_id. When the week already has an entry
 * (DUPLICATE_WEEK) the user is changing their answers, so `update` replaces that entry's answers
 * instead. This also covers a retry after a lost response: the update writes the same answers and
 * returns the same id.
 */
export function saveOrUpdate(
  save: () => PromiseLike<SubmissionResponse>,
  update: () => PromiseLike<SubmissionResponse>,
): Promise<Result<number>> {
  return run(async () => {
    const saved = toSubmissionId(await save());
    if (saved.ok || saved.error.code !== 'DUPLICATE_WEEK') return saved;
    return toSubmissionId(await update());
  });
}

function toSubmissionId({ data, error }: SubmissionResponse): Result<number> {
  if (error) return fail(mapError(error));
  if (typeof data !== 'number') {
    return fail({ code: 'UNKNOWN', message: 'The save did not return a submission id.' });
  }
  return ok(data);
}
