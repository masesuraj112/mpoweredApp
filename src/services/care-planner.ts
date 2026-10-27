// Data access for the patient's Care Planner. Every function returns a Result and never throws to
// the UI. The Supabase client is the last optional argument so tests can pass a fake one.
// The caller is always worked out by the database from the session: no patient or user id is sent.

import { accessTypeToDb } from '@/features/care-planner/accessType';
import type { RecordingConsentInput } from '@/features/care-planner/consentTypes';
import {
  mapAppointment,
  mapAppointmentPlan,
  mapGeneratedQuestionGroups,
  mapQuestionSuggestions,
  mapSupportPeopleFromLinks,
  mapSupportPerson,
  type AppointmentPlanRow,
  type AppointmentRow,
  type QuestionRow,
  type SuggestionsRow,
  type SupportPersonLinkRow,
  type SupportPersonRow,
} from '@/features/care-planner/mappers';
import type { AnswerInput, AppointmentPlan } from '@/features/care-planner/planTypes';
import { generateQuestions } from '@/features/care-planner/question-generation';
import { MAX_SUPPORT_PEOPLE } from '@/features/care-planner/supportPerson';
import { isSignatureWithinLimit } from '@/features/care-planner/signature';
import type {
  QuestionSuggestions,
  SuggestedQuestionGroup,
} from '@/features/care-planner/suggestionTypes';
import type {
  Appointment,
  AppointmentRef,
  NewAppointmentInput,
  SupportPerson,
} from '@/features/care-planner/types';
import { isValidAuMobile } from '@/features/auth/phone';
import { mapError, type AppError } from '@/lib/errors';
import { fail, ok, run, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';
import { toIsoDate } from '@/services/date';

import { type Client } from './assessments';
import { getAssessments } from './health';

export const MAX_PRACTITIONER_NAME_LENGTH = 100;
export const MAX_ANSWER_LENGTH = 4000;

const LOCAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

const NOT_FOUND: AppError = { code: 'NOT_FOUND', message: 'NOT_FOUND' };

/** A validation problem the app found itself, shaped like one the database would raise. */
const invalid = (detail: string): AppError => ({ code: 'VALIDATION', message: detail, detail });

const APPOINTMENT_PLAN_SELECT = `appointment_id, date_time, practitioner_name, health_service, status,
  recording_consent_at,
  appointment_questions(question_id, group_key, sort_order, question, is_selected, answer),
  appointment_has_support_persons(support_persons(support_person_id, name, phone_number, email, access_type))`;

const APPOINTMENT_SUGGESTIONS_SELECT = `appointment_id, status, suggestions_generated_on,
  appointment_questions(question_id, group_key, sort_order, question, is_selected, answer)`;

const SUPPORT_PERSON_COLUMNS = 'support_person_id, name, phone_number, email, access_type';

/** What is wrong with an appointment's details, or null when they are fine. */
function appointmentInputError(input: NewAppointmentInput): AppError | null {
  if (!LOCAL_TIMESTAMP_PATTERN.test(input.dateTime)) {
    return { code: 'VALIDATION', message: 'INVALID_DATE_TIME' };
  }
  if (
    input.practitionerName !== null &&
    input.practitionerName.length > MAX_PRACTITIONER_NAME_LENGTH
  ) {
    return { code: 'VALIDATION', message: 'NAME_TOO_LONG' };
  }
  return null;
}

/** The arguments for `save_appointment_details`. The function stores blank values as NULL. */
function detailsArgs(input: NewAppointmentInput) {
  return {
    p_date_time: input.dateTime,
    p_practitioner_name: input.practitionerName ?? '',
    p_health_service: input.healthService ?? '',
  };
}

// ---------------------------------------------------------------- appointments

/** The signed-in patient's saved appointments. Drafts are not listed. Unsorted: callers sort. */
export function listAppointments(client: Client = supabase): Promise<Result<Appointment[]>> {
  return run(async () => {
    const { data, error } = await client.rpc('list_my_appointments');
    if (error) return fail(mapError(error));
    return ok((data ?? []).map((row) => mapAppointment(row as AppointmentRow)));
  });
}

/**
 * Creates a draft appointment. `dateTime` is local wall-clock `YYYY-MM-DDTHH:mm:ss`; it is sent
 * as it is, never converted.
 */
export function createAppointment(
  input: NewAppointmentInput,
  client: Client = supabase,
): Promise<Result<AppointmentRef>> {
  return run(async () => {
    const problem = appointmentInputError(input);
    if (problem) return fail(problem);
    const { data, error } = await client.rpc('save_appointment_details', detailsArgs(input));
    if (error) return fail(mapError(error));
    return ok({ appointmentId: data });
  });
}

/**
 * Changes an appointment's details (the wizard goes back and forward, so it must not create a
 * second record).
 */
export function updateAppointmentDetails(
  appointmentId: number,
  input: NewAppointmentInput,
  client: Client = supabase,
): Promise<Result<AppointmentRef>> {
  return run(async () => {
    const problem = appointmentInputError(input);
    if (problem) return fail(problem);
    const { data, error } = await client.rpc('save_appointment_details', {
      ...detailsArgs(input),
      p_appointment_id: appointmentId,
    });
    if (error) return fail(mapError(error));
    return ok({ appointmentId: data });
  });
}

/** Marks a draft appointment as saved, so it appears in My Appointments. Saving again is fine. */
export function markAppointmentSaved(
  appointmentId: number,
  client: Client = supabase,
): Promise<Result<void>> {
  return run(async () => {
    const { error } = await client.rpc('save_appointment', { p_appointment_id: appointmentId });
    if (error) return fail(mapError(error));
    return ok(undefined);
  });
}

// ---------------------------------------------------------------- support people

/** The support people chosen for an appointment (none for a new one). */
export function getSupportPeople(
  appointmentId: number,
  client: Client = supabase,
): Promise<Result<SupportPerson[]>> {
  return run(async () => {
    const { data, error } = await client
      .from('appointment_has_support_persons')
      .select(`support_persons(${SUPPORT_PERSON_COLUMNS})`)
      .eq('appointment_id', appointmentId);
    if (error) return fail(mapError(error));
    return ok(mapSupportPeopleFromLinks((data ?? []) as unknown as SupportPersonLinkRow[]));
  });
}

/** What is wrong with a support person about to be saved, or null when it is fine. */
function supportPersonError(person: SupportPerson): AppError | null {
  if (person.name.trim() === '') return invalid('INVALID_SUPPORT_PERSON');
  if (person.phone !== null && person.phone.trim() !== '' && !isValidAuMobile(person.phone)) {
    return { code: 'INVALID_PHONE', message: 'INVALID_PHONE' };
  }
  return null;
}

/** The arguments for `save_support_person`. The function stores blank values as NULL. */
function supportPersonArgs(person: SupportPerson) {
  return {
    p_name: person.name,
    p_phone: person.phone ?? '',
    p_email: person.email ?? '',
    p_access_type: accessTypeToDb(person),
  };
}

/**
 * Saves the support people for an appointment. This REPLACES the earlier list, so going back and
 * saving again never duplicates anyone. An empty list means "no support person". Returns the
 * saved list, with ids.
 */
export function saveSupportPeople(
  appointmentId: number,
  people: SupportPerson[],
  client: Client = supabase,
): Promise<Result<SupportPerson[]>> {
  return run(async () => {
    if (people.length > MAX_SUPPORT_PEOPLE) {
      return fail(invalid('TOO_MANY_SUPPORT_PEOPLE'));
    }
    for (const person of people) {
      // a person who is already stored is only linked, so their details are not checked again
      const problem = person.supportPersonId === undefined ? supportPersonError(person) : null;
      if (problem) return fail(problem);
    }

    const items = people.map((person) =>
      person.supportPersonId === undefined
        ? {
            name: person.name,
            phone: person.phone ?? '',
            email: person.email ?? '',
            access_type: accessTypeToDb(person),
          }
        : { support_person_id: person.supportPersonId },
    );
    const { data, error } = await client.rpc('save_appointment_support_people', {
      p_appointment_id: appointmentId,
      p_people: items,
    });
    if (error) return fail(mapError(error));
    return ok(((data ?? []) as SupportPersonRow[]).map(mapSupportPerson));
  });
}

/** Every support person the signed-in patient has added (the Settings > Support Persons list). */
export function listMySupportPersons(
  client: Client = supabase,
): Promise<Result<SupportPerson[]>> {
  return run(async () => {
    const { data, error } = await client.rpc('list_my_support_persons');
    if (error) return fail(mapError(error));
    return ok(((data ?? []) as SupportPersonRow[]).map(mapSupportPerson));
  });
}

/**
 * Adds a support person, or edits one when `person.supportPersonId` is set. Adding a mobile
 * number the patient already has updates that person.
 */
export function saveSupportPerson(
  person: SupportPerson,
  client: Client = supabase,
): Promise<Result<SupportPerson>> {
  return run(async () => {
    const problem = supportPersonError(person);
    if (problem) return fail(problem);
    const { data, error } = await client.rpc('save_support_person', {
      ...supportPersonArgs(person),
      ...(person.supportPersonId === undefined
        ? {}
        : { p_support_person_id: person.supportPersonId }),
    });
    if (error) return fail(mapError(error));
    return ok(mapSupportPerson(data as SupportPersonRow));
  });
}

/** Deletes a support person. Their links to appointments go with them. */
export function deleteSupportPerson(
  supportPersonId: number,
  client: Client = supabase,
): Promise<Result<void>> {
  return run(async () => {
    const { error } = await client
      .from('support_persons')
      .delete()
      .eq('support_person_id', supportPersonId);
    if (error) return fail(mapError(error));
    return ok(undefined);
  });
}

// ---------------------------------------------------------------- questions

type SuggestionsAppointmentRow = SuggestionsRow & {
  appointment_questions: QuestionRow[];
};

async function readSuggestionsRow(
  client: Client,
  appointmentId: number,
): Promise<Result<SuggestionsAppointmentRow>> {
  const { data, error } = await client
    .from('appointment')
    .select(APPOINTMENT_SUGGESTIONS_SELECT)
    .eq('appointment_id', appointmentId)
    .maybeSingle();
  if (error) return fail(mapError(error));
  if (!data) return fail(NOT_FOUND);
  return ok(data as unknown as SuggestionsAppointmentRow);
}

/**
 * Generates the questions from the person's latest assessments, stores them, and puts the
 * default ones on the plan. Resolves with the stored rows, or null when nothing was generated.
 */
async function generateAndStoreQuestions(
  client: Client,
  appointmentId: number,
): Promise<Result<SuggestionsAppointmentRow | null>> {
  const assessments = await getAssessments({ kind: 'latest' }, client);
  if (!assessments.ok) return fail(assessments.error);
  const generated = generateQuestions(assessments.data);
  if (generated.length === 0) return ok(null);

  const stored = await client.rpc('save_appointment_suggestions', {
    p_appointment_id: appointmentId,
    // the person's local calendar date, not a UTC one
    p_generated_on: toIsoDate(new Date()),
    p_questions: generated.map((q) => ({ group_key: q.groupKey, question: q.question })),
  });
  if (stored.error) return fail(mapError(stored.error));

  const reread = await readSuggestionsRow(client, appointmentId);
  if (!reread.ok) return reread;
  // false: another call stored them first, so its choices stand
  if (stored.data !== true) return ok(reread.data);

  const defaultTexts = new Set(generated.filter((q) => q.preselected).map((q) => q.question));
  const defaultIds = reread.data.appointment_questions
    .filter((row) => defaultTexts.has(row.question))
    .map((row) => row.question_id);
  if (defaultIds.length === 0) return ok(reread.data);

  const chosen = await client.rpc('save_appointment_questions', {
    p_appointment_id: appointmentId,
    p_question_ids: defaultIds,
  });
  if (chosen.error) return fail(mapError(chosen.error));
  const keep = new Set(defaultIds);
  return ok({
    ...reread.data,
    appointment_questions: reread.data.appointment_questions.map((row) => ({
      ...row,
      is_selected: keep.has(row.question_id),
    })),
  });
}

/** Loads in progress, so a screen that asks twice at once (a remount) shares one load. */
const suggestionsInFlight = new Map<number, Promise<Result<QuestionSuggestions>>>();

/**
 * The suggested questions for an appointment, with which are chosen and which have answers. The
 * first time, they are generated from the latest assessments and stored; after that the stored
 * ones are returned unchanged. Two loads of the same appointment at the same time share one, so
 * the default ticks are never lost to a second call that finds the questions already stored.
 */
export function getQuestionSuggestions(
  appointmentId: number,
  client: Client = supabase,
): Promise<Result<QuestionSuggestions>> {
  const running = suggestionsInFlight.get(appointmentId);
  if (running) return running;

  const load = run(async () => {
    const row = await readSuggestionsRow(client, appointmentId);
    if (!row.ok) return row;
    if (row.data.appointment_questions.length > 0) {
      return ok(mapQuestionSuggestions(row.data, row.data.appointment_questions));
    }

    const generated = await generateAndStoreQuestions(client, appointmentId);
    if (!generated.ok) return generated;
    const source = generated.data ?? row.data;
    return ok(mapQuestionSuggestions(source, source.appointment_questions));
  }).finally(() => suggestionsInFlight.delete(appointmentId));
  suggestionsInFlight.set(appointmentId, load);
  return load;
}

/**
 * The questions generated from the person's latest assessments, for browsing without an
 * appointment. Nothing is stored. Empty until the assessments needed to generate them are done.
 */
export function previewGeneratedQuestions(
  client: Client = supabase,
): Promise<Result<SuggestedQuestionGroup[]>> {
  return run(async () => {
    const assessments = await getAssessments({ kind: 'latest' }, client);
    if (!assessments.ok) return fail(assessments.error);
    return ok(mapGeneratedQuestionGroups(generateQuestions(assessments.data)));
  });
}

/**
 * Saves which suggested questions are on the appointment plan. A question that is removed loses
 * its doctor's answer. At least one must stay.
 */
export function saveAppointmentQuestions(
  appointmentId: number,
  questionIds: number[],
  client: Client = supabase,
): Promise<Result<void>> {
  return run(async () => {
    if (questionIds.length === 0) return fail(invalid('NO_QUESTIONS'));
    const { error } = await client.rpc('save_appointment_questions', {
      p_appointment_id: appointmentId,
      p_question_ids: questionIds,
    });
    if (error) return fail(mapError(error));
    return ok(undefined);
  });
}

// ---------------------------------------------------------------- consent, plan, answers

/**
 * Saves the doctor's signature that allows the consultation to be recorded. Resolves with the
 * time the server recorded (a UTC instant as ISO text); the phone's clock is not used.
 */
export function saveRecordingConsent(
  input: RecordingConsentInput,
  client: Client = supabase,
): Promise<Result<string>> {
  return run(async () => {
    if (!isSignatureWithinLimit(input.signature)) return fail(invalid('INVALID_SIGNATURE'));
    const { data, error } = await client.rpc('save_recording_consent', {
      p_appointment_id: input.appointmentId,
      p_signature: input.signature,
    });
    if (error) return fail(mapError(error));
    return ok(data);
  });
}

/** The plan for one appointment: its details, support people, consent and chosen questions. */
export function getAppointmentPlan(
  appointmentId: number,
  client: Client = supabase,
): Promise<Result<AppointmentPlan>> {
  return run(async () => {
    const { data, error } = await client
      .from('appointment')
      .select(APPOINTMENT_PLAN_SELECT)
      .eq('appointment_id', appointmentId)
      .maybeSingle();
    if (error) return fail(mapError(error));
    if (!data) return fail(NOT_FOUND);
    const row = data as unknown as AppointmentPlanRow & {
      appointment_questions: QuestionRow[];
      appointment_has_support_persons: SupportPersonLinkRow[];
    };
    return ok(
      mapAppointmentPlan(
        row,
        row.appointment_questions,
        mapSupportPeopleFromLinks(row.appointment_has_support_persons),
      ),
    );
  });
}

/**
 * Saves doctor's answers (plain text). An empty answer text clears the answer. All or nothing,
 * and the doctor must have consented to the recording first.
 */
export function saveAnswers(
  appointmentId: number,
  answers: AnswerInput[],
  client: Client = supabase,
): Promise<Result<void>> {
  return run(async () => {
    if (answers.length === 0) return ok(undefined);
    if (answers.some((answer) => answer.answerText.trim().length > MAX_ANSWER_LENGTH)) {
      return fail(invalid('VALUE_TOO_LONG'));
    }
    const { error } = await client.rpc('save_appointment_answers', {
      p_appointment_id: appointmentId,
      p_answers: answers.map(({ questionId, answerText }) => ({
        question_id: questionId,
        answer_text: answerText,
      })),
    });
    if (error) return fail(mapError(error));
    return ok(undefined);
  });
}
