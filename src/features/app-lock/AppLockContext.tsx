import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { canCheckOwner, checkOwner, getUnlockMethod, methodName } from './deviceAuth';
import { shouldLockOnReturn, type UnlockMethod } from './policy';
import { isAppLockOn, saveAppLock } from './storage';

type AppLockValue = {
  /** Whether the person turned the lock on in Account settings. */
  enabled: boolean;
  /** Turns the lock on (after the phone checks it is its owner) or off. Returns a message when it could not. */
  setEnabled: (on: boolean) => Promise<string | null>;
  /** The app is covered by the lock screen. */
  locked: boolean;
  /** Asks the phone to check it is its owner. Returns a message when it did not unlock. */
  unlock: () => Promise<string | null>;
  /** How this phone unlocks, for labels: "Face ID", "fingerprint", "your passcode". */
  methodName: string;
};

const AppLockContext = createContext<AppLockValue | null>(null);

/**
 * The optional app lock for someone already signed in: when it is on, the app asks for Face ID, a fingerprint
 * or the phone's passcode as it opens, and again after five minutes or more in the background.
 * `active` is true while a signed-in person is using the app; the lock never covers the sign-in screens.
 */
export function AppLockProvider({ active, children }: { active: boolean; children: ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [locked, setLocked] = useState(false);
  const [method, setMethod] = useState<UnlockMethod>('passcode');
  const hiddenAt = useRef<number | null>(null);
  // The lock shows once as the app opens, not again each time `active` settles.
  const checkedAtOpen = useRef(false);

  useEffect(() => {
    void getUnlockMethod().then(setMethod);
  }, []);

  // Read the setting each time someone starts using the app: signing out turns it off (AuthContext), so
  // after signing back in with an SMS code the app opens unlocked.
  useEffect(() => {
    if (!active) return;
    let isCurrent = true;
    void isAppLockOn().then((on) => {
      if (!isCurrent) return;
      setEnabledState(on);
      // Locked as the app opens; a sign-in later in the same run has just checked who it is.
      setLocked(!checkedAtOpen.current && on);
      checkedAtOpen.current = true;
    });
    return () => {
      isCurrent = false;
    };
  }, [active]);

  useEffect(() => {
    // Only 'background' counts: iOS also goes 'inactive' while its own Face ID prompt is showing.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        hiddenAt.current = Date.now();
      } else if (state === 'active') {
        if (enabled && active && shouldLockOnReturn(hiddenAt.current, Date.now())) setLocked(true);
        hiddenAt.current = null;
      }
    });
    return () => subscription.remove();
  }, [enabled, active]);

  const unlock = useCallback(async () => {
    const result = await checkOwner('Unlock MPowered');
    if (result.ok) {
      setLocked(false);
      return null;
    }
    return result.message;
  }, []);

  const setEnabled = useCallback(async (on: boolean) => {
    if (!on) {
      setEnabledState(false);
      await saveAppLock(false);
      return null;
    }
    if (!(await canCheckOwner())) {
      return 'Set up Face ID, a fingerprint or a passcode in your phone’s settings first.';
    }
    // Checking now means nobody turns on a lock they cannot get past.
    const result = await checkOwner('Turn on the app lock');
    if (!result.ok) return result.message;
    setEnabledState(true);
    await saveAppLock(true);
    return null;
  }, []);

  const value = useMemo(
    () => ({ enabled, setEnabled, locked: active && locked, unlock, methodName: methodName(method) }),
    [enabled, setEnabled, active, locked, unlock, method],
  );

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock(): AppLockValue {
  const value = useContext(AppLockContext);
  if (!value) throw new Error('useAppLock must be used inside AppLockProvider');
  return value;
}
