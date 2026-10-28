import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import type { AppError } from '@/lib/errors';
import type { Result } from '@/lib/result';

export type QueryState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; data: T };

/**
 * Loads data each time the screen comes into focus, so returning from an edit screen shows
 * the change. After the first load the old data stays on screen while it refreshes.
 * `load` must be stable (wrap it in useCallback) or it reloads on every render.
 */
export function useFocusedQuery<T>(load: () => Promise<Result<T>>) {
  const [state, setState] = useState<QueryState<T>>({ status: 'loading' });
  const request = useRef(0);

  const reload = useCallback(() => {
    const id = ++request.current;
    setState((current) => (current.status === 'ready' ? current : { status: 'loading' }));
    load().then((result) => {
      if (id !== request.current) return; // a newer load has started, or the screen lost focus
      setState(result.ok ? { status: 'ready', data: result.data } : { status: 'error', error: result.error });
    });
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      reload();
      return () => {
        request.current++;
      };
    }, [reload]),
  );

  return { state, setState, reload };
}
