import { useCallback, useEffect, useState } from 'react';

import type { AppError } from '@/lib/errors';
import type { Result } from '@/lib/result';

export type AsyncResultState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; data: T };

/**
 * Runs `load` when the screen mounts (and again whenever `load` changes, so pass a stable or
 * `useCallback` function) and keeps its loading, error and ready state.
 *
 * `reload` goes back to the loading state first (for a retry); `refresh` fetches again quietly and
 * keeps what is on screen (for coming back to the screen).
 */
export function useAsyncResult<T>(load: () => Promise<Result<T>>) {
  const [state, setState] = useState<AsyncResultState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load().then((result) => {
      if (cancelled) return;
      setState(
        result.ok ? { status: 'ready', data: result.data } : { status: 'error', error: result.error },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const refresh = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  return { state, reload, refresh };
}
