// Phone sign-in. Every function returns a Result and never throws to the UI. The Supabase
// client is the last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import { isCodeComplete } from '@/features/auth/otp';
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

/**
 * Checks a code and signs the user in. The phone and code are validated first, so nothing is sent
 * for a malformed one. Returns only the user id, never the session.
 *
 * The server uses the same error for a wrong code and an expired one, so both come back as
 * OTP_EXPIRED; INVALID_OTP is only returned for a code that is not six digits.
 */
export async function verifyCode(
  rawPhone: string,
  code: string,
  client: Client = supabase,
): Promise<Result<{ userId: string }>> {
  const normalised = toE164(rawPhone);
  if (!normalised.ok) return normalised;
  if (!isCodeComplete(code)) {
    return fail({ code: 'INVALID_OTP', message: 'The code must be six digits.' });
  }
  const phone = normalised.data;

  return run(async () => {
    const { data, error } = await client.auth.verifyOtp({ phone, token: code, type: 'sms' });
    if (error) return fail(mapError(error));
    const userId = data?.user?.id;
    if (!userId) {
      return fail({ code: 'UNKNOWN', message: 'Verification did not return a user.' });
    }
    return ok({ userId });
  });
}
