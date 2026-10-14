// Data access for the care planner. Every function returns a Result and never throws to the UI.
// MOCK: serves local sample data. The Supabase version will keep the same signature and take the
// client as its last optional argument.

import type { RecordingConsentInput } from '@/features/care-planner/consentTypes';
import type {
  AnswerInput,
  AppointmentPlan,
  QuestionGroup,
} from '@/features/care-planner/planTypes';
import type {
  QuestionSuggestions,
  SuggestedQuestionGroup,
} from '@/features/care-planner/suggestionTypes';
import type {
  Appointment,
  NewAppointmentInput,
  SupportPerson,
} from '@/features/care-planner/types';
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
    status: 'saved',
  },
  {
    appointmentId: 2,
    dateTime: '2026-07-26T14:00:00',
    practitionerName: 'Ms Linda Ho',
    healthService: 'Physiotherapy',
    status: 'saved',
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

/** Appointments created through `createAppointment`, kept in memory by the mock. */
const createdAppointments: Appointment[] = [];
/** Changes made to any appointment (details edited, saved), keyed by appointment id. */
const appointmentOverrides = new Map<number, Appointment>();
/** Support people chosen for each appointment, kept in memory by the mock. */
const supportPeople = new Map<number, SupportPerson[]>();

/** The people the sample appointments start with, so the review screen has something to show. */
const SAMPLE_SUPPORT_PEOPLE: SupportPerson[] = [
  { name: 'Bron', phone: null, email: null, canAddQuestions: false, canAddAnswers: false },
];

/** Every appointment the mock knows about, drafts included. */
const allAppointments = (): Appointment[] =>
  [...MOCK_APPOINTMENTS, ...createdAppointments].map(
    (appointment) => appointmentOverrides.get(appointment.appointmentId) ?? appointment,
  );

const findAppointment = (appointmentId: number): Appointment | undefined =>
  allAppointments().find((a) => a.appointmentId === appointmentId);

/** Test helper: forget everything created or changed through the mock. */
export function clearMockCreatedAppointments(): void {
  createdAppointments.length = 0;
  appointmentOverrides.clear();
  supportPeople.clear();
}

/**
 * The signed-in user's saved appointments. Drafts (still being created in the wizard) are not
 * listed. Unsorted: callers use `sortAppointments`.
 */
export async function listAppointments(): Promise<Result<Appointment[]>> {
  return run(async () => ok(allAppointments().filter((a) => a.status === 'saved')));
}

/**
 * Creates an appointment. `dateTime` is local wall-clock `YYYY-MM-DDTHH:mm:ss`.
 * MOCK: kept in memory; it will insert a row into `appointment`.
 */
export async function createAppointment(input: NewAppointmentInput): Promise<Result<Appointment>> {
  return run(async () => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input.dateTime)) {
      return fail({ code: 'VALIDATION', message: 'INVALID_DATE_TIME' });
    }
    if (input.practitionerName !== null && input.practitionerName.length > 100) {
      return fail({ code: 'VALIDATION', message: 'NAME_TOO_LONG' });
    }
    const nextId = Math.max(0, ...allAppointments().map((a) => a.appointmentId)) + 1;
    const appointment: Appointment = {
      appointmentId: nextId,
      dateTime: input.dateTime,
      practitionerName: input.practitionerName,
      healthService: input.healthService,
      status: 'draft',
    };
    createdAppointments.push(appointment);
    return ok({ ...appointment });
  });
}

/**
 * Changes an appointment's details (the wizard goes back and forward, so it must not create a
 * second record). MOCK: kept in memory; it will update the `appointment` row.
 */
export async function updateAppointmentDetails(
  appointmentId: number,
  input: NewAppointmentInput,
): Promise<Result<Appointment>> {
  return run(async () => {
    const existing = findAppointment(appointmentId);
    if (!existing) return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input.dateTime)) {
      return fail({ code: 'VALIDATION', message: 'INVALID_DATE_TIME' });
    }
    if (input.practitionerName !== null && input.practitionerName.length > 100) {
      return fail({ code: 'VALIDATION', message: 'NAME_TOO_LONG' });
    }
    const updated: Appointment = {
      ...existing,
      dateTime: input.dateTime,
      practitionerName: input.practitionerName,
      healthService: input.healthService,
    };
    appointmentOverrides.set(appointmentId, updated);
    return ok({ ...updated });
  });
}

