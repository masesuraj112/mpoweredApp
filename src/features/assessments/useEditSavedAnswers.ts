import { useEffect, useRef, useState } from 'react';

import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import type { AppError } from '@/lib/errors';
import type { Result } from '@/lib/result';

export type EditSavedAnswersState = { status: 'loading' } | { status: 'error'; message: string };

type EditSavedAnswersOptions<TEntry, TAnswers> = {
  /** Loads the saved entry for a week, for example `getPainEntryForWeek`. */
  load: (weekStart: string) => Promise<Result<TEntry | null>>;
  toAnswers: (entry: TEntry) => TAnswers;
  /** From the assessment context: the local draft has been read. */
  isHydrated: boolean;
  replaceAnswers: (answers: TAnswers) => void;
  /** Opens the first question once the saved answers are in place. */
  onReady: () => void;
  /** Turns a failed load into the message shown to the user. */
  errorMessage: (error: AppError) => string;
  /** The device-local date today. Defaults to now; tests pass a fixed one. */
  today?: string;
};

/**
 * Puts this week's saved answers back into the assessment so the user can change them, then calls
 * `onReady`. Only this week can be edited: the question screens save to today's week.
 *
 * Waits for the local draft to load first, so a stale draft cannot be merged over the saved
 * answers. Loads once: isHydrated only changes from false to true.
 */
export function useEditSavedAnswers<TEntry, TAnswers>(
  options: EditSavedAnswersOptions<TEntry, TAnswers>,
): EditSavedAnswersState {
  const { isHydrated } = options;
  const [state, setState] = useState<EditSavedAnswersState>({ status: 'loading' });
  // Always the latest callbacks, so callers can pass inline functions without re-running the load.
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    if (!isHydrated) return;
    let cancelled = false;
    const { load, today } = latest.current;
    load(getWeekStart(today ?? getLocalToday())).then((result) => {
      if (cancelled) return;
      const current = latest.current;
      if (!result.ok) {
        setState({ status: 'error', message: current.errorMessage(result.error) });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved answers for this week.' });
      } else {
        current.replaceAnswers(current.toAnswers(result.data));
        current.onReady();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isHydrated]);

  return state;
}
