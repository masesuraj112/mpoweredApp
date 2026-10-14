// Pure helpers for choosing suggested questions.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

/** Adds the question if it is not chosen, removes it if it is. Returns a new array. */
export function toggleQuestion(selectedIds: readonly number[], questionId: number): number[] {
  return selectedIds.includes(questionId)
    ? selectedIds.filter((id) => id !== questionId)
    : [...selectedIds, questionId];
}

export function isQuestionSelected(selectedIds: readonly number[], questionId: number): boolean {
  return selectedIds.includes(questionId);
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
