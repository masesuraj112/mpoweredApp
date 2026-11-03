import { useEffect, useRef, useState } from 'react';

import type { AppError } from '@/lib/errors';
import type { Result } from '@/lib/result';

export type WeekSummaryState<TSummary> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: TSummary };

type WeekSummaryOptions<TEntry, TSummary> = {
  /** The `weekStart` route param. Without one there is nothing to show. */
  weekStart: string | undefined;
  /** Loads the saved entry for the week, for example `getMovementEntryForWeek`. */
  load: (weekStart: string) => Promise<Result<TEntry | null>>;
  toSummary: (entry: TEntry) => TSummary;
  /** Turns a failed load into the message shown to the user. */
  errorMessage: (error: AppError) => string;
};

/**
 * Loads the entry that was just saved for a week and turns it into the summary a tracker summary
 * screen shows. The load runs again only when `weekStart` changes.
 */
export function useWeekSummary<TEntry, TSummary>(
  options: WeekSummaryOptions<TEntry, TSummary>,
): WeekSummaryState<TSummary> {
  const { weekStart } = options;
  const [state, setState] = useState<WeekSummaryState<TSummary>>({ status: 'loading' });
  // Always the latest callbacks, so callers can pass inline functions without re-running the load.
  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    if (!weekStart) return;
    let cancelled = false;
    latest.current.load(weekStart).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: 'error', message: latest.current.errorMessage(result.error) });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved entry.' });
      } else {
        setState({ status: 'ready', summary: latest.current.toSummary(result.data) });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  if (!weekStart) return { status: 'error', message: 'We could not find the week to show.' };
  return state;
}
