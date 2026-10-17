// Creates the signed-in user's profile after the phone number is verified. Returns a Result and
// never throws to the UI. The Supabase client is the last optional argument so tests can pass a
// fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import { toProfileArgs, type OnboardingAnswers } from '@/features/auth/profile';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;

/** Runs a database call and converts both returned errors and thrown ones (for example a lost connection). */
async function run<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await call();
  } catch (error) {
    return fail(mapError(error));
  }
}

/**
 * Validates the onboarding answers and creates the profile in a single database call. The
 * function takes the user from the session, so no user id is sent.
 *
 * Retry safety: PROFILE_EXISTS counts as success, because an earlier attempt may have
 * committed with its response lost.
 */
export async function createProfile(
  answers: OnboardingAnswers,
  client: Client = supabase,
  options: { currentYear?: number } = {},
): Promise<Result<void>> {
  const mapped = toProfileArgs(answers, options);
  if (!mapped.ok) return mapped;

  return run(async () => {
    // The generated argument types cannot express nullable arguments, which the function accepts.
    const { error } = await client.rpc('create_profile', mapped.data as never);
    if (error) {
      const appError = mapError(error);
      if (appError.code === 'PROFILE_EXISTS') return ok(undefined);
      return fail(appError);
    }
    return ok(undefined);
  });
}
