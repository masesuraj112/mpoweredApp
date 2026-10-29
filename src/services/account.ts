// The signed-in user's whole account (Settings > Privacy/Data and Legal): exporting their data.
// Returns a Result and never throws to the UI. The Supabase client is the last optional argument
// so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import { mapError } from '@/lib/errors';
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
