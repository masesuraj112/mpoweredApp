// Data access for assessments. Every function returns a Result and never throws to the UI.
// The Supabase client is the last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';
import { validateMovementAnswers } from '@/features/assessments/movement/validate';
import type { MovementAssessmentAnswers } from '@/features/assessments/movement/types';
import type { PersonalCareAssessmentAnswers } from '@/features/assessments/personal-care/types';
import { validatePersonalCareAnswers } from '@/features/assessments/personal-care/validate';
import { dedupe } from '@/features/assessments/pain/normalise';
import type { PainAssessmentAnswers } from '@/features/assessments/pain/types';
import { validatePainAnswers } from '@/features/assessments/pain/validate';
import { addWeeks, getLocalToday, getWeekStart } from '@/features/assessments/week';
import { mapError } from '@/lib/errors';
import { fail, ok, run, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import { saveOrUpdate } from '@/services/saveOrUpdate';
import type { Database } from '@/types/database';

export type Client = SupabaseClient<Database>;

/** A saved pain submission with its locations and characteristics. */
export type PainEntry = {
  submissionId: number;
  date: string;
  weekStart: string;
  current: number;
  mildest: number;
  worst: number;
  average: number;
  locations: string[];
  characteristics: string[];
};

export type PainRow = Database['public']['Tables']['pain_assessment']['Row'] & {
  pain_location: { pain_location: string }[];
  pain_characteristics: { pain_characteristic: string }[];
};

export const PAIN_ENTRY_SELECT =
  '*, pain_location(pain_location), pain_characteristics(pain_characteristic)';

export function toPainEntry(row: PainRow): PainEntry {
  return {
    submissionId: row.submission_id,
    date: row.date,
    weekStart: row.week_start ?? getWeekStart(row.date),
    current: row.current_pain_level,
    mildest: row.mildest_pain_level,
    worst: row.worst_pain_level,
    average: row.average_pain_level,
    locations: row.pain_location.map((l) => l.pain_location),
    characteristics: row.pain_characteristics.map((c) => c.pain_characteristic),
  };
}

/**
 * Validates, normalises and saves one pain submission in a single database call.
 * Returns the submission_id.
 *
 * When the week already has an entry, the user is editing it: its answers are replaced and its
 * id is returned (see saveOrUpdate). That also makes a retry after a lost response safe.
 */
export async function savePainEntry(
  answers: PainAssessmentAnswers,
  entryDate: string,
  client: Client = supabase,
  options: { today?: string; startWeek?: string } = {},
): Promise<Result<number>> {
  const validated = validatePainAnswers(answers, {
    entryDate,
    today: options.today ?? getLocalToday(),
    startWeek: options.startWeek,
  });
  if (!validated.ok) return validated;
  const entry = validated.data;

  const levels = {
    p_current: entry.current,
    p_mildest: entry.mildest,
    p_worst: entry.worst,
    p_average: entry.average,
    p_locations: entry.locations,
    p_characteristics: entry.characteristics,
  };
  return saveOrUpdate(
    () => client.rpc('save_pain_assessment', { p_date: entry.date, ...levels }),
    () =>
      client.rpc('update_pain_assessment', { p_week_start: getWeekStart(entry.date), ...levels }),
  );
}

/** The user's pain entry for the week starting on `weekStart`, or null when there is none. */
export function getPainEntryForWeek(
  weekStart: string,
  client: Client = supabase,
): Promise<Result<PainEntry | null>> {
  return run(async () => {
    const { data, error } = await client
      .from('pain_assessment')
      .select(PAIN_ENTRY_SELECT)
      .eq('week_start', weekStart)
      .maybeSingle();
    if (error) return fail(mapError(error));
    return ok(data ? toPainEntry(data as unknown as PainRow) : null);
  });
}

/** The week_start of every week in the range that has a submission (for the calendar dots). */
export function getCompletedPainWeeks(
  fromWeekStart: string,
  toWeekStart: string,
  client: Client = supabase,
): Promise<Result<Set<string>>> {
  return run(async () => {
    const { data, error } = await client
      .from('pain_assessment')
      .select('week_start')
      .gte('week_start', fromWeekStart)
      .lte('week_start', toWeekStart);
    if (error) return fail(mapError(error));
    const weeks = (data ?? []).flatMap((row) => (row.week_start ? [row.week_start] : []));
    return ok(new Set(weeks));
  });
}

/**
 * The Monday of the week the user joined, in the device's timezone. Filters by auth_id rather
 * than trusting RLS to return one row (users_select can also return a patient's row).
 */
export function getUserStartWeek(client: Client = supabase): Promise<Result<string>> {
  return run(async () => {
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) return fail(mapError(sessionError));
    const authId = sessionData.session?.user.id;
    if (!authId) return fail({ code: 'NO_SESSION', message: 'You are not signed in.' });

    const { data, error } = await client
      .from('users')
      .select('created_at')
      .eq('auth_id', authId)
      .maybeSingle();
    if (error) return fail(mapError(error));
    if (!data) return fail({ code: 'NO_PROFILE', message: 'No profile exists for this account.' });
    return ok(getWeekStart(getLocalToday(new Date(data.created_at))));
  });
}

/** Distinct locations from the last few weeks (including this one), for the quick-pick chips. */
export function getRecentPainLocations(
  weeks = 2,
  client: Client = supabase,
  today: string = getLocalToday(),
): Promise<Result<string[]>> {
  return run(async () => {
    const cutoff = addWeeks(getWeekStart(today), -(weeks - 1));
    const { data, error } = await client
      .from('pain_assessment')
      .select('pain_location(pain_location)')
      .gte('week_start', cutoff);
    if (error) return fail(mapError(error));
    const locations = (data ?? []).flatMap((row) => row.pain_location.map((l) => l.pain_location));
    return ok(dedupe(locations));
  });
}

