// Data access for the support person app, through the support person database functions
// (support_person_functions migration). Every function returns a Result and never throws to the UI,
// sends no user or patient identity beyond the patient or appointment id it acts on, and takes the
// Supabase client as the last optional argument so tests can pass a fake one.

import { mapAppointmentPlan, mapQuestionSuggestions } from '@/features/care-planner/mappers';
import type { AnswerInput, AppointmentPlan } from '@/features/care-planner/planTypes';
import type { QuestionSuggestions } from '@/features/care-planner/suggestionTypes';
import {
  mapSupportedPatient,
  mapSupportedPatients,
  mapSupportRequest,
} from '@/features/support-person/mappers';
import type { SupportedPatient, SupportRequest } from '@/features/support-person/types';
import { mapError, type AppError } from '@/lib/errors';
import { fail, ok, run, type Result } from '@/lib/result';
import { supabase } from '@/lib/supabase';

import { type Client } from './assessments';

// The same codes the database functions raise, for ids the app can't even send.
const REQUEST_NOT_FOUND: AppError = { code: 'NOT_FOUND', message: 'REQUEST_NOT_FOUND' };
const PATIENT_NOT_FOUND: AppError = { code: 'NOT_FOUND', message: 'PATIENT_NOT_FOUND' };
const APPOINTMENT_NOT_FOUND: AppError = { code: 'NOT_FOUND', message: 'APPOINTMENT_NOT_FOUND' };

/** Request and patient ids are the patient id as a string; anything else can't be on the server. */
function toPatientId(id: string): number | null {
  return /^\d{1,9}$/.test(id) ? Number(id) : null;
}

/** The patients the signed-in support person has accepted, each with the appointments they were added to. */
export function listSupportedPatients(client: Client = supabase): Promise<Result<SupportedPatient[]>> {
  return run(async () => {
    const [patients, appointments] = await Promise.all([
      client.rpc('list_supported_patients'),
      client.rpc('list_supported_appointments'),
    ]);
    if (patients.error) return fail(mapError(patients.error));
    if (appointments.error) return fail(mapError(appointments.error));
    return ok(mapSupportedPatients(patients.data ?? [], appointments.data ?? []));
  });
}

/** Patients asking the signed-in user to be their support person (name and access only, no conditions). */
export function listSupportRequests(client: Client = supabase): Promise<Result<SupportRequest[]>> {
  return run(async () => {
    const { data, error } = await client.rpc('list_my_support_requests');
    if (error) return fail(mapError(error));
    return ok((data ?? []).map(mapSupportRequest));
  });
}

/** Accepts a request and returns the patient now supported, with the appointments they were added to. */
export function acceptSupportRequest(
  requestId: string,
  client: Client = supabase,
): Promise<Result<SupportedPatient>> {
  return run(async () => {
    const patientId = toPatientId(requestId);
    if (patientId === null) return fail(REQUEST_NOT_FOUND);

    const { data, error } = await client.rpc('accept_support_request', { p_patient_id: patientId });
    if (error) return fail(mapError(error));
    const row = data?.[0];
    if (!row) return fail(REQUEST_NOT_FOUND);

    const appointments = await client.rpc('list_supported_appointments');
    if (appointments.error) return fail(mapError(appointments.error));
    return ok(
      mapSupportedPatient(
        row,
        (appointments.data ?? []).filter((appointment) => appointment.patient_id === patientId),
      ),
    );
  });
}

/** Turns a request down. The patient's record stays, as declined. */
export function rejectSupportRequest(requestId: string, client: Client = supabase): Promise<Result<void>> {
  return run(async () => {
    const patientId = toPatientId(requestId);
    if (patientId === null) return fail(REQUEST_NOT_FOUND);
    const { error } = await client.rpc('reject_support_request', { p_patient_id: patientId });
    if (error) return fail(mapError(error));
    return ok(undefined);
  });
}

/** Stops supporting a patient: access ends at once and they are taken off the patient's appointments. */
export function unpairFromPatient(patientId: string, client: Client = supabase): Promise<Result<void>> {
  return run(async () => {
    const id = toPatientId(patientId);
    if (id === null) return fail(PATIENT_NOT_FOUND);
    const { error } = await client.rpc('unpair_from_patient', { p_patient_id: id });
    if (error) return fail(mapError(error));
    return ok(undefined);
  });
}

/** One supported appointment and every stored question. Not allowed and not found look the same. */
async function readSupportedAppointment(appointmentId: number, client: Client) {
  const [appointment, questions] = await Promise.all([
    client.rpc('get_supported_appointment', { p_appointment_id: appointmentId }),
    client.rpc('list_supported_appointment_questions', { p_appointment_id: appointmentId }),
  ]);
  if (appointment.error) return fail(mapError(appointment.error));
  if (questions.error) return fail(mapError(questions.error));
  const row = appointment.data?.[0];
  // Zero rows: not added to it, not accepted, a draft, or another patient's.
  if (!row) return fail(APPOINTMENT_NOT_FOUND);
  return ok({ row, questions: questions.data ?? [] });
}

/** A supported appointment's plan: details, the questions on it, and the doctor's answers. */
export function getSupportedAppointmentPlan(
  appointmentId: number,
  client: Client = supabase,
): Promise<Result<AppointmentPlan>> {
  return run(async () => {
    const read = await readSupportedAppointment(appointmentId, client);
    if (!read.ok) return read;
    // The support person app doesn't show who else supports the patient.
    return ok(mapAppointmentPlan(read.data.row, read.data.questions, []));
  });
}

/** Every stored question for a supported appointment, with which are on the plan and answered. */
export function getSupportedQuestionSuggestions(
  appointmentId: number,
  client: Client = supabase,
): Promise<Result<QuestionSuggestions>> {
  return run(async () => {
    const read = await readSupportedAppointment(appointmentId, client);
    if (!read.ok) return read;
    return ok(mapQuestionSuggestions(read.data.row, read.data.questions));
  });
}

/**
 * Saves which questions are on the plan. Needs "Add questions"; taking off an answered question
 * removes its answer, so that also needs "Add doctor's answer" (the database checks both).
 */
export function saveSupportedQuestions(
  appointmentId: number,
  questionIds: number[],
  client: Client = supabase,
): Promise<Result<void>> {
  return run(async () => {
    const { error } = await client.rpc('save_supported_questions', {
      p_appointment_id: appointmentId,
      p_question_ids: questionIds,
    });
    if (error) return fail(mapError(error));
    return ok(undefined);
  });
}

/**
 * Saves doctor's answers (plain text). An empty answer clears it. Needs "Add doctor's answer" and the
 * patient's recorded consent (the database checks both).
 */
export function saveSupportedAnswers(
  appointmentId: number,
  answers: AnswerInput[],
  client: Client = supabase,
): Promise<Result<void>> {
  return run(async () => {
    const { error } = await client.rpc('save_supported_answers', {
      p_appointment_id: appointmentId,
      p_answers: answers.map((answer) => ({ question_id: answer.questionId, answer_text: answer.answerText })),
    });
    if (error) return fail(mapError(error));
    return ok(undefined);
  });
}
