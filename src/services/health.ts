// Data access for the My Health pages: the pain profile, tracking records, history and
// prescriptions. Every function returns a Result and never throws to the UI.
// The Supabase client is the last optional argument so tests can pass a fake one.

import { addDays, getWeekEnd, getWeekStart } from '@/features/assessments/week';
import { ASSESSMENT_TYPES, type AssessmentType } from '@/features/health-profile/assessment-types';
import type {
  Form,
  Prescription,
  PrescriptionInput,
  StrengthUnit,
  UnitOfTime,
} from '@/features/health-profile/prescriptions';
import { mapError } from '@/lib/errors';
import { fail, ok, run, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

import {
  PAIN_ENTRY_SELECT,
  toPainEntry,
  type Client,
  type PainEntry,
  type PainRow,
} from './assessments';

type Tables = Database['public']['Tables'];

export type MovementEntry = {
  submissionId: number;
  date: string;
  weekStart: string;
  averageActiveHours: number;
  generalImpacts: string[];
  walking: string;
  lifting: string;
  sitting: string;
  standing: string;
};

export type PersonalCareEntry = {
  submissionId: number;
  date: string;
  weekStart: string;
  generalActivities: string[];
  washingDressing: string;
  sleeping: string;
};

export type SocialHealthEntry = {
  submissionId: number;
  date: string;
  weekStart: string;
  socialLife: string;
  travelling: string;
  mood: number;
  relationWithOthers: number;
  enjoymentOfLife: number;
  moodOverall: string;
};

export type ManagementEntry = {
  submissionId: number;
  date: string;
  weekStart: string;
  exercise: string;
  emotion: string | null;
  medications: string[];
};

/** One entry per assessment type; null when the user has no entry in that scope. */
export type AssessmentSet = {
  pain: PainEntry | null;
  movement: MovementEntry | null;
  personalCare: PersonalCareEntry | null;
  socialHealth: SocialHealthEntry | null;
  management: ManagementEntry | null;
};

export type UserProfile = {
  name: string;
  /** Null for accounts without a patient record (for example a support person). */
  sex: string | null;
  yearOfBirth: number | null;
  conditions: string[];
  otherConditions: string | null;
};

export type HealthProfile = { user: UserProfile; latest: AssessmentSet };

/** Either the most recent entry of each type, or the entry of each type in one week. */
export type AssessmentScope = { kind: 'latest' } | { kind: 'week'; weekStart: string };

const MOVEMENT_SELECT = '*, movement_general_impacts(impact_statement)';
const PERSONAL_CARE_SELECT = '*, personal_care_general_activities(activity_statement)';
const SOCIAL_HEALTH_SELECT = '*';
const MANAGEMENT_SELECT =
  '*, personal_management_medications(medications(name, strength, strength_unit))';

type MovementRow = Tables['movement_assessment']['Row'] & {
  movement_general_impacts: { impact_statement: string }[];
};
type PersonalCareRow = Tables['personal_care_assessment']['Row'] & {
  personal_care_general_activities: { activity_statement: string }[];
};
type SocialHealthRow = Tables['social_health_assessment']['Row'];
type ManagementRow = Tables['personal_management']['Row'] & {
  personal_management_medications: {
    medications: { name: string; strength: number; strength_unit: string } | null;
  }[];
};

function toMovementEntry(row: MovementRow): MovementEntry {
  return {
    submissionId: row.submission_id,
    date: row.date,
    weekStart: getWeekStart(row.date),
    averageActiveHours: Number(row.average_active_hours),
    generalImpacts: row.movement_general_impacts.map((i) => i.impact_statement),
    walking: row.walking_impact,
    lifting: row.lifting_impact,
    sitting: row.sitting_impact,
    standing: row.standing_impact,
  };
}

function toPersonalCareEntry(row: PersonalCareRow): PersonalCareEntry {
  return {
    submissionId: row.submission_id,
    date: row.date,
    weekStart: getWeekStart(row.date),
    generalActivities: row.personal_care_general_activities.map((a) => a.activity_statement),
    washingDressing: row.washing_dressing,
    sleeping: row.sleeping,
  };
}

function toSocialHealthEntry(row: SocialHealthRow): SocialHealthEntry {
  return {
    submissionId: row.submission_id,
    date: row.date,
    weekStart: getWeekStart(row.date),
    socialLife: row.social_life,
    travelling: row.travelling,
    mood: row.mood,
    relationWithOthers: row.relation_with_others,
    enjoymentOfLife: row.enjoyment_of_life,
    moodOverall: row.mood_overall,
  };
}

function toManagementEntry(row: ManagementRow): ManagementEntry {
  return {
    submissionId: row.submission_id,
    date: row.date,
    weekStart: getWeekStart(row.date),
    exercise: row.exercise,
    emotion: row.emotion,
    medications: row.personal_management_medications.flatMap(({ medications: m }) =>
      m ? [`${m.name} ${m.strength}${m.strength_unit === '%' ? '' : ' '}${m.strength_unit}`] : [],
    ),
  };
}

type AssessmentTable =
  | 'pain_assessment'
  | 'movement_assessment'
  | 'personal_care_assessment'
  | 'social_health_assessment'
  | 'personal_management';

/** Fetches the one row of a table that matches the scope, newest first. */
async function fetchOne<Row, Entry>(
  client: Client,
  table: AssessmentTable,
  select: string,
  scope: AssessmentScope,
  toEntry: (row: Row) => Entry,
): Promise<Result<Entry | null>> {
  let query = client.from(table).select(select);
  if (scope.kind === 'week') {
    query = query.gte('date', scope.weekStart).lte('date', getWeekEnd(scope.weekStart));
  }
  const { data, error } = await query.order('date', { ascending: false }).limit(1).maybeSingle();
  if (error) return fail(mapError(error));
  return ok(data ? toEntry(data as unknown as Row) : null);
}

/** The user's entry for each of the five assessments within the scope. */
export function getAssessments(
  scope: AssessmentScope,
  client: Client = supabase,
): Promise<Result<AssessmentSet>> {
  return run(async () => {
    const [pain, movement, personalCare, socialHealth, management] = await Promise.all([
      fetchOne<PainRow, PainEntry>(client, 'pain_assessment', PAIN_ENTRY_SELECT, scope, toPainEntry),
      fetchOne(client, 'movement_assessment', MOVEMENT_SELECT, scope, toMovementEntry),
      fetchOne(client, 'personal_care_assessment', PERSONAL_CARE_SELECT, scope, toPersonalCareEntry),
      fetchOne(client, 'social_health_assessment', SOCIAL_HEALTH_SELECT, scope, toSocialHealthEntry),
      fetchOne(client, 'personal_management', MANAGEMENT_SELECT, scope, toManagementEntry),
    ]);
    for (const result of [pain, movement, personalCare, socialHealth, management]) {
      if (!result.ok) return result;
    }
    return ok({
      pain: pain.ok ? pain.data : null,
      movement: movement.ok ? movement.data : null,
      personalCare: personalCare.ok ? personalCare.data : null,
      socialHealth: socialHealth.ok ? socialHealth.data : null,
      management: management.ok ? management.data : null,
    });
  });
}

/**
 * The signed-in user's name, demographics and conditions. Filters by auth_id rather than
 * trusting RLS to return one row (users_select can also return a patient's row).
 */
export function getUserProfile(client: Client = supabase): Promise<Result<UserProfile>> {
  return run(async () => {
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) return fail(mapError(sessionError));
    const authId = sessionData.session?.user.id;
    if (!authId) return fail({ code: 'NO_SESSION', message: 'You are not signed in.' });

    const { data: user, error: userError } = await client
      .from('users')
      .select('users_id, name')
      .eq('auth_id', authId)
      .maybeSingle();
    if (userError) return fail(mapError(userError));
    if (!user) return fail({ code: 'NO_PROFILE', message: 'No profile exists for this account.' });

    const { data: patient, error: patientError } = await client
      .from('patients')
      .select('sex, year_of_birth, other_conditions, patient_musko_skeletal_pain(disease)')
      .eq('users_id', user.users_id)
      .maybeSingle();
    if (patientError) return fail(mapError(patientError));

    return ok({
      name: user.name,
      sex: patient?.sex ?? null,
      yearOfBirth: patient?.year_of_birth ?? null,
      conditions: patient?.patient_musko_skeletal_pain.map((c) => c.disease) ?? [],
      otherConditions: patient?.other_conditions?.trim() || null,
    });
  });
}

