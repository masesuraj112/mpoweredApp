// Where to go once the one-time code is accepted, from which button the person started on and whether
// the number already has an account (docs/backend/sign-up-sign-in-plan.md, section 4.2).
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { AuthIntent } from '@/context/Onboarding-Context';

export type NextStep =
  /** Their account exists: the root guard takes them to the patient tabs or the support person app. */
  | 'home'
  /** A new number with the sign-up answers ready: create the profile. */
  | 'create-profile'
  /** A new number without the answers: ask the sign-up questions first. */
  | 'sign-up-questions'
  /** Signed up with a number that already has an account. */
  | 'account-exists'
  /** Signed in with a number that has no account. */
  | 'no-account';

export type AfterVerifyInput = {
  intent: AuthIntent;
  hasProfile: boolean;
  /** The sign-up answers are complete enough to create a profile (`toProfileArgs` succeeds). */
  answersComplete: boolean;
};

/**
 * Only called after a correct code, so telling someone whether their own number has an account
 * reveals nothing (decision L6). Without an intent (for example a deep link into the flow) it keeps the
 * behaviour from before the intent existed.
 */
export function nextStepAfterVerify({ intent, hasProfile, answersComplete }: AfterVerifyInput): NextStep {
  if (intent === 'sign-up') return hasProfile ? 'account-exists' : answersComplete ? 'create-profile' : 'sign-up-questions';
  if (intent === 'sign-in') return hasProfile ? 'home' : 'no-account';
  if (hasProfile) return 'home';
  return answersComplete ? 'create-profile' : 'sign-up-questions';
}
