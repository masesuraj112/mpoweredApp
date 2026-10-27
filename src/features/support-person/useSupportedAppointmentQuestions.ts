import { useCallback, useState } from 'react';

import {
  hasSelectionChanged,
  needsRemovalConfirmation,
  toggleQuestion,
} from '@/features/care-planner/suggestionSelection';
import type { QuestionSuggestions } from '@/features/care-planner/suggestionTypes';
import { useAsyncResult } from '@/features/care-planner/useAsyncResult';
import type { AppError } from '@/lib/errors';
import { getSupportedQuestionSuggestions, saveSupportedQuestions } from '@/services/support-person';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; suggestions: QuestionSuggestions };

/**
 * What happens when a question is tapped:
 * - `free`: tick or untick it straight away.
 * - `confirm`: it has a doctor's answer that removing it would delete, so ask first (as the patient's screen does).
 * - `blocked`: it has an answer, and this support person can't change answers, so it can't be removed.
 */
export type QuestionTapRule = 'free' | 'confirm' | 'blocked';

/**
 * Loads a supported patient's suggested questions, tracks which are ticked, and saves them.
 * Works like the Planner's `useAppointmentQuestions`, built from the same helpers, plus the rule that
 * removing an answered question needs the "Add doctor's answers" permission (it deletes the answer).
 */
export function useSupportedAppointmentQuestions(appointmentId: number, canEditAnswers: boolean) {
  const load = useCallback(() => getSupportedQuestionSuggestions(appointmentId), [appointmentId]);
  const { state, reload: reloadSuggestions } = useAsyncResult(load);

  // The ticks the person has changed (null until they touch one) and the ticks last saved by this
  // screen (null until a save). Both fall back to what was loaded, so there is no copy to sync.
  const [editedIds, setEditedIds] = useState<number[] | null>(null);
  const [savedIds, setSavedIds] = useState<number[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<AppError | null>(null);

  const loadedIds = state.status === 'ready' ? state.data.selectedQuestionIds : [];
  const answeredIds = state.status === 'ready' ? state.data.answeredQuestionIds : [];
  const baselineIds = savedIds ?? loadedIds;
  const selectedIds = editedIds ?? baselineIds;

  const reload = useCallback(() => {
    setEditedIds(null);
    setSavedIds(null);
    reloadSuggestions();
  }, [reloadSuggestions]);

  const tapRule = (questionId: number): QuestionTapRule => {
    if (!needsRemovalConfirmation(selectedIds, answeredIds, questionId)) return 'free';
    return canEditAnswers ? 'confirm' : 'blocked';
  };

  /** Ticks or unticks a question. Callers check `tapRule` first. */
  const toggle = useCallback(
    (questionId: number) => {
      setSaveError(null);
      setEditedIds(toggleQuestion(selectedIds, questionId));
    },
    [selectedIds],
  );

  /** Resolves true when the choices were saved. */
  const save = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    const result = await saveSupportedQuestions(appointmentId, selectedIds);
    setSaving(false);
    if (result.ok) {
      setSavedIds(selectedIds);
      setEditedIds(null);
      return true;
    }
    setSaveError(result.error);
    return false;
  }, [appointmentId, selectedIds]);

  const loadState: LoadState = state.status === 'ready' ? { status: 'ready', suggestions: state.data } : state;

  return {
    load: loadState,
    reload,
    selectedIds,
    tapRule,
    toggle,
    dirty: hasSelectionChanged(baselineIds, selectedIds),
    saving,
    saveError,
    save,
  };
}
