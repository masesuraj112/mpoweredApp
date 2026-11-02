// Maps database rows to the Care Planner's types. The functions take plain row shapes, not the
// Supabase client, so any service can feed them rows from a table read or a function.
// Dates are local wall-clock strings and are only ever reshaped as text: no Date, no UTC.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { accessTypeFromDb } from './accessType';
import type {
  AppointmentPlan,
  PlanQuestion,
  QuestionGroup,
} from './planTypes';
import type {
  QuestionSuggestions,
  SuggestedQuestionGroup,
} from './suggestionTypes';
import type { Appointment, AppointmentStatus, SupportPerson, SupportPersonStatus } from './types';

export type AppointmentRow = {
  appointment_id: number;
  date_time: string;
  practitioner_name: string | null;
  health_service: string | null;
  status: string;
};

export type AppointmentPlanRow = AppointmentRow & {
  recording_consent_at: string | null;
};

export type SuggestionsRow = {
  status: string;
  suggestions_generated_on: string | null;
};

export type QuestionRow = {
  question_id: number;
  group_key: string;
  sort_order: number;
  question: string;
  is_selected: boolean;
  answer: string | null;
};

export type SupportPersonRow = {
  support_person_id: number;
  name: string;
  phone_number: string | null;
  email: string | null;
  access_type: string;
  /** The invitation state. Rows read before the support_link_state migration have none. */
  status?: string;
};

/** A row of `appointment_has_support_persons` with its person embedded (PostgREST). */
export type SupportPersonLinkRow = {
  support_persons: SupportPersonRow | null;
};

/** Group keys in the order the screens show them, with their headings. */
export const QUESTION_GROUPS = [
  { groupId: 'pain-location', title: 'Pain location' },
  { groupId: 'pain-intensity', title: 'Pain intensity' },
  { groupId: 'pain-impact', title: 'Pain impact' },
  { groupId: 'management', title: 'Management' },
] as const;

const LOCAL_TIMESTAMP = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2}))?/;

/** `2026-11-05T14:30:00`, `2026-11-05 14:30:00` and `2026-11-05T14:30:00.5` all become `2026-11-05T14:30:00`. */
export function toLocalTimestamp(value: string): string {
  const match = LOCAL_TIMESTAMP.exec(value);
  return match ? `${match[1]}T${match[2]}:${match[3] ?? '00'}` : value;
}

const toStatus = (value: string): AppointmentStatus => (value === 'saved' ? 'saved' : 'draft');

export function mapAppointment(row: AppointmentRow): Appointment {
  return {
    appointmentId: row.appointment_id,
    dateTime: toLocalTimestamp(row.date_time),
    practitionerName: row.practitioner_name,
    healthService: row.health_service,
    status: toStatus(row.status),
  };
}

export function mapSupportPerson(row: SupportPersonRow): SupportPerson {
  return {
    supportPersonId: row.support_person_id,
    name: row.name,
    phone: row.phone_number,
    email: row.email,
    ...accessTypeFromDb(row.access_type),
    ...(isSupportPersonStatus(row.status) ? { status: row.status } : {}),
  };
}

const SUPPORT_PERSON_STATUSES: readonly string[] = ['pending', 'accepted', 'declined'];

function isSupportPersonStatus(value: string | undefined): value is SupportPersonStatus {
  return value !== undefined && SUPPORT_PERSON_STATUSES.includes(value);
}

/** The people linked to an appointment, in a stable order. Links whose person is hidden are skipped. */
export function mapSupportPeopleFromLinks(links: readonly SupportPersonLinkRow[]): SupportPerson[] {
  return links
    .flatMap((link) => (link.support_persons ? [link.support_persons] : []))
    .sort((a, b) => a.support_person_id - b.support_person_id)
    .map(mapSupportPerson);
}

const hasAnswer = (row: QuestionRow): boolean => row.answer !== null && row.answer.trim() !== '';

/** "pain-location" becomes "Pain location" for a group the constant list does not know. */
function titleFromKey(groupKey: string): string {
  const words = groupKey.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Questions grouped in display order: known groups first, then any others by key; sorted within a group. */
function groupQuestions(rows: readonly QuestionRow[]): { groupId: string; title: string; rows: QuestionRow[] }[] {
  const byKey = new Map<string, QuestionRow[]>();
  for (const row of rows) {
    byKey.set(row.group_key, [...(byKey.get(row.group_key) ?? []), row]);
  }
  const known = QUESTION_GROUPS.map((g) => g.groupId as string);
  const unknown = [...byKey.keys()].filter((key) => !known.includes(key)).sort();
  const titles = new Map<string, string>(QUESTION_GROUPS.map((g) => [g.groupId, g.title]));

  return [...known, ...unknown]
    .filter((key) => byKey.has(key))
    .map((key) => ({
      groupId: key,
      title: titles.get(key) ?? titleFromKey(key),
      rows: [...(byKey.get(key) ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order || a.question_id - b.question_id,
      ),
    }));
}

/** Every stored question for the "Add Questions" screen, with which are on the plan and answered. */
export function mapQuestionSuggestions(
  appointment: SuggestionsRow,
  questions: readonly QuestionRow[],
): QuestionSuggestions {
  const grouped = groupQuestions(questions);
  const groups: SuggestedQuestionGroup[] = grouped.map((group) => ({
    groupId: group.groupId,
    title: group.title,
    questions: group.rows.map((row) => ({ questionId: row.question_id, text: row.question })),
  }));
  const chosen = grouped.flatMap((group) => group.rows).filter((row) => row.is_selected);

  return {
    appointmentStatus: toStatus(appointment.status),
    generatedOn: appointment.suggestions_generated_on,
    groups,
    selectedQuestionIds: chosen.map((row) => row.question_id),
    answeredQuestionIds: chosen.filter(hasAnswer).map((row) => row.question_id),
  };
}

/** The plan: only the questions on it, grouped, with the doctor's answers. */
export function mapAppointmentPlan(
  appointment: AppointmentPlanRow,
  questions: readonly QuestionRow[],
  supportPeople: readonly SupportPerson[],
): AppointmentPlan {
  const questionGroups: QuestionGroup[] = groupQuestions(questions.filter((q) => q.is_selected)).map(
    (group) => ({
      groupId: group.groupId,
      title: group.title,
      questions: group.rows.map(
        (row): PlanQuestion => ({
          questionId: row.question_id,
          text: row.question,
          doctorAnswer: hasAnswer(row) ? row.answer : null,
        }),
      ),
    }),
  );

  return {
    appointment: mapAppointment(appointment),
    supportPersonName:
      supportPeople.length > 0 ? supportPeople.map((person) => person.name).join(', ') : null,
    recordingConsentedAt: appointment.recording_consent_at,
    questionGroups,
  };
}

/**
 * Generated questions that are not stored against an appointment, grouped for display. The ids
 * are only positions in the list: they identify a row on screen and nothing in the database.
 */
export function mapGeneratedQuestionGroups(
  questions: readonly { groupKey: string; question: string }[],
): SuggestedQuestionGroup[] {
  const countByGroup = new Map<string, number>();
  const rows: QuestionRow[] = questions.map((q, index) => {
    const position = (countByGroup.get(q.groupKey) ?? 0) + 1;
    countByGroup.set(q.groupKey, position);
    return {
      question_id: index + 1,
      group_key: q.groupKey,
      sort_order: position,
      question: q.question,
      is_selected: false,
      answer: null,
    };
  });
  return mapQuestionSuggestions({ status: 'draft', suggestions_generated_on: null }, rows).groups;
}
