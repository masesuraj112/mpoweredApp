// Data access for the social health assessment. Every function returns a Result and never throws
// to the UI. The Supabase client is the last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';

import type { SocialHealthAssessmentAnswers } from '@/features/assessments/social-health/types';
import {
  validateSocialHealthAnswers,
  type ValidSocialHealthEntry,
} from '@/features/assessments/social-health/validate';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
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

/** True when a stored entry holds exactly what we were trying to save. */
function matchesSaved(existing: SocialHealthEntry, saved: ValidSocialHealthEntry): boolean {
  return (
    existing.date === saved.date &&
    existing.socialLife === saved.socialLife &&
    existing.travelling === saved.travelling &&
    existing.mood === saved.mood &&
    existing.relationWithOthers === saved.relationWithOthers &&
    existing.enjoymentOfLife === saved.enjoymentOfLife &&
    existing.moodOverall === saved.moodOverall &&
    existing.reflection === saved.reflection
  );
}

/**
 * Validates and saves one social health submission in a single database call.
 * Returns the new submission_id.
 *
 * Retry safety: if the week already has an entry that is identical to this one, an earlier
 * attempt committed but its response was lost, so that counts as success.
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

  return run(async () => {
    const { data, error } = await client.rpc('save_social_health_assessment', {
      p_date: entry.date,
      p_social_life: entry.socialLife,
      p_travelling: entry.travelling,
      p_mood: entry.mood,
      p_relation_with_others: entry.relationWithOthers,
      p_enjoyment_of_life: entry.enjoymentOfLife,
      p_mood_overall: entry.moodOverall,
      // the function stores a blank reflection as NULL; the generated type does not allow null
      p_reflection: entry.reflection ?? '',
    });

    if (error) {
      const mapped = mapError(error);
      if (mapped.code === 'DUPLICATE_WEEK') {
        const existing = await getSocialHealthEntryForWeek(getWeekStart(entry.date), client);
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
