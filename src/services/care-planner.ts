// Data access for the care planner. Every function returns a Result and never throws to the UI.
// MOCK: serves local sample data. The Supabase version will keep the same signature and take the
// client as its last optional argument.

import type { RecordingConsentInput } from '@/features/care-planner/consentTypes';
import type { AppointmentPlan, QuestionGroup } from '@/features/care-planner/planTypes';
import type {
  QuestionSuggestions,
  SuggestedQuestionGroup,
} from '@/features/care-planner/suggestionTypes';
import type { Appointment } from '@/features/care-planner/types';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';

/**
 * Sample appointments served by the mock `listAppointments`.
 * Set this to `[]` to see the empty state on the Care Planner screen.
 */
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    appointmentId: 1,
    dateTime: '2026-06-10T09:30:00',
    practitionerName: 'Dr. Maximiliano Prinzi',
    healthService: 'Pain Clinic',
  },
  {
    appointmentId: 2,
    dateTime: '2026-07-26T14:00:00',
    practitionerName: 'Ms Linda Ho',
    healthService: 'Physiotherapy',
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

/** The signed-in user's appointments. Unsorted: callers use `sortAppointments`. */
export async function listAppointments(): Promise<Result<Appointment[]>> {
  return run(async () => ok([...MOCK_APPOINTMENTS]));
}

/**
 * Suggested questions served by the mock, with the wording from the design.
 * The real ones will be generated on the back end.
 */
const MOCK_SUGGESTED_GROUPS: SuggestedQuestionGroup[] = [
  {
    groupId: 'pain-location',
    title: 'Pain location',
    questions: [
      { questionId: 1, text: 'What could be causing pain in my lower back, neck, and knee?' },
      { questionId: 2, text: 'Are these areas related, or are they likely separate issues?' },
    ],
  },
  {
    groupId: 'pain-intensity',
    title: 'Pain intensity',
    questions: [
      {
        questionId: 3,
        text: 'My average pain over the past two weeks has been around 7 — what does this indicate?',
      },
      {
        questionId: 4,
        text: 'Even though I don’t have pain right now, I’ve had severe pain at times (up to 9). What could explain these flare-ups?',
      },
      {
        questionId: 5,
        text: 'Is it normal for pain to vary between mild (2) and very severe (9)?',
      },
      { questionId: 6, text: 'What can I do to better manage days when the pain is high?' },
    ],
  },
  {
    groupId: 'pain-impact',
    title: 'Pain impact',
    questions: [
      { questionId: 7, text: 'What treatments or therapies could help improve my mobility?' },
      {
        questionId: 8,
        text: 'Would physiotherapy or a specific exercise program be appropriate for me?',
      },
      { questionId: 9, text: 'Are there movements or activities I should avoid right now?' },
      {
        questionId: 10,
        text: 'My pain is making it hard to take care of myself independently — what can we do to improve this?',
      },
      {
        questionId: 11,
        text: 'Are there strategies, aids, or supports that could help with daily tasks?',
      },
      {
        questionId: 12,
        text: 'Should we adjust my treatment plan given how much this is affecting my independence?',
      },
      { questionId: 13, text: 'Is this level of impact typical for my condition?' },
      { questionId: 14, text: 'What options are available to improve my quality of life?' },
    ],
  },
  {
    groupId: 'management',
    title: 'Management',
    questions: [
      { questionId: 15, text: 'Are there additional investigations or referrals that might help?' },
      { questionId: 16, text: 'How can I prevent the pain from becoming severe again?' },
      {
        questionId: 17,
        text: 'What are realistic goals for improving my function and independence?',
      },
    ],
  },
];

/** Date the mock suggestions were "generated", as a calendar date. */
const MOCK_SUGGESTIONS_GENERATED_ON = '2026-05-25';

/** The questions ticked at the start (as drawn in the design). Applies to every appointment. */
const MOCK_DEFAULT_SELECTED_IDS = [1, 2, 3, 4, 6, 7, 9, 15];

/** Doctor's answers already noted, keyed by question id. Set to `{}` to see no answered questions. */
const MOCK_DOCTOR_ANSWERS: Record<number, string> = {
  2: 'They are likely linked through posture. We will review this at the next visit.',
};

/** Questions chosen for each appointment, kept in memory by the mock. Lost on app restart. */
const selectedQuestionIds = new Map<number, number[]>();
/** Doctor's answers kept in memory by the mock, keyed by appointment id then question id. */
const doctorAnswers = new Map<number, Record<number, string>>();

const allSuggestedQuestionIds = () =>
  MOCK_SUGGESTED_GROUPS.flatMap((group) => group.questions.map((q) => q.questionId));

const selectedIdsFor = (appointmentId: number): number[] =>
  selectedQuestionIds.get(appointmentId) ?? MOCK_DEFAULT_SELECTED_IDS;

const answersFor = (appointmentId: number): Record<number, string> =>
  doctorAnswers.get(appointmentId) ?? MOCK_DOCTOR_ANSWERS;

/** Test helper: forget every question choice and answer change made through the mock. */
export function clearMockAppointmentQuestions(): void {
  selectedQuestionIds.clear();
  doctorAnswers.clear();
}

/** The suggested questions for an appointment, with which are chosen and which have answers. */
export async function getQuestionSuggestions(
  appointmentId: number,
): Promise<Result<QuestionSuggestions>> {
  return run(async () => {
    if (!MOCK_APPOINTMENTS.some((a) => a.appointmentId === appointmentId)) {
      return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    }
    const selected = selectedIdsFor(appointmentId);
    const answers = answersFor(appointmentId);
    return ok({
      generatedOn: MOCK_SUGGESTIONS_GENERATED_ON,
      groups: MOCK_SUGGESTED_GROUPS.map((group) => ({
        ...group,
        questions: group.questions.map((question) => ({ ...question })),
      })),
      selectedQuestionIds: [...selected],
      answeredQuestionIds: selected.filter((id) => Boolean(answers[id])),
    });
  });
}

/**
 * Saves which suggested questions are on the appointment plan. A question that is removed loses
 * its doctor's answer. MOCK: kept in memory; it will map to rows of `appointment_questions`.
 */
export async function saveAppointmentQuestions(
  appointmentId: number,
  questionIds: number[],
): Promise<Result<void>> {
  return run(async () => {
    if (!MOCK_APPOINTMENTS.some((a) => a.appointmentId === appointmentId)) {
      return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    }
    const known = new Set(allSuggestedQuestionIds());
    if (!questionIds.every((id) => known.has(id))) {
      return fail({ code: 'VALIDATION', message: 'UNKNOWN_QUESTION' });
    }
    const keep = new Set(questionIds);
    const remaining: Record<number, string> = {};
    Object.entries(answersFor(appointmentId)).forEach(([id, answer]) => {
      if (keep.has(Number(id))) remaining[Number(id)] = answer;
    });
    selectedQuestionIds.set(appointmentId, [...questionIds]);
    doctorAnswers.set(appointmentId, remaining);
    return ok(undefined);
  });
}

/** The chosen questions, grouped, with any doctor's answers: what the review screen shows. */
function buildPlanGroups(appointmentId: number): QuestionGroup[] {
  const selected = new Set(selectedIdsFor(appointmentId));
  const answers = answersFor(appointmentId);
  return MOCK_SUGGESTED_GROUPS.map((group) => ({
    groupId: group.groupId,
    title: group.title,
    questions: group.questions
      .filter((question) => selected.has(question.questionId))
      .map((question) => ({
        questionId: question.questionId,
        text: question.text,
        doctorAnswer: answers[question.questionId] ?? null,
      })),
  })).filter((group) => group.questions.length > 0);
}

/** Signed consents held in memory by the mock, keyed by appointment id. Lost on app restart. */
const savedConsents = new Map<number, { signature: string; consentedAt: string }>();

/** Test helper: forget every consent saved by the mock. */
export function clearMockRecordingConsents(): void {
  savedConsents.clear();
}

/**
 * Saves the signed recording consent for an appointment.
 * MOCK: keeps it in memory. It will map to the appointment columns `recording_consent_signature`
 * and `recording_consent_at`.
 */
export async function saveRecordingConsent(input: RecordingConsentInput): Promise<Result<void>> {
  return run(async () => {
    const appointment = MOCK_APPOINTMENTS.find((a) => a.appointmentId === input.appointmentId);
    if (!appointment) {
      return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    }
    savedConsents.set(input.appointmentId, {
      signature: input.signature,
      consentedAt: input.consentedAt,
    });
    return ok(undefined);
  });
}

/** The plan for one appointment: its details, support person and questions. */
export async function getAppointmentPlan(appointmentId: number): Promise<Result<AppointmentPlan>> {
  return run(async () => {
    const appointment = MOCK_APPOINTMENTS.find((a) => a.appointmentId === appointmentId);
    if (!appointment) {
      return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    }
    return ok({
      appointment,
      supportPersonName: 'Bron',
      recordingConsentedAt: savedConsents.get(appointmentId)?.consentedAt ?? null,
      questionGroups: buildPlanGroups(appointmentId),
    });
  });
}
