// Data access for the support person app. Every function returns a Result and never throws to the UI.
// MOCK: serves local sample data kept in memory (lost when the app restarts). The Supabase version
// will keep the same signatures; see docs/support-person-appointments-plan.md for what it needs.

import type { AnswerInput, AppointmentPlan, QuestionGroup } from '@/features/care-planner/planTypes';
import type { QuestionSuggestions, SuggestedQuestionGroup } from '@/features/care-planner/suggestionTypes';
import type { Appointment, SupportedPatient, SupportRequest } from '@/features/support-person/types';
import { mapError, type AppError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';

/** Local date-time `days` from today at 10:30am, so upcoming stays upcoming whenever the app runs. */
function daysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 30, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T10:30:00`;
}

// Ids start at 101 so they can never be mistaken for the patient Planner's sample appointments (1, 2).
function appointment(appointmentId: number, days: number): Appointment {
  return {
    appointmentId,
    dateTime: daysFromToday(days),
    practitionerName: 'Dr. Maximiliano Prinzi',
    healthService: 'General Practitioner',
    status: 'saved',
  };
}

// Jane has an upcoming appointment and can only add questions (Figma 3911-24852).
// Steven has nothing scheduled and both permissions (Figma 3911-25095).
export const MOCK_SUPPORTED_PATIENTS: SupportedPatient[] = [
  {
    id: 'jane-cooper',
    name: 'Jane Cooper',
    condition: 'Chronic Back Pain',
    canAddQuestions: true,
    canAddAnswers: false,
    appointments: [
      appointment(101, 7),
      appointment(102, -14),
      appointment(103, -42),
      appointment(104, -70),
    ],
  },
  {
    id: 'steven-harper',
    name: 'Steven Harper',
    condition: 'Chronic Back Pain',
    canAddQuestions: true,
    canAddAnswers: true,
    appointments: [appointment(111, -21), appointment(112, -49), appointment(113, -77)],
  },
];

export const MOCK_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: 'request-1',
    patient: {
      id: 'maria-lopez',
      name: 'Maria Lopez',
      condition: 'Osteoarthritis',
      canAddQuestions: true,
      canAddAnswers: true,
      appointments: [appointment(121, 3), appointment(122, -28)],
    },
  },
  {
    id: 'request-2',
    patient: {
      id: 'tom-nguyen',
      name: 'Tom Nguyen',
      condition: 'Chronic Neck Pain',
      canAddQuestions: false,
      canAddAnswers: true,
      appointments: [appointment(131, 10)],
    },
  },
];

/** Runs a call and converts thrown errors (for example a lost connection) into a failed Result. */
async function run<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await call();
  } catch (error) {
    return fail(mapError(error));
  }
}

const REQUEST_NOT_FOUND: AppError = { code: 'UNKNOWN', message: 'REQUEST_NOT_FOUND' };
const PATIENT_NOT_FOUND: AppError = { code: 'UNKNOWN', message: 'PATIENT_NOT_FOUND' };

let patients: SupportedPatient[] = [...MOCK_SUPPORTED_PATIENTS];
let requests: SupportRequest[] = [...MOCK_SUPPORT_REQUESTS];

/** Test helper: go back to the sample data. */
export function resetMockSupportPerson(): void {
  patients = [...MOCK_SUPPORTED_PATIENTS];
  requests = [...MOCK_SUPPORT_REQUESTS];
}

/**
 * The patients the signed-in user supports, with the access each gave them.
 * MOCK: it will read accepted `support_persons` rows where `users_id` is the signed-in user.
 */
export async function listSupportedPatients(): Promise<Result<SupportedPatient[]>> {
  return run(async () => ok([...patients]));
}

/**
 * Patients asking the signed-in user to be their support person.
 * MOCK: it will read pending `support_persons` rows (needs a pending/accepted state).
 */
export async function listSupportRequests(): Promise<Result<SupportRequest[]>> {
  return run(async () => ok([...requests]));
}

/**
 * Accepts a request and returns the patient now supported.
 * MOCK: it will mark the `support_persons` row as accepted and set `users_id`.
 */
export async function acceptSupportRequest(requestId: string): Promise<Result<SupportedPatient>> {
  return run(async () => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return fail(REQUEST_NOT_FOUND);
    requests = requests.filter(r => r.id !== requestId);
    if (!patients.some(p => p.id === request.patient.id)) patients = [...patients, request.patient];
    return ok(request.patient);
  });
}

/**
 * Turns a request down.
 * MOCK: it will delete the pending `support_persons` row.
 */
export async function rejectSupportRequest(requestId: string): Promise<Result<void>> {
  return run(async () => {
    if (!requests.some(r => r.id === requestId)) return fail(REQUEST_NOT_FOUND);
    requests = requests.filter(r => r.id !== requestId);
    return ok(undefined);
  });
}

/**
 * Stops supporting a patient.
 * MOCK: it will delete the signed-in user's `support_persons` row for this patient.
 */
export async function unpairFromPatient(patientId: string): Promise<Result<void>> {
  return run(async () => {
    if (!patients.some(p => p.id === patientId)) return fail(PATIENT_NOT_FOUND);
    patients = patients.filter(p => p.id !== patientId);
    return ok(undefined);
  });
}

/* -------------------------------------------------------------------------- */
/*  Appointment plans                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Suggested questions served by the mock. The real ones will come from the patient's own
 * assessments, generated on the back end (see docs/support-person-appointments-plan.md, P6).
 */
const MOCK_SUGGESTED_GROUPS: SuggestedQuestionGroup[] = [
  {
    groupId: 'pain-location',
    title: 'Pain location',
    questions: [
      { questionId: 1, text: 'What could be causing the pain in my lower back?' },
      { questionId: 2, text: 'Is the pain in my back and knee related?' },
    ],
  },
  {
    groupId: 'pain-intensity',
    title: 'Pain intensity',
    questions: [
      { questionId: 3, text: 'What can I do on days when the pain is high?' },
      { questionId: 4, text: 'Is it normal for the pain to change so much from day to day?' },
    ],
  },
  {
    groupId: 'management',
    title: 'Management',
    questions: [
      { questionId: 5, text: 'Would physiotherapy or an exercise program help?' },
      { questionId: 6, text: 'Are there activities I should avoid right now?' },
      { questionId: 7, text: 'Should we change my current treatment plan?' },
    ],
  },
];

/** Date the mock suggestions were "generated", as a calendar date. */
const MOCK_SUGGESTIONS_GENERATED_ON = '2026-10-01';

/** Questions on every appointment's plan to start with. */
const MOCK_DEFAULT_SELECTED_IDS = [1, 3, 5];

/** Answers past appointments start with, so "View doctor's answer" has something to show. */
const MOCK_PAST_ANSWERS: Record<number, string> = {
  1: 'Most likely muscle strain from lifting. Keep moving gently and use heat.',
  5: 'Yes. A referral to physiotherapy has been sent.',
};

const APPOINTMENT_NOT_FOUND: AppError = { code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' };
const NOT_ALLOWED_QUESTIONS: AppError = { code: 'NOT_ALLOWED', message: 'NO_QUESTIONS_PERMISSION' };
const NOT_ALLOWED_ANSWERS: AppError = { code: 'NOT_ALLOWED', message: 'NO_ANSWERS_PERMISSION' };

/** Questions chosen for each appointment, kept in memory by the mock. */
const selectedQuestionIds = new Map<number, number[]>();
/** Doctor's answers kept in memory by the mock, keyed by appointment id then question id. */
const doctorAnswers = new Map<number, Record<number, string>>();

/** Test helper: forget every question and answer changed through the mock. */
export function resetMockSupportedPlans(): void {
  selectedQuestionIds.clear();
  doctorAnswers.clear();
}

const isPast = (appointment: Appointment) => new Date(appointment.dateTime) < new Date();

/** The appointment and the patient it belongs to, among the patients the user supports. */
function findAppointment(appointmentId: number) {
  for (const patient of patients) {
    const appointment = patient.appointments.find(a => a.appointmentId === appointmentId);
    if (appointment) return { patient, appointment };
  }
  return null;
}

/** Runs `action` with the appointment and its patient, or fails with "not found". */
function withSupportedAppointment<T>(
  appointmentId: number,
  action: (found: { patient: SupportedPatient; appointment: Appointment }) => Result<T>,
): Promise<Result<T>> {
  return run(async () => {
    const found = findAppointment(appointmentId);
    return found ? action(found) : fail<T>(APPOINTMENT_NOT_FOUND);
  });
}

const selectedIdsFor = (appointmentId: number) => selectedQuestionIds.get(appointmentId) ?? MOCK_DEFAULT_SELECTED_IDS;

function answersFor(appointment: Appointment): Record<number, string> {
  const saved = doctorAnswers.get(appointment.appointmentId);
  if (saved) return saved;
  const selected = new Set(selectedIdsFor(appointment.appointmentId));
  const defaults = isPast(appointment) ? MOCK_PAST_ANSWERS : {};
  return Object.fromEntries(Object.entries(defaults).filter(([id]) => selected.has(Number(id))));
}

function buildPlanGroups(appointment: Appointment): QuestionGroup[] {
  const selected = new Set(selectedIdsFor(appointment.appointmentId));
  const answers = answersFor(appointment);
  return MOCK_SUGGESTED_GROUPS.map(group => ({
    groupId: group.groupId,
    title: group.title,
    questions: group.questions
      .filter(question => selected.has(question.questionId))
      .map(question => ({
        questionId: question.questionId,
        text: question.text,
        doctorAnswer: answers[question.questionId] ?? null,
      })),
  })).filter(group => group.questions.length > 0);
}

/**
 * One supported patient's appointment plan: details, questions and doctor's answers.
 * MOCK: it will call the Planner's `getAppointmentPlan`, which the database rules let a linked
 * support person read (`can_access_patient`).
 */
export async function getSupportedAppointmentPlan(appointmentId: number): Promise<Result<AppointmentPlan>> {
  return withSupportedAppointment(appointmentId, ({ appointment }) =>
    ok({
      appointment,
      // The overview's "Support person" row; the mock doesn't track who else supports the patient.
      supportPersonName: null,
      // Past sample appointments had consent signed on the day.
      recordingConsentedAt: isPast(appointment) ? `${appointment.dateTime}Z` : null,
      questionGroups: buildPlanGroups(appointment),
    }),
  );
}

/**
 * Saves doctor's answers (plain text). An empty answer clears it. Refused without the patient's
 * "Add doctor's answers" permission, as the database should once it checks access_type.
 * MOCK: kept in memory; it will map to `appointment_questions.answer`.
 */
export async function saveSupportedAnswers(appointmentId: number, answers: AnswerInput[]): Promise<Result<void>> {
  return withSupportedAppointment(appointmentId, ({ patient, appointment }) => {
    if (!patient.canAddAnswers) return fail(NOT_ALLOWED_ANSWERS);
    const onPlan = new Set(selectedIdsFor(appointmentId));
    if (!answers.every(answer => onPlan.has(answer.questionId))) {
      return fail({ code: 'VALIDATION', message: 'QUESTION_NOT_ON_PLAN' });
    }
    const next = { ...answersFor(appointment) };
    answers.forEach(({ questionId, answerText }) => {
      const text = answerText.trim();
      if (text) next[questionId] = text;
      else delete next[questionId];
    });
    doctorAnswers.set(appointmentId, next);
    return ok(undefined);
  });
}

/** The suggested questions for a supported patient's appointment, with which are chosen and answered. */
export async function getSupportedQuestionSuggestions(appointmentId: number): Promise<Result<QuestionSuggestions>> {
  return withSupportedAppointment(appointmentId, ({ appointment }) => {
    const selected = selectedIdsFor(appointmentId);
    const answers = answersFor(appointment);
    return ok({
      appointmentStatus: appointment.status,
      generatedOn: MOCK_SUGGESTIONS_GENERATED_ON,
      groups: MOCK_SUGGESTED_GROUPS.map(group => ({
        ...group,
        questions: group.questions.map(question => ({ ...question })),
      })),
      selectedQuestionIds: [...selected],
      answeredQuestionIds: selected.filter(id => Boolean(answers[id])),
    });
  });
}

/**
 * Saves which suggested questions are on the plan. Removing a question removes its answer, so
 * removing an answered one also needs the "Add doctor's answers" permission.
 * MOCK: kept in memory; it will map to rows of `appointment_questions`.
 */
export async function saveSupportedQuestions(appointmentId: number, questionIds: number[]): Promise<Result<void>> {
  return withSupportedAppointment(appointmentId, ({ patient, appointment }) => {
    if (!patient.canAddQuestions) return fail(NOT_ALLOWED_QUESTIONS);
    const known = new Set(MOCK_SUGGESTED_GROUPS.flatMap(group => group.questions.map(q => q.questionId)));
    if (!questionIds.every(id => known.has(id))) {
      return fail({ code: 'VALIDATION', message: 'UNKNOWN_QUESTION' });
    }
    const keep = new Set(questionIds);
    const answers = answersFor(appointment);
    const removesAnswer = Object.keys(answers).some(id => !keep.has(Number(id)));
    if (removesAnswer && !patient.canAddAnswers) return fail(NOT_ALLOWED_ANSWERS);

    const remaining = Object.fromEntries(Object.entries(answers).filter(([id]) => keep.has(Number(id))));
    selectedQuestionIds.set(appointmentId, [...questionIds]);
    doctorAnswers.set(appointmentId, remaining);
    return ok(undefined);
  });
}
