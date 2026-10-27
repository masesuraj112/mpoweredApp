import { useCallback, useState } from 'react';

import type { AppError } from '@/lib/errors';
import { getSupportPeople, saveSupportPeople } from '@/services/care-planner';

import {
  EMPTY_SUPPORT_PERSON_DRAFT,
  hasErrors,
  isDraftEmpty,
  NAME_REQUIRED_MESSAGE,
  toSupportPerson,
  validateField,
  validateSupportPerson,
  type SupportPersonDraft,
  type SupportPersonErrors,
} from './supportPerson';
import type { SupportPerson } from './types';
import { useAsyncResult } from './useAsyncResult';

const sameList = (a: readonly SupportPerson[], b: readonly SupportPerson[]) =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * The "Add a support person" step. An appointment can have several people: the ones already added
 * are listed, and the form below is for the next one. Saving REPLACES the appointment's list, so
 * going back and saving again never duplicates anyone.
 */
export function useSupportPerson(appointmentId: number) {
  const load = useCallback(() => getSupportPeople(appointmentId), [appointmentId]);
  const { state, reload: reloadPeople } = useAsyncResult(load);

  // The list as edited on this screen (null until it is changed) and as last saved by it (null
  // until a save). Both fall back to what was loaded, so there is no copy to keep in sync.
  const [editedPeople, setEditedPeople] = useState<SupportPerson[] | null>(null);
  const [savedPeople, setSavedPeople] = useState<SupportPerson[] | null>(null);
  const [draft, setDraft] = useState<SupportPersonDraft>(EMPTY_SUPPORT_PERSON_DRAFT);
  const [errors, setErrors] = useState<SupportPersonErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<AppError | null>(null);

  const loadedPeople = state.status === 'ready' ? state.data : [];
  const baselinePeople = savedPeople ?? loadedPeople;
  const people = editedPeople ?? baselinePeople;

  const reload = useCallback(() => {
    setEditedPeople(null);
    setSavedPeople(null);
    reloadPeople();
  }, [reloadPeople]);

  const updateDraft = useCallback((patch: Partial<SupportPersonDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    // Editing a field clears its message; the next Save or leaving the field checks it again.
    setErrors((current) => {
      const next = { ...current };
      (Object.keys(patch) as (keyof SupportPersonDraft)[]).forEach((key) => {
        if (key === 'name' || key === 'phone' || key === 'email') delete next[key];
      });
      return next;
    });
    setSaveError(null);
  }, []);

  /** Checks one field when the person leaves it. */
  const blurField = useCallback(
    (field: keyof SupportPersonErrors) => {
      const message = validateField(field, draft);
      setErrors((current) => ({ ...current, [field]: message }));
    },
    [draft],
  );

  /** Adds the form's person to the list and clears the form for the next one. */
  const addAnother = useCallback((): boolean => {
    if (isDraftEmpty(draft)) {
      setErrors({ name: NAME_REQUIRED_MESSAGE });
      return false;
    }
    const found = validateSupportPerson(draft);
    setErrors(found);
    if (hasErrors(found)) return false;
    setEditedPeople([...people, toSupportPerson(draft)]);
    setDraft(EMPTY_SUPPORT_PERSON_DRAFT);
    return true;
  }, [draft, people]);

  const removePerson = useCallback(
    (index: number) => setEditedPeople(people.filter((_, i) => i !== index)),
    [people],
  );

  const persist = useCallback(
    async (list: SupportPerson[]): Promise<boolean> => {
      setSaving(true);
      setSaveError(null);
      const result = await saveSupportPeople(appointmentId, list);
      setSaving(false);
      if (!result.ok) {
        setSaveError(result.error);
        return false;
      }
      // the saved list comes back with the ids the database gave each person
      setSavedPeople(result.data);
      setEditedPeople(null);
      setDraft(EMPTY_SUPPORT_PERSON_DRAFT);
      setErrors({});
      return true;
    },
    [appointmentId],
  );

  /** Saves the list, including the form's person if something was entered. */
  const save = useCallback(async (): Promise<boolean> => {
    let list = people;
    if (!isDraftEmpty(draft)) {
      const found = validateSupportPerson(draft);
      setErrors(found);
      if (hasErrors(found)) return false;
      list = [...people, toSupportPerson(draft)];
    }
    return persist(list);
  }, [people, draft, persist]);

  /** Skips the step: no support person is saved for this appointment. */
  const skip = useCallback(async (): Promise<boolean> => persist([]), [persist]);

  return {
    loadStatus: state.status,
    reload,
    people,
    draft,
    errors,
    updateDraft,
    blurField,
    addAnother,
    removePerson,
    save,
    skip,
    saving,
    saveError,
    dirty: !isDraftEmpty(draft) || !sameList(people, baselinePeople),
  };
}