/** A saved personal care submission with its general activities. */
export type PersonalCareEntry = {
  submissionId: number;
  date: string;
  weekStart: string;
  generalActivities: string[];
  washingDressing: string;
  sleeping: string;
  reflection: string | null;
};

type PersonalCareRow = Database['public']['Tables']['personal_care_assessment']['Row'] & {
  personal_care_general_activities: { activity_statement: string }[];
};

const PERSONAL_CARE_SELECT = '*, personal_care_general_activities(activity_statement)';

function toPersonalCareEntry(row: PersonalCareRow): PersonalCareEntry {
  return {
    submissionId: row.submission_id,
    date: row.date,
    weekStart: row.week_start ?? getWeekStart(row.date),
    generalActivities: row.personal_care_general_activities.map((a) => a.activity_statement),
    washingDressing: row.washing_dressing,
    sleeping: row.sleeping,
    reflection: row.reflection,
  };
}

/**
 * Validates and saves one personal care submission in a single database call.
 * Returns the submission_id. A week that already has an entry has its answers replaced.
 */
export async function savePersonalCareEntry(
  answers: PersonalCareAssessmentAnswers,
  entryDate: string,
  client: Client = supabase,
  options: { today?: string; startWeek?: string } = {},
): Promise<Result<number>> {
  const validated = validatePersonalCareAnswers(answers, {
    entryDate,
    today: options.today ?? getLocalToday(),
    startWeek: options.startWeek,
  });
  if (!validated.ok) return validated;
  const entry = validated.data;

  const values = {
    p_general_activities: entry.generalActivities,
    p_washing_dressing: entry.washingDressing,
    p_sleeping: entry.sleeping,
    // the database turns a blank reflection into null
    p_reflection: entry.reflection ?? '',
  };
  return saveOrUpdate(
    () => client.rpc('save_personal_care_assessment', { p_date: entry.date, ...values }),
    () =>
      client.rpc('update_personal_care_assessment', {
        p_week_start: getWeekStart(entry.date),
        ...values,
      }),
  );
}

/** The user's personal care entry for the week starting on `weekStart`, or null when there is none. */
export function getPersonalCareEntryForWeek(
  weekStart: string,
  client: Client = supabase,
): Promise<Result<PersonalCareEntry | null>> {
  return run(async () => {
    const { data, error } = await client
      .from('personal_care_assessment')
      .select(PERSONAL_CARE_SELECT)
      .eq('week_start', weekStart)
      .maybeSingle();
    if (error) return fail(mapError(error));
    return ok(data ? toPersonalCareEntry(data as unknown as PersonalCareRow) : null);
  });
}

/** A saved movement submission with its general impacts. */
export type MovementEntry = {
  submissionId: number;
  date: string;
  weekStart: string;
  activeHours: number;
  generalImpacts: string[];
  walking: string;
  lifting: string;
  sitting: string;
  standing: string;
  reflection: string | null;
};

type MovementRow = Database['public']['Tables']['movement_assessment']['Row'] & {
  movement_general_impacts: { impact_statement: string }[];
};

const MOVEMENT_SELECT = '*, movement_general_impacts(impact_statement)';

function toMovementEntry(row: MovementRow): MovementEntry {
  return {
    submissionId: row.submission_id,
    date: row.date,
    weekStart: row.week_start ?? getWeekStart(row.date),
    // convert explicitly so a numeric value that arrives as text still becomes a number
    activeHours: Number(row.average_active_hours),
    generalImpacts: row.movement_general_impacts.map((i) => i.impact_statement),
    walking: row.walking_impact,
    lifting: row.lifting_impact,
    sitting: row.sitting_impact,
    standing: row.standing_impact,
    reflection: row.reflection,
  };
}

/**
 * Validates and saves one movement submission in a single database call.
 * Returns the submission_id. A week that already has an entry has its answers replaced.
 */
export async function saveMovementEntry(
  answers: MovementAssessmentAnswers,
  entryDate: string,
  client: Client = supabase,
  options: { today?: string; startWeek?: string } = {},
): Promise<Result<number>> {
  const validated = validateMovementAnswers(answers, {
    entryDate,
    today: options.today ?? getLocalToday(),
    startWeek: options.startWeek,
  });
  if (!validated.ok) return validated;
  const entry = validated.data;

  const values = {
    p_active_hours: entry.activeHours,
    p_general_impacts: entry.generalImpacts,
    p_walking: entry.walking,
    p_lifting: entry.lifting,
    p_sitting: entry.sitting,
    p_standing: entry.standing,
    // the database turns a blank reflection into null
    p_reflection: entry.reflection ?? '',
  };
  return saveOrUpdate(
    () => client.rpc('save_movement_assessment', { p_date: entry.date, ...values }),
    () =>
      client.rpc('update_movement_assessment', { p_week_start: getWeekStart(entry.date), ...values }),
  );
}

/** The user's movement entry for the week starting on `weekStart`, or null when there is none. */
export function getMovementEntryForWeek(
  weekStart: string,
  client: Client = supabase,
): Promise<Result<MovementEntry | null>> {
  return run(async () => {
    const { data, error } = await client
      .from('movement_assessment')
      .select(MOVEMENT_SELECT)
      .eq('week_start', weekStart)
      .maybeSingle();
    if (error) return fail(mapError(error));
    return ok(data ? toMovementEntry(data as unknown as MovementRow) : null);
  });
}