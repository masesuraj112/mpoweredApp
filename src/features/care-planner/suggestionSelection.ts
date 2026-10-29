// Pure helpers for choosing suggested questions.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

/** Adds the question if it is not chosen, removes it if it is. Returns a new array. */
export function toggleQuestion(selectedIds: readonly number[], questionId: number): number[] {
  return selectedIds.includes(questionId)
    ? selectedIds.filter((id) => id !== questionId)
    : [...selectedIds, questionId];
}

/** True when the two selections hold different questions (order does not matter). */
export function hasSelectionChanged(
  saved: readonly number[],
  current: readonly number[],
): boolean {
  if (saved.length !== current.length) return true;
  const savedSet = new Set(saved);
  return current.some((id) => !savedSet.has(id));
}

/** Unticking this question would remove a doctor's answer, so the person must confirm first. */
export function needsRemovalConfirmation(
  selectedIds: readonly number[],
  answeredIds: readonly number[],
  questionId: number,
): boolean {
  return selectedIds.includes(questionId) && answeredIds.includes(questionId);
}

/** Wording for a row's spoken label: it says what ticking will do. */
export function getSuggestionLabel(questionText: string): string {
  return `Add to my appointment plan: ${questionText}`;
}

/** Shown when every suggested question has been unticked. */
export const MIN_QUESTION_MESSAGE = 'Choose at least one question to keep on your plan.';

/**
 * A plan keeps at least one question once suggestions exist. When there are no suggestions at all
 * there is nothing to choose, so saving is still allowed.
 */
export function canSaveSelection(selectedIds: readonly number[], hasSuggestions: boolean): boolean {
  return !hasSuggestions || selectedIds.length > 0;
}
