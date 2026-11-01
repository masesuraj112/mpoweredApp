import { useCallback, useRef, useState } from 'react';

import { useAsyncResult } from '@/features/care-planner/useAsyncResult';
import type { AppError } from '@/lib/errors';
import {
  getNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
} from '@/services/settings';

/**
 * The signed-in user's notification choices (Settings > Notifications). `update` shows the change
 * straight away and saves it; if the save fails, the previous value comes back and `saveError` is
 * set. Only the latest change is rolled back, so a slow failure never undoes a newer change.
 */
export function useNotificationSettings() {
  const load = useCallback(() => getNotificationSettings(), []);
  const { state, reload } = useAsyncResult(load);
  // The user's changes since loading; null until they change something.
  const [changed, setChanged] = useState<NotificationSettings | null>(null);
  const [saveError, setSaveError] = useState<AppError | null>(null);
  const latestChange = useRef(0);
  const settings = changed ?? (state.status === 'ready' ? state.data : null);

  const update = useCallback(
    async (change: Partial<NotificationSettings>): Promise<boolean> => {
      if (!settings) return false;
      const previous = settings;
      const next = { ...previous, ...change };
      const changeId = ++latestChange.current;
      setChanged(next);
      setSaveError(null);

      const result = await saveNotificationSettings(next);
      if (!result.ok) {
        if (changeId === latestChange.current) setChanged(previous);
        setSaveError(result.error);
        return false;
      }
      return true;
    },
    [settings],
  );

  const clearSaveError = useCallback(() => setSaveError(null), []);

  return { state, reload, settings, update, saveError, clearSaveError };
}
