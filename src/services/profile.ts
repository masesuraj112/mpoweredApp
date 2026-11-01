// Creates the signed-in user's profile after the phone number is verified, and reads and edits it
// from Settings. Returns a Result and never throws to the UI. The Supabase client is the last
// optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import { toProfileArgs, type OnboardingAnswers } from '@/features/auth/profile';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import { NAME_MAX_LENGTH, validateYearOfBirth } from '@/services/validation';
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

/** What the Settings Account page shows and edits. */
export type PersonalDetails = {
  name: string;
  /** E.164, e.g. +61491570006. Null on rows created before phone sign-in. */
  phone: string | null;
  /** Null for a support person (no patients row) or when none was given. */
  yearOfBirth: number | null;
};

/**
 * The signed-in user's name, phone and year of birth. Filters by auth_id, because users_select
 * also returns a patient's row to their support persons.
 */
export function getPersonalDetails(client: Client = supabase): Promise<Result<PersonalDetails>> {
  return run(async () => {
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) return fail(mapError(sessionError));
    const userId = sessionData.session?.user?.id;
    if (!userId) return fail({ code: 'NO_SESSION', message: 'There is no signed-in user.' });

    const { data, error } = await client
      .from('users')
      .select('name, phone_number, patients(year_of_birth)')
      .eq('auth_id', userId)
      .maybeSingle();
    if (error) return fail(mapError(error));
    if (!data) return fail({ code: 'NO_PROFILE', message: 'There is no profile for this user.' });
    return ok({
      name: data.name,
      phone: data.phone_number,
      yearOfBirth: data.patients[0]?.year_of_birth ?? null,
    });
  });
}

/**
 * Saves the signed-in user's name and, for a patient, year of birth. The checks match
 * update_profile, so a bad value never reaches the database. A support person passes null.
 */
export function updateProfile(
  details: { name: string; yearOfBirth: number | null },
  client: Client = supabase,
): Promise<Result<void>> {
  return run(async () => {
    const name = details.name.trim();
    if (name === '') {
      return fail({ code: 'VALIDATION', message: 'Please enter your name.', field: 'name' });
    }
    if (name.length > NAME_MAX_LENGTH) {
      return fail({
        code: 'VALIDATION',
        message: `Your name must be ${NAME_MAX_LENGTH} characters or fewer.`,
        field: 'name',
      });
    }
    const yearError = validateYearOfBirth(details.yearOfBirth);
    if (yearError) return fail({ code: 'VALIDATION', message: yearError, field: 'yearOfBirth' });

    // The generated argument types cannot express a nullable argument, which the function accepts.
    const args = { p_name: name, p_year_of_birth: details.yearOfBirth } as never;
    const { error } = await client.rpc('update_profile', args);
    if (error) return fail(mapError(error));
    return ok(undefined);
  });
}