/** Marks a draft appointment as saved, so it appears in My Appointments. */
export async function markAppointmentSaved(appointmentId: number): Promise<Result<void>> {
  return run(async () => {
    const existing = findAppointment(appointmentId);
    if (!existing) return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    appointmentOverrides.set(appointmentId, { ...existing, status: 'saved' });
    return ok(undefined);
  });
}

/** The support people chosen for an appointment (none for a new one). */
export async function getSupportPeople(appointmentId: number): Promise<Result<SupportPerson[]>> {
  return run(async () => {
    if (!findAppointment(appointmentId)) {
      return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    }
    const isSample = MOCK_APPOINTMENTS.some((a) => a.appointmentId === appointmentId);
    const people = supportPeople.get(appointmentId) ?? (isSample ? SAMPLE_SUPPORT_PEOPLE : []);
    return ok(people.map((person) => ({ ...person })));
  });
}

/**
 * Saves the support people for an appointment. This REPLACES the earlier list, so going back and
 * saving again never duplicates anyone. An empty list means "no support person".
 * MOCK: kept in memory; it will map to `support_persons` and `appointment_has_support_persons`.
 */
export async function saveSupportPeople(
  appointmentId: number,
  people: SupportPerson[],
): Promise<Result<void>> {
  return run(async () => {
    if (!findAppointment(appointmentId)) {
      return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    }
    supportPeople.set(
      appointmentId,
      people.map((person) => ({ ...person })),
    );
    return ok(undefined);
  });
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

/** The suggested questions for an appointment, with which are chosen and which have answers. */
export async function getQuestionSuggestions(
  appointmentId: number,
): Promise<Result<QuestionSuggestions>> {
  return run(async () => {
    const appointment = findAppointment(appointmentId);
    if (!appointment) {
      return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    }
    const selected = selectedIdsFor(appointmentId);
    const answers = answersFor(appointmentId);
    return ok({
      appointmentStatus: appointment.status,
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
    if (!findAppointment(appointmentId)) {
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

/**
 * Saves the signed recording consent for an appointment.
 * MOCK: keeps it in memory. It will map to the appointment columns `recording_consent_signature`
 * and `recording_consent_at`.
 */
export async function saveRecordingConsent(input: RecordingConsentInput): Promise<Result<void>> {
  return run(async () => {
    const appointment = findAppointment(input.appointmentId);
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

/** The names of an appointment's support people as one line, or null when there are none. */
function supportNamesFor(appointmentId: number): string | null {
  const isSample = MOCK_APPOINTMENTS.some((a) => a.appointmentId === appointmentId);
  const people = supportPeople.get(appointmentId) ?? (isSample ? SAMPLE_SUPPORT_PEOPLE : []);
  return people.length > 0 ? people.map((person) => person.name).join(', ') : null;
}

/** The plan for one appointment: its details, support person and questions. */
export async function getAppointmentPlan(appointmentId: number): Promise<Result<AppointmentPlan>> {
  return run(async () => {
    const appointment = findAppointment(appointmentId);
    if (!appointment) {
      return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    }
    return ok({
      appointment,
      supportPersonName: supportNamesFor(appointmentId),
      recordingConsentedAt: savedConsents.get(appointmentId)?.consentedAt ?? null,
      questionGroups: buildPlanGroups(appointmentId),
    });
  });
}

/**
 * Saves doctor's answers (plain text). An empty answer text clears the answer.
 * MOCK: kept in memory; it will map to `appointment_questions.answer`.
 */
export async function saveAnswers(
  appointmentId: number,
  answers: AnswerInput[],
): Promise<Result<void>> {
  return run(async () => {
    if (!findAppointment(appointmentId)) {
      return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    }
    const onPlan = new Set(selectedIdsFor(appointmentId));
    if (!answers.every((answer) => onPlan.has(answer.questionId))) {
      return fail({ code: 'VALIDATION', message: 'QUESTION_NOT_ON_PLAN' });
    }
    const next = { ...answersFor(appointmentId) };
    answers.forEach(({ questionId, answerText }) => {
      const text = answerText.trim();
      if (text) next[questionId] = text;
      else delete next[questionId];
    });
    doctorAnswers.set(appointmentId, next);
    return ok(undefined);
  });
}
