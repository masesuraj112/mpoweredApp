// Data access for the My Management assessment. Every function returns a Result and never throws
// to the UI. The Supabase client is the last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import type { ManagementAssessmentAnswers } from '@/features/assessments/management/types';
import {
  validateManagementAnswers,
  type ValidManagementEntry,
} from '@/features/assessments/management/validate';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
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

/** True when a stored entry holds exactly what we were trying to save. */
function matchesSaved(existing: ManagementEntry, saved: ValidManagementEntry): boolean {
  const savedNames = [...saved.medications].sort();
  return (
    existing.date === saved.date &&
    existing.exercise === saved.exercise &&
    existing.emotion === saved.emotion &&
    existing.otcMedication === saved.otcMedication &&
    existing.noMedication === saved.noMedication &&
    existing.medications.length === savedNames.length &&
    existing.medications.every((name, index) => name === savedNames[index])
  );
}

/**
 * Validates and saves one management submission (and its medication names) in a single
 * database call. Returns the new submission_id.
 *
 * Retry safety: if the week already has an entry that is identical to this one, an earlier
 * attempt committed but its response was lost, so that counts as success.
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

  return run(async () => {
    const { data, error } = await client.rpc('save_management_assessment', {
      p_date: entry.date,
      p_exercise: entry.exercise,
      // the function stores blank text as NULL; the generated type does not allow null
      p_emotion: entry.emotion ?? '',
      p_otc_medication: entry.otcMedication ?? '',
      p_no_medication: entry.noMedication,
      p_medications: entry.medications,
    });

    if (error) {
      const mapped = mapError(error);
      if (mapped.code === 'DUPLICATE_WEEK') {
        const existing = await getManagementEntryForWeek(getWeekStart(entry.date), client);
        if (existing.ok && existing.data && matchesSaved(existing.data, entry)) {
          return ok(existing.data.submissionId);
        }
      }
      return fail(mapped);
    }
    if (typeof data !== 'number') {
      return fail({ code: 'UNKNOWN', message: 'The save did not return a submission id.' });
    }
    return ok(data);
  });
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
