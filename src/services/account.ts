// The signed-in user's whole account (Settings > Privacy/Data and Legal): exporting their data and
// deleting the account. Returns a Result and never throws to the UI. The Supabase client is the
// last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import { isCodeComplete } from '@/features/auth/otp';
import { mapError, type AppError, type AppErrorCode } from '@/lib/errors';
import { fail, ok, run, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import type { Database, Json } from '@/types/database';

type Client = SupabaseClient<Database>;

/**
 * Everything the signed-in user can read about themselves, as one JSON document (export_my_data).
 * The function takes the user from the session, so no user id is sent.
 */
export function exportMyData(client: Client = supabase): Promise<Result<Json>> {
  return run(async () => {
    const { data, error } = await client.rpc('export_my_data');
    if (error) return fail(mapError(error));
    if (data === null) return fail({ code: 'UNKNOWN', message: 'The export returned nothing.' });
    return ok(data);
  });
}

/** The error codes the delete-account Edge Function returns as { error: CODE }. */
const DELETE_ERROR_CODES: Partial<Record<string, AppErrorCode>> = {
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  NOT_ALLOWED: 'NOT_ALLOWED',
  // The screen checks for a phone first, so this only happens if it changed in between.
  NO_PHONE: 'NOT_ALLOWED',
  NO_PROFILE: 'NO_PROFILE',
};

/** Turns an error from functions.invoke into an AppError, reading the function's { error } body. */
async function deleteError(error: unknown): Promise<AppError> {
  const { name, context } = error as { name?: string; context?: { json?: () => Promise<unknown> } };
  if (name === 'FunctionsFetchError') {
    return { code: 'NETWORK', message: 'The delete account request could not be sent.' };
  }
  if (typeof context?.json === 'function') {
    try {
      const body = (await context.json()) as { error?: unknown };
      const code = typeof body?.error === 'string' ? DELETE_ERROR_CODES[body.error] : undefined;
      if (code) return { code, message: String(body.error) };
    } catch {
      // not JSON: fall through
    }
  }
  return { code: 'UNKNOWN', message: 'The account could not be deleted.' };
}

/**
 * Deletes the signed-in user's account. `code` is the SMS code just sent to the account's own
 * phone (sendVerificationCode); the delete-account Edge Function checks it against that phone,
 * so only the code is sent. The caller signs out afterwards.
 */
export function deleteAccount(code: string, client: Client = supabase): Promise<Result<void>> {
  return run(async () => {
    if (!isCodeComplete(code)) {
      return fail({ code: 'INVALID_OTP', message: 'The code must be six digits.' });
    }
    const { error } = await client.functions.invoke('delete-account', { body: { code } });
    if (error) return fail(await deleteError(error));
    return ok(undefined);
  });
}
