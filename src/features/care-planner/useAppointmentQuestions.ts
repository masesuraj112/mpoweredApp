import { useCallback, useState } from 'react';

import type { AppError } from '@/lib/errors';
import { getQuestionSuggestions, saveAppointmentQuestions } from '@/services/care-planner';

import { hasSelectionChanged, toggleQuestion } from './suggestionSelection';
import type { QuestionSuggestions } from './suggestionTypes';
import { useAsyncResult } from './useAsyncResult';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; suggestions: QuestionSuggestions };

/**
 * Loads the suggested questions for an appointment, tracks which are ticked, and saves them.
 * `dirty` is true while the ticks differ from what was last saved.
 */
export function useAppointmentQuestions(appointmentId: number) {
  const load = useCallback(() => getQuestionSuggestions(appointmentId), [appointmentId]);
  const { state, reload: reloadSuggestions } = useAsyncResult(load);

  // The ticks the person has changed (null until they touch one) and the ticks last saved by this
  // screen (null until a save). Both fall back to what was loaded, so there is no copy to sync.
  const [editedIds, setEditedIds] = useState<number[] | null>(null);
  const [savedIds, setSavedIds] = useState<number[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<AppError | null>(null);

  const loadedIds = state.status === 'ready' ? state.data.selectedQuestionIds : [];
  const baselineIds = savedIds ?? loadedIds;
  const selectedIds = editedIds ?? baselineIds;

  const reload = useCallback(() => {
    setEditedIds(null);
    setSavedIds(null);
    reloadSuggestions();
  }, [reloadSuggestions]);

  const toggle = useCallback(
    (questionId: number) => {
      setSaveError(null);
      setEditedIds(toggleQuestion(selectedIds, questionId));
    },
    [selectedIds],
  );

  // With no suggestions (nothing could be generated yet) there is nothing to choose or save.
  const hasSuggestions =
    state.status === 'ready' && state.data.groups.some((group) => group.questions.length > 0);

  /** Resolves true when the choices were saved. */
  const save = useCallback(async (): Promise<boolean> => {
    if (!hasSuggestions) return true;
    setSaving(true);
    setSaveError(null);
    const result = await saveAppointmentQuestions(appointmentId, selectedIds);
    setSaving(false);
    if (result.ok) {
      setSavedIds(selectedIds);
      setEditedIds(null);
      return true;
    }
    setSaveError(result.error);
    return false;
  }, [appointmentId, selectedIds, hasSuggestions]);

  const loadState: LoadState =
    state.status === 'ready' ? { status: 'ready', suggestions: state.data } : state;

  return {
    load: loadState,
    reload,
    selectedIds,
    toggle,
    dirty: hasSelectionChanged(baselineIds, selectedIds),
    saving,
    saveError,
    save,
  };
}
