import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { showRemindersWhileOpen } from '@/services/notifications';

import { reminderSources, syncReminders, type ReminderSources } from './syncReminders';

type RemindersValue = {
  /** Re-plans the reminders. Call after saving anything they depend on. Never throws. */
  refresh: () => void;
};

// Outside the provider (support person app, tests) refresh does nothing.
const RemindersContext = createContext<RemindersValue>({ refresh: () => {} });

const currentTime = () => new Date();

// The handler belongs to the app, not to one provider: set it once, even if the tabs mount again.
let handlerSet = false;

type RemindersProviderProps = {
  children: ReactNode;
  /** For tests. */
  sources?: ReminderSources;
  now?: () => Date;
};

/**
 * Keeps the patient's reminders up to date: plans them when the app opens (sign-in included) and
 * when it comes back to the foreground, and whenever a screen calls `refresh()`. One sync runs at a
 * time; a refresh during a sync runs once more afterwards, so the last change always wins.
 */
export function RemindersProvider({ children, sources = reminderSources, now = currentTime }: RemindersProviderProps) {
  const running = useRef(false);
  const again = useRef(false);

  const refresh = useCallback(() => {
    if (running.current) {
      again.current = true;
      return;
    }
    running.current = true;
    void (async () => {
      do {
        again.current = false;
        try {
          await syncReminders(now(), sources);
        } catch {
          // The services return Results; this only guards against the unexpected. The next trigger retries.
        }
      } while (again.current);
      running.current = false;
    })();
  }, [sources, now]);

  useEffect(() => {
    if (!handlerSet) {
      handlerSet = true;
      showRemindersWhileOpen();
    }
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const value = useMemo(() => ({ refresh }), [refresh]);
  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersValue {
  return useContext(RemindersContext);
}
