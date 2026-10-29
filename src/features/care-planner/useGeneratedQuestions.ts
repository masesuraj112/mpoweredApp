import { useCallback } from 'react';

import { previewGeneratedQuestions } from '@/services/care-planner';

import { useAsyncResult } from './useAsyncResult';

/** The questions generated for the person from their latest assessments, for browsing only. */
export function useGeneratedQuestions() {
  const load = useCallback(() => previewGeneratedQuestions(), []);
  return useAsyncResult(load);
}
