import AsyncStorage from '@react-native-async-storage/async-storage';

/** Every assessment draft is saved under a key starting with this (see the context.ts in each assessment folder). */
export const ASSESSMENT_DRAFT_PREFIX = '@mpowered/assessment-draft/';

/**
 * Removes every saved assessment draft from this device. Drafts hold health answers and are not
 * tied to a user, so they are cleared when the user signs out (which also covers account deletion
 * and an expired session).
 */
export async function clearAssessmentDrafts(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const drafts = keys.filter(key => key.startsWith(ASSESSMENT_DRAFT_PREFIX));
  if (drafts.length > 0) await AsyncStorage.multiRemove(drafts);
}
