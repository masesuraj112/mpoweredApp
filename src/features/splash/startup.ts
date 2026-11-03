// When the welcome splash shows while the app starts (docs/backend/app-icons-and-splash-plan.md, decision I-E).
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

/** How long each greeting shows, at least. */
export const WELCOME_SPLASH_MS = 3000;

export type WelcomeBackInput = {
  /** The app opened with a saved session (not someone signing in now). Null until the session is read. */
  startedSignedIn: boolean | null;
  hasProfile: boolean | null;
  profileError: unknown;
  minimumElapsed: boolean;
};

/**
 * "Welcome back to" covers the app for someone who opened it signed in: while their profile loads, and
 * for at least `WELCOME_SPLASH_MS`. It never shows for someone signing in now (it would cover the verify
 * screen), and stops at once for a profile error (the error screen shows) or no profile yet (onboarding,
 * which starts with "Welcome to").
 */
export function showWelcomeBack({ startedSignedIn, hasProfile, profileError, minimumElapsed }: WelcomeBackInput): boolean {
  if (!startedSignedIn || profileError) return false;
  if (hasProfile === null) return true;
  return hasProfile && !minimumElapsed;
}
