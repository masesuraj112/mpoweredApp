import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

import {
  getReminderPermission,
  requestReminderPermission,
  type ReminderPermission,
} from '@/services/notifications';

const permissionSources = { getReminderPermission, requestReminderPermission };
export type PermissionSources = typeof permissionSources;

/**
 * Whether this phone lets MPowered show reminders, for Settings > Notifications. `ensure` asks
 * when a toggle is turned on (decision N-E: never at app start). The answer is read again when the
 * app comes back to the foreground, since the person may have changed it in the phone's settings.
 */
export function useReminderPermission(sources: PermissionSources = permissionSources) {
  // Null until read. A failed read is treated as unknown, not as refused.
  const [permission, setPermission] = useState<ReminderPermission | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = () => {
      void sources.getReminderPermission().then((result) => {
        if (mounted && result.ok) setPermission(result.data);
      });
    };
    check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [sources]);

  /** True when reminders can be shown, asking first if the phone still allows it. */
  const ensure = useCallback(async (): Promise<boolean> => {
    const current = await sources.getReminderPermission();
    if (current.ok && current.data.status === 'granted') {
      setPermission(current.data);
      return true;
    }
    const asked = await sources.requestReminderPermission();
    if (!asked.ok) return false;
    setPermission(asked.data);
    return asked.data.status === 'granted';
  }, [sources]);

  const openSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  return { permission, denied: permission?.status === 'denied', ensure, openSettings };
}
