import { useCallback, useState } from 'react';

import type { AppError } from '@/lib/errors';
import {
  deleteSupportPerson,
  listMySupportPersons,
  saveSupportPerson,
} from '@/services/care-planner';

import type { SupportPerson } from './types';
import { useAsyncResult } from './useAsyncResult';

/**
 * The patient's own list of support people (Settings > Support Persons): loading it, adding or
 * editing one, and deleting one. `save` and `remove` resolve true when the change was made, and
 * then the list is read again so it shows what the database holds.
 */
export function useMySupportPersons() {
  const load = useCallback(() => listMySupportPersons(), []);
  const { state, reload, refresh } = useAsyncResult(load);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const clearActionError = useCallback(() => setActionError(null), []);

  const save = useCallback(
    async (person: SupportPerson): Promise<boolean> => {
      setBusy(true);
      setActionError(null);
      const result = await saveSupportPerson(person);
      setBusy(false);
      if (!result.ok) {
        setActionError(result.error);
        return false;
      }
      refresh();
      return true;
    },
    [refresh],
  );

  const remove = useCallback(
    async (supportPersonId: number): Promise<boolean> => {
      setBusy(true);
      setActionError(null);
      const result = await deleteSupportPerson(supportPersonId);
      setBusy(false);
      if (!result.ok) {
        setActionError(result.error);
        return false;
      }
      refresh();
      return true;
    },
    [refresh],
  );

  return { state, reload, busy, actionError, clearActionError, save, remove };
}
