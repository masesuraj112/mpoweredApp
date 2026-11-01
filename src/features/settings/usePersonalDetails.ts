import { useCallback, useState } from 'react';

import { useAsyncResult } from '@/features/care-planner/useAsyncResult';
import type { Result } from '@/lib/result';
import { getPersonalDetails, updateProfile } from '@/services/profile';

/**
 * The signed-in user's personal details (Settings > Account): loading them, and saving a new name
 * and year of birth. `save` resolves with the result, and on success the details are read again so
 * the page shows what the database holds.
 */
export function usePersonalDetails() {
  const load = useCallback(() => getPersonalDetails(), []);
  const { state, reload, refresh } = useAsyncResult(load);
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (details: { name: string; yearOfBirth: number | null }): Promise<Result<void>> => {
      setSaving(true);
      const result = await updateProfile(details);
      setSaving(false);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  return { state, reload, saving, save };
}