/** Everything the pain profile shows: the user's details and their latest entry of each type. */
export function getHealthProfile(client: Client = supabase): Promise<Result<HealthProfile>> {
  return run(async () => {
    const [user, latest] = await Promise.all([
      getUserProfile(client),
      getAssessments({ kind: 'latest' }, client),
    ]);
    if (!user.ok) return user;
    if (!latest.ok) return latest;
    return ok({ user: user.data, latest: latest.data });
  });
}

/**
 * One page of pain entries, newest week first. Pass the oldest week already loaded as
 * `beforeWeek` to get the page after it.
 */
export function getPainEntries(
  options: { limit: number; beforeWeek?: string },
  client: Client = supabase,
): Promise<Result<PainEntry[]>> {
  return run(async () => {
    let query = client.from('pain_assessment').select(PAIN_ENTRY_SELECT);
    if (options.beforeWeek) query = query.lt('week_start', options.beforeWeek);
    const { data, error } = await query
      .order('week_start', { ascending: false })
      .limit(options.limit);
    if (error) return fail(mapError(error));
    return ok((data ?? []).map((row) => toPainEntry(row as unknown as PainRow)));
  });
}

export type CompletedWeeks = Record<AssessmentType, Set<string>>;

const COMPLETION_TABLES: Record<AssessmentType, AssessmentTable> = {
  pain: 'pain_assessment',
  movement: 'movement_assessment',
  personalCare: 'personal_care_assessment',
  socialHealth: 'social_health_assessment',
  management: 'personal_management',
};

