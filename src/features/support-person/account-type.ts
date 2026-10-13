export type AccountType = 'patient' | 'support-person';

/**
 * Which app the signed-in user sees: the patient tabs or the support person tabs.
 *
 * TODO: read the account type from Supabase once it's saved at sign-up. Until then it comes from
 * EXPO_PUBLIC_DEV_USER_TYPE in .env (dev builds only) and defaults to 'patient'.
 */
export const accountType: AccountType =
  __DEV__ && process.env.EXPO_PUBLIC_DEV_USER_TYPE === 'support-person' ? 'support-person' : 'patient';

/** Where to send someone after they sign in or finish onboarding. */
export function homeRouteFor(type: AccountType) {
  return type === 'support-person' ? ('/(support)/care-planner' as const) : ('/(tabs)/home' as const);
}
