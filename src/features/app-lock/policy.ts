// The app lock's rules, kept free of device code so they can be tested on their own.

/** How long the app can sit in the background before it asks to be unlocked again. */
export const LOCK_AFTER_MS = 5 * 60 * 1000;

/**
 * Whether the app should lock as it comes back to the screen. A quick switch (to read the SMS code, or to
 * answer a message) does not lock it; five minutes or more away does.
 */
export function shouldLockOnReturn(hiddenAt: number | null, now: number): boolean {
  return hiddenAt !== null && now - hiddenAt >= LOCK_AFTER_MS;
}

/** What the phone can check: its face, fingerprint or iris reader, or only its passcode. */
export type UnlockMethod = 'face' | 'fingerprint' | 'iris' | 'passcode';

/** The method's everyday name, as the phone itself calls it. */
export function unlockMethodName(method: UnlockMethod, platform: 'ios' | 'android'): string {
  switch (method) {
    case 'face':
      return platform === 'ios' ? 'Face ID' : 'face unlock';
    case 'fingerprint':
      return platform === 'ios' ? 'Touch ID' : 'fingerprint';
    case 'iris':
      return 'iris unlock';
    case 'passcode':
      return platform === 'ios' ? 'your passcode' : 'your screen lock';
  }
}

/**
 * What to tell the person when unlocking did not work. Null when they chose to stop (or the phone stopped
 * it), so nothing needs saying: the Unlock button is still there.
 */
export function unlockFailureMessage(error: string): string | null {
  switch (error) {
    case 'user_cancel':
    case 'system_cancel':
    case 'app_cancel':
    case 'user_fallback':
      return null;
    case 'lockout':
      return 'Too many tries. Unlock your phone with its passcode first, then try again.';
    case 'not_enrolled':
    case 'passcode_not_set':
    case 'not_available':
      return 'Your phone has no Face ID, fingerprint or passcode set up. Set one up in your phone’s settings, or sign out.';
    default:
      return 'We could not check it was you. Please try again.';
  }
}
