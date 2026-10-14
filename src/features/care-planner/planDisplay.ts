// Pure helpers for the appointment plan review screen.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { formatShortDate, parseLocalDatePart } from './dateTime';
import type { AppointmentPlan, PlanQuestion } from './planTypes';

export const ADD_ANSWER_PROMPT = "Add doctor's answer";
export const VIEW_ANSWER_PROMPT = "View doctor's answer";
export const NOT_PROVIDED_TEXT = 'Not provided';

/**
 * `2026-06-10T09:30:00` becomes "10 Jun 2026". Months are spelled out because locale short months
 * differ ("Sept" in en-AU). Empty string if the date part is malformed.
 */
export function formatShortAppointmentDate(dateTime: string): string {
  const date = parseLocalDatePart(dateTime);
  return date ? formatShortDate(date) : '';
}

/** Text above a question: a prompt to view the doctor's answer, or to add one. */
export function getAnswerLine(question: PlanQuestion): { text: string; answered: boolean } {
  return question.doctorAnswer?.trim()
    ? { text: VIEW_ANSWER_PROMPT, answered: true }
    : { text: ADD_ANSWER_PROMPT, answered: false };
}

/** Spoken label for the pen button on a question. */
export function getEditAnswerLabel(question: PlanQuestion): string {
  const verb = question.doctorAnswer?.trim() ? 'Edit' : 'Add';
  return `${verb} doctor's answer for: ${question.text}`;
}

/** Spoken label for a whole question row: what it does, then the question. */
export function getQuestionRowLabel(question: PlanQuestion): string {
  return `${getAnswerLine(question).text}: ${question.text}`;
}

/** Value for a summary row; a placeholder when nothing was recorded. */
export function displayOrPlaceholder(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : NOT_PROVIDED_TEXT;
}

/** True when the plan has no questions in any group. Groups without questions are not shown. */
export function isPlanEmpty(plan: AppointmentPlan): boolean {
  return plan.questionGroups.every((group) => group.questions.length === 0);
}
