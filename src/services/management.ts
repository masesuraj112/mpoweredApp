// Data access for the My Management assessment. Every function returns a Result and never throws
// to the UI. The Supabase client is the last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import type { ManagementAssessmentAnswers } from '@/features/assessments/management/types';
import { validateManagementAnswers } from '@/features/assessments/management/validate';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import { saveOrUpdate } from '@/services/saveOrUpdate';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;

type ManagementRow = Database['public']['Tables']['personal_management']['Row'] & {
  personal_management_medication_names: { medication_name: string }[] | null;
};

/** A saved management submission. */
export type ManagementEntry = {
  submissionId: number;
  date: string;
  weekStart: string;
  exercise: string;
  emotion: string | null;
  otcMedication: string | null;
  /** True when the user ticked "I didn't take any medication". */
  noMedication: boolean;
  /** The ticked medication names, in alphabetical order. */
  medications: string[];
};

/** Runs a database call and converts both returned errors and thrown ones (for example a lost connection). */
async function run<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await call();
  } catch (error) {
    return fail(mapError(error));
  }
}

function toManagementEntry(row: ManagementRow): ManagementEntry {
  return {
    submissionId: row.submission_id,
    date: row.date,
    weekStart: row.week_start ?? getWeekStart(row.date),
    exercise: row.exercise,
    emotion: row.emotion,
    otcMedication: row.otc_medication,
    noMedication: row.no_medication,
    medications: (row.personal_management_medication_names ?? [])
      .map((name) => name.medication_name)
      .sort(),
  };
}

/**
 * Validates and saves one management submission (and its medication names) in a single
 * database call. Returns the submission_id.
 *
 * When the week already has an entry, the user is editing it: its answers are replaced and its
 * id is returned (see saveOrUpdate). That also makes a retry after a lost response safe.
 */
export async function saveManagementEntry(
  answers: ManagementAssessmentAnswers,
  entryDate: string,
  client: Client = supabase,
  options: { today?: string; startWeek?: string } = {},
): Promise<Result<number>> {
  const validated = validateManagementAnswers(answers, {
    entryDate,
    today: options.today ?? getLocalToday(),
    startWeek: options.startWeek,
  });
  if (!validated.ok) return validated;
  const entry = validated.data;

  const values = {
    p_exercise: entry.exercise,
    // the function stores blank text as NULL; the generated type does not allow null
    p_emotion: entry.emotion ?? '',
    p_otc_medication: entry.otcMedication ?? '',
    p_no_medication: entry.noMedication,
    p_medications: entry.medications,
  };
  return saveOrUpdate(
    () => client.rpc('save_management_assessment', { p_date: entry.date, ...values }),
    () =>
      client.rpc('update_management_assessment', {
        p_week_start: getWeekStart(entry.date),
        ...values,
      }),
  );
}

/** The user's management entry for the week starting on `weekStart`, or null when there is none. */
export function getManagementEntryForWeek(
  weekStart: string,
  client: Client = supabase,
): Promise<Result<ManagementEntry | null>> {
  return run(async () => {
    const { data, error } = await client
      .from('personal_management')
      .select('*, personal_management_medication_names(medication_name)')
      .eq('week_start', weekStart)
      .maybeSingle();
    if (error) return fail(mapError(error));
    return ok(data ? toManagementEntry(data) : null);
  });
}

/** The Mondays of the weeks between the two week starts (inclusive) that have a management entry. */
export function getCompletedManagementWeeks(
  fromWeekStart: string,
  toWeekStart: string,
  client: Client = supabase,
): Promise<Result<Set<string>>> {
  return run(async () => {
    const { data, error } = await client
      .from('personal_management')
      .select('week_start')
      .gte('week_start', fromWeekStart)
      .lte('week_start', toWeekStart);
    if (error) return fail(mapError(error));
    const weeks = (data ?? []).flatMap((row) => (row.week_start ? [row.week_start] : []));
    return ok(new Set(weeks));
  });
}
