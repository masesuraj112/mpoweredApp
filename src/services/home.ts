// Data access for the home page: this week's assessment progress and the weekly reflection.
// Every function returns a Result and never throws to the UI.
// The Supabase client is the last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { WeeklyAssessmentId } from '@/features/assessments/homeProgress';
import { countWords, MAX_REFLECTION_WORDS } from '@/features/assessments/reflection';
import { getLocalToday } from '@/features/assessments/week';
import { mapError } from '@/lib/errors';
import { fail, ok, run, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;

const ASSESSMENT_TABLES = {
  pain: 'pain_assessment',
  movement: 'movement_assessment',
  personalCare: 'personal_care_assessment',
  socialHealth: 'social_health_assessment',
  management: 'personal_management',
} as const satisfies Record<WeeklyAssessmentId, keyof Database['public']['Tables']>;

/** For each assessment saved in the week, the date ('YYYY-MM-DD') the entry is for. */
export type WeeklyProgress = Partial<Record<WeeklyAssessmentId, string>>;

/** Which assessments the user has saved for the week starting on `weekStart`. */
export function getWeeklyProgress(
  weekStart: string,
  client: Client = supabase,
): Promise<Result<WeeklyProgress>> {
  return run(async () => {
    const ids = Object.keys(ASSESSMENT_TABLES) as WeeklyAssessmentId[];
    // RLS limits every table to the signed-in user's own rows; one row per week at most.
    const responses = await Promise.all(
      ids.map((id) =>
        client.from(ASSESSMENT_TABLES[id]).select('date').eq('week_start', weekStart).maybeSingle(),
      ),
    );

    const progress: WeeklyProgress = {};
    for (const [i, { data, error }] of responses.entries()) {
      if (error) return fail(mapError(error));
      if (data) progress[ids[i]] = data.date;
    }
    return ok(progress);
  });
}

export type WeeklyReflection = {
  entry: string;
  /** False for a draft saved by leaving the screen; true once the user taps Save. */
  isComplete: boolean;
  /** When it was last saved (ISO timestamp). */
  updatedAt: string;
};

/** The user's reflection for the week starting on `weekStart`, or null when there is none. */
export function getWeeklyReflection(
  weekStart: string,
  client: Client = supabase,
): Promise<Result<WeeklyReflection | null>> {
  return run(async () => {
    const { data, error } = await client
      .from('weekly_reflection')
      .select('entry, is_complete, updated_at')
      .eq('week_start', weekStart)
      .maybeSingle();
    if (error) return fail(mapError(error));
    return ok(data ? { entry: data.entry, isComplete: data.is_complete, updatedAt: data.updated_at } : null);
  });
}

/**
 * Saves this week's reflection, replacing any earlier text for the same week.
 * `isComplete: false` saves a draft; once a reflection is complete, a draft save keeps it complete.
 */
export async function saveWeeklyReflection(
  entry: string,
  { isComplete }: { isComplete: boolean },
  client: Client = supabase,
  options: { today?: string } = {},
): Promise<Result<number>> {
  const trimmed = entry.trim();
  if (trimmed === '') {
    return fail({
      code: 'VALIDATION',
      message: 'Write something before saving your reflection.',
      detail: 'MISSING_ANSWER',
      field: 'entry',
    });
  }
  if (countWords(trimmed) > MAX_REFLECTION_WORDS) {
    return fail({
      code: 'VALIDATION',
      message: `Your reflection can be at most ${MAX_REFLECTION_WORDS} words.`,
      detail: 'VALUE_TOO_LONG',
      field: 'entry',
    });
  }

  return run(async () => {
    const { data, error } = await client.rpc('save_weekly_reflection', {
      p_date: options.today ?? getLocalToday(),
      p_entry: trimmed,
      p_is_complete: isComplete,
    });
    if (error) return fail(mapError(error));
    if (typeof data !== 'number') {
      return fail({ code: 'UNKNOWN', message: 'The save did not return a reflection id.' });
    }
    return ok(data);
  });
}
