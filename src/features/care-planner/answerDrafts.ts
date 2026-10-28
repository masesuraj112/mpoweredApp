// Pure helpers for editing doctor's answers in the answer box.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { AnswerInput, PlanQuestion } from './planTypes';

/** Text typed or dictated this session, keyed by question id. Only edited questions appear. */
export type Drafts = Record<number, string>;

/** The text to show for a question: this session's draft if there is one, else the saved answer. */
export function getDraftText(drafts: Drafts, question: PlanQuestion): string {
  return drafts[question.questionId] ?? question.doctorAnswer ?? '';
}

/** A new drafts object with one question's text replaced. */
export function setDraft(drafts: Drafts, questionId: number, text: string): Drafts {
  return { ...drafts, [questionId]: text };
}

const normalise = (text: string | null | undefined) => (text ?? '').trim();

function isEdited(drafts: Drafts, question: PlanQuestion): boolean {
  if (!(question.questionId in drafts)) return false;
  return normalise(drafts[question.questionId]) !== normalise(question.doctorAnswer);
}

/** True when any draft differs from the saved answer (a draft typed back to the original is not). */
export function isDirty(drafts: Drafts, questions: readonly PlanQuestion[]): boolean {
  return questions.some((question) => isEdited(drafts, question));
}

/** Every answer that changed this session, ready to save. An empty text clears the answer. */
export function changedAnswers(drafts: Drafts, questions: readonly PlanQuestion[]): AnswerInput[] {
  return questions
    .filter((question) => isEdited(drafts, question))
    .map((question) => ({
      questionId: question.questionId,
      answerText: normalise(drafts[question.questionId]),
    }));
}

/**
 * Adds dictated text to the end of what is already there, with one space between them.
 * Never replaces existing text. A whitespace-only result leaves the text unchanged.
 */
export function appendDictatedText(existing: string, dictated: string): string {
  const addition = dictated.trim();
  if (!addition) return existing;
  if (!existing.trim()) return addition;
  return /\s$/.test(existing) ? `${existing}${addition}` : `${existing} ${addition}`;
}

/** Keeps a question index inside the list. */
export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(index, 0), count - 1);
}