/** For each assessment type, the week_start of every week in the range that has an entry. */
export function getCompletedWeeks(
  fromWeekStart: string,
  toWeekStart: string,
  client: Client = supabase,
): Promise<Result<CompletedWeeks>> {
  return run(async () => {
    const results = await Promise.all(
      ASSESSMENT_TYPES.map((type) =>
        client
          .from(COMPLETION_TABLES[type] as 'pain_assessment')
          .select('date')
          .gte('date', fromWeekStart)
          .lte('date', addDays(toWeekStart, 6)),
      ),
    );
    const completed = {} as CompletedWeeks;
    for (const [index, type] of ASSESSMENT_TYPES.entries()) {
      const { data, error } = results[index];
      if (error) return fail(mapError(error));
      completed[type] = new Set((data ?? []).map((row) => getWeekStart(row.date)));
    }
    return ok(completed);
  });
}

const PRESCRIPTION_SELECT =
  'medication_id, name, strength, strength_unit, form, dosage(amount, repeats_every, unit_of_time)';

type PrescriptionRow = Pick<
  Tables['medications']['Row'],
  'medication_id' | 'name' | 'strength' | 'strength_unit' | 'form'
> & {
  dosage: Pick<Tables['dosage']['Row'], 'amount' | 'repeats_every' | 'unit_of_time'> | null;
};

function toPrescription(row: PrescriptionRow): Prescription {
  return {
    id: row.medication_id,
    name: row.name,
    strength: Number(row.strength),
    strengthUnit: row.strength_unit as StrengthUnit,
    form: row.form as Form,
    // Every prescription saved by save_prescription has a dosage; these defaults only cover
    // rows added by hand.
    amount: Number(row.dosage?.amount ?? 1),
    repeatsEvery: row.dosage?.repeats_every ?? 1,
    unitOfTime: (row.dosage?.unit_of_time ?? 'days') as UnitOfTime,
  };
}

/** The user's current prescriptions (not deleted), oldest first. */
export function getPrescriptions(client: Client = supabase): Promise<Result<Prescription[]>> {
  return run(async () => {
    const { data, error } = await client
      .from('medications')
      .select(PRESCRIPTION_SELECT)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (error) return fail(mapError(error));
    return ok((data ?? []).map((row) => toPrescription(row as unknown as PrescriptionRow)));
  });
}

/** One prescription for the edit screen; NOT_FOUND when it does not exist or was deleted. */
export function getPrescription(
  id: number,
  client: Client = supabase,
): Promise<Result<Prescription>> {
  return run(async () => {
    const { data, error } = await client
      .from('medications')
      .select(PRESCRIPTION_SELECT)
      .eq('medication_id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) return fail(mapError(error));
    if (!data) return fail({ code: 'NOT_FOUND', message: 'Prescription not found.' });
    return ok(toPrescription(data as unknown as PrescriptionRow));
  });
}

/** Adds a prescription, or edits it when `id` is given. Returns the medication id. */
export function savePrescription(
  input: PrescriptionInput,
  id?: number,
  client: Client = supabase,
): Promise<Result<number>> {
  return run(async () => {
    const { data, error } = await client.rpc('save_prescription', {
      p_name: input.name,
      p_strength: input.strength,
      p_strength_unit: input.strengthUnit,
      p_form: input.form,
      p_amount: input.amount,
      p_repeats_every: input.repeatsEvery,
      p_unit_of_time: input.unitOfTime,
      ...(id === undefined ? {} : { p_medication_id: id }),
    });
    if (error) return fail(mapError(error));
    if (typeof data !== 'number') {
      return fail({ code: 'UNKNOWN', message: 'The save did not return a medication id.' });
    }
    return ok(data);
  });
}

/**
 * Removes a prescription from the list. The row is kept with deleted_at set, because past
 * Management entries still name the medication.
 */
export function deletePrescription(id: number, client: Client = supabase): Promise<Result<void>> {
  return run(async () => {
    const { data, error } = await client
      .from('medications')
      .update({ deleted_at: new Date().toISOString() })
      .eq('medication_id', id)
      .is('deleted_at', null)
      .select('medication_id');
    if (error) return fail(mapError(error));
    if (!data || data.length === 0) {
      return fail({ code: 'NOT_FOUND', message: 'Prescription not found.' });
    }
    return ok(undefined);
  });
}
