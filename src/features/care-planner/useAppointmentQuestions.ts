import { useCallback, useEffect, useState } from 'react';

import type { AppError } from '@/lib/errors';
import { getQuestionSuggestions, saveAppointmentQuestions } from '@/services/care-planner';

import { hasSelectionChanged, toggleQuestion } from './suggestionSelection';
import type { QuestionSuggestions } from './suggestionTypes';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; suggestions: QuestionSuggestions };

/**
 * Loads the suggested questions for an appointment, tracks which are ticked, and saves them.
 * `dirty` is true while the ticks differ from what was last saved.
 */
export function useAppointmentQuestions(appointmentId: number) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<AppError | null>(null);

  useEffect(() => {
    let cancelled = false;
    getQuestionSuggestions(appointmentId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setLoad({ status: 'ready', suggestions: result.data });
        setSelectedIds(result.data.selectedQuestionIds);
        setSavedIds(result.data.selectedQuestionIds);
      } else {
        setLoad({ status: 'error', error: result.error });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [appointmentId, attempt]);

  const reload = useCallback(() => {
    setLoad({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const toggle = useCallback((questionId: number) => {
    setSaveError(null);
    setSelectedIds((current) => toggleQuestion(current, questionId));
  }, []);

  /** Resolves true when the choices were saved. */
  const save = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    const result = await saveAppointmentQuestions(appointmentId, selectedIds);
    setSaving(false);
    if (result.ok) {
      setSavedIds(selectedIds);
      return true;
    }
    setSaveError(result.error);
    return false;
  }, [appointmentId, selectedIds]);

  return {
    load,
    reload,
    selectedIds,
    toggle,
    dirty: hasSelectionChanged(savedIds, selectedIds),
    saving,
    saveError,
    save,
  };
}
