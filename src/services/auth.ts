// Phone sign-in. Every function returns a Result and never throws to the UI. The Supabase
// client is the last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import { toE164 } from '@/features/auth/phone';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;

/** Runs an auth call and converts both returned errors and thrown ones (for example a lost connection). */
async function run<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await call();
  } catch (error) {
    return fail(mapError(error));
  }
}

/**
 * Sends a one-time code by SMS. Sign-in and sign-up are the same call (decision L6): the server
 * creates the user on first use, and the result never says whether the number was known.
 * Returns the normalised number so the UI does not recompute it.
 */
export async function sendVerificationCode(
  rawPhone: string,
  client: Client = supabase,
): Promise<Result<{ phone: string }>> {
  const normalised = toE164(rawPhone);
  if (!normalised.ok) return normalised;
  const phone = normalised.data;

  return run(async () => {
    const { error } = await client.auth.signInWithOtp({
      phone,
      options: { channel: 'sms', shouldCreateUser: true },
    });
    if (error) return fail(mapError(error));
    return ok({ phone });
  });
}
