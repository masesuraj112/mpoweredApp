// Data access for the social health assessment. Every function returns a Result and never throws
// to the UI. The Supabase client is the last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import type { SocialHealthAssessmentAnswers } from '@/features/assessments/social-health/types';
import { validateSocialHealthAnswers } from '@/features/assessments/social-health/validate';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import { saveOrUpdate } from '@/services/saveOrUpdate';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;

type SocialHealthRow = Database['public']['Tables']['social_health_assessment']['Row'];

/** A saved social health submission. */
export type SocialHealthEntry = {
  submissionId: number;
  date: string;
  weekStart: string;
  socialLife: string;
  travelling: string;
  mood: number;
  relationWithOthers: number;
  enjoymentOfLife: number;
  /** The full "I was feeling ..." sentence. */
  moodOverall: string;
  reflection: string | null;
};

/** Runs a database call and converts both returned errors and thrown ones (for example a lost connection). */
async function run<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await call();
  } catch (error) {
    return fail(mapError(error));
  }
}

function toSocialHealthEntry(row: SocialHealthRow): SocialHealthEntry {
  return {
    submissionId: row.submission_id,
    date: row.date,
    weekStart: row.week_start ?? getWeekStart(row.date),
    socialLife: row.social_life,
    travelling: row.travelling,
    mood: row.mood,
    relationWithOthers: row.relation_with_others,
    enjoymentOfLife: row.enjoyment_of_life,
    moodOverall: row.mood_overall,
    reflection: row.reflection,
  };
}

/**
 * Validates and saves one social health submission in a single database call.
 * Returns the submission_id.
 *
 * When the week already has an entry, the user is editing it: its answers are replaced and its
 * id is returned (see saveOrUpdate). That also makes a retry after a lost response safe.
 */
export async function saveSocialHealthEntry(
  answers: SocialHealthAssessmentAnswers,
  entryDate: string,
  client: Client = supabase,
  options: { today?: string; startWeek?: string } = {},
): Promise<Result<number>> {
  const validated = validateSocialHealthAnswers(answers, {
    entryDate,
    today: options.today ?? getLocalToday(),
    startWeek: options.startWeek,
  });
  if (!validated.ok) return validated;
  const entry = validated.data;

  const values = {
    p_social_life: entry.socialLife,
    p_travelling: entry.travelling,
    p_mood: entry.mood,
    p_relation_with_others: entry.relationWithOthers,
    p_enjoyment_of_life: entry.enjoymentOfLife,
    p_mood_overall: entry.moodOverall,
    // the function stores a blank reflection as NULL; the generated type does not allow null
    p_reflection: entry.reflection ?? '',
  };
  return saveOrUpdate(
    () => client.rpc('save_social_health_assessment', { p_date: entry.date, ...values }),
    () =>
      client.rpc('update_social_health_assessment', {
        p_week_start: getWeekStart(entry.date),
        ...values,
      }),
  );
}

/** The user's social health entry for the week starting on `weekStart`, or null when there is none. */
export function getSocialHealthEntryForWeek(
  weekStart: string,
  client: Client = supabase,
): Promise<Result<SocialHealthEntry | null>> {
  return run(async () => {
    const { data, error } = await client
      .from('social_health_assessment')
      .select('*')
      .eq('week_start', weekStart)
      .maybeSingle();
    if (error) return fail(mapError(error));
    return ok(data ? toSocialHealthEntry(data) : null);
  });
}
