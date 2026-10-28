import { getCompletedAssessments, type WeeklyAssessmentId } from '@/features/assessments/homeProgress';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { getWeeklyProgress, getWeeklyReflection } from '@/services/home';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export type ReflectionStatus = 'none' | 'draft' | 'complete';

type WeeklyHomeProgress = {
  /** Each assessment recorded this week, with its entry date (null when only known on this device). */
  recorded: Map<WeeklyAssessmentId, string | null>;
  reflection: ReflectionStatus;
  isLoaded: boolean;
  error: string | null;
};

/** This week's assessments and reflection, reloaded every time the home screen gains focus. */
export function useWeeklyHomeProgress(): WeeklyHomeProgress {
  const [recorded, setRecorded] = useState<Map<WeeklyAssessmentId, string | null>>(() => new Map());
  const [reflection, setReflection] = useState<ReflectionStatus>('none');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;
      const weekStart = getWeekStart(getLocalToday());
      setIsLoaded(false);

      Promise.all([
        getWeeklyProgress(weekStart),
        getWeeklyReflection(weekStart),
        // Personal care is not saved in the database yet, so it still uses the on-device flag.
        // Switch it to getWeeklyProgress once the personal care backend is merged.
        getCompletedAssessments().catch(() => new Set<WeeklyAssessmentId>()),
      ]).then(([progress, savedReflection, onDevice]) => {
        if (!isCurrent) return;
        const next = new Map<WeeklyAssessmentId, string | null>();
        if (onDevice.has('personalCare')) next.set('personalCare', null);
        if (progress.ok) {
          for (const [id, date] of Object.entries(progress.data)) {
            next.set(id as WeeklyAssessmentId, date);
          }
        }
        setRecorded(next);
        setReflection(
          savedReflection.ok && savedReflection.data
            ? savedReflection.data.isComplete ? 'complete' : 'draft'
            : 'none',
        );
        setError(
          progress.ok && savedReflection.ok ? null : 'This week’s progress could not be loaded. Please try again.',
        );
        setIsLoaded(true);
      });

      return () => {
        isCurrent = false;
      };
    }, []),
  );

  return { recorded, reflection, isLoaded, error };
}
