// Data access for assessments. Every function returns a Result and never throws to the UI.
// The Supabase client is the last optional argument so tests can pass a fake one.

import type { SupabaseClient } from '@supabase/supabase-js';
import { validateMovementAnswers, type ValidMovementEntry } from '@/features/assessments/movement/validate';
import type { MovementAssessmentAnswers } from '@/features/assessments/movement/types';

import { dedupe } from '@/features/assessments/pain/normalise';
import type { PainAssessmentAnswers } from '@/features/assessments/pain/types';
import { validatePainAnswers, type ValidPainEntry } from '@/features/assessments/pain/validate';
import { addWeeks, getLocalToday, getWeekStart } from '@/features/assessments/week';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;

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

type PainRow = Database['public']['Tables']['pain_assessment']['Row'] & {
  pain_location: { pain_location: string }[];
  pain_characteristics: { pain_characteristic: string }[];
};

const PAIN_ENTRY_SELECT =
  '*, pain_location(pain_location), pain_characteristics(pain_characteristic)';

/** Runs a database call and converts both returned errors and thrown ones (for example a lost connection). */
async function run<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await call();
  } catch (error) {
    return fail(mapError(error));
  }
}

function toPainEntry(row: PainRow): PainEntry {
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

const sameValues = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().every((value, i) => value === [...b].sort()[i]);

/** True when a stored entry holds exactly what we were trying to save. */
function matchesSaved(existing: PainEntry, saved: ValidPainEntry): boolean {
  return (
    existing.date === saved.date &&
    existing.current === saved.current &&
    existing.mildest === saved.mildest &&
    existing.worst === saved.worst &&
    existing.average === saved.average &&
    sameValues(existing.locations, saved.locations) &&
    sameValues(existing.characteristics, saved.characteristics)
  );
}

/**
 * Validates, normalises and saves one pain submission in a single database call.
 * Returns the new submission_id.
 *
 * Retry safety: if the week already has an entry that is identical to this one, an earlier
 * attempt committed but its response was lost, so that counts as success.
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

  return run(async () => {
    const { data, error } = await client.rpc('save_pain_assessment', {
      p_date: entry.date,
      p_current: entry.current,
      p_mildest: entry.mildest,
      p_worst: entry.worst,
      p_average: entry.average,
      p_locations: entry.locations,
      p_characteristics: entry.characteristics,
    });

    if (error) {
      const mapped = mapError(error);
      if (mapped.code === 'DUPLICATE_WEEK') {
        const existing = await getPainEntryForWeek(getWeekStart(entry.date), client);
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

/** Runs a save call and maps its failures. `findIdenticalEntry` is only asked on DUPLICATE_WEEK. */
function saveEntry(
  call: () => PromiseLike<{ data: number | null; error: unknown }>,
  findIdenticalEntry: () => Promise<number | null>,
): Promise<Result<number>> {
  return run(async () => {
    const { data, error } = await call();
    if (error) {
      const mapped = mapError(error);
      if (mapped.code === 'DUPLICATE_WEEK') {
        const identicalId = await findIdenticalEntry();
        if (identicalId !== null) return ok(identicalId);
      }
      return fail(mapped);
    }
    if (typeof data !== 'number') {
      return fail({ code: 'UNKNOWN', message: 'The save did not return a submission id.' });
    }
    return ok(data);
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

function matchesSavedMovement(existing: MovementEntry, saved: ValidMovementEntry): boolean {
  return (
    existing.date === saved.date &&
    existing.activeHours === saved.activeHours &&
    existing.walking === saved.walking &&
    existing.lifting === saved.lifting &&
    existing.sitting === saved.sitting &&
    existing.standing === saved.standing &&
    existing.reflection === saved.reflection &&
    sameValues(existing.generalImpacts, saved.generalImpacts)
  );
}

/**
 * Validates and saves one movement submission in a single database call.
 * Returns the new submission_id.
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

  return saveEntry(
    () =>
      client.rpc('save_movement_assessment', {
        p_date: entry.date,
        p_active_hours: entry.activeHours,
        p_general_impacts: entry.generalImpacts,
        p_walking: entry.walking,
        p_lifting: entry.lifting,
        p_sitting: entry.sitting,
        p_standing: entry.standing,
        // the database turns a blank reflection into null
        p_reflection: entry.reflection ?? '',
      }),
    async () => {
      const existing = await getMovementEntryForWeek(getWeekStart(entry.date), client);
      return existing.ok && existing.data && matchesSavedMovement(existing.data, entry)
        ? existing.data.submissionId
        : null;
    },
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