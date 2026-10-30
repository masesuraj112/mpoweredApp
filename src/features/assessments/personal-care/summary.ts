// Shapes a saved Personal Care entry for the Summary screen and scores it.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { PERSONAL_CARE_OPTIONS, SLEEPING_OPTIONS } from '@/features/assessments/personal-care/options';
import { formatWeekRange } from '@/features/assessments/week';
import type { PersonalCareEntry } from '@/services/assessments';

export type PersonalCareSummaryData = {
  period: string;
  generalActivities: string[];
  personalCareLevel: string;
  sleepingLevel: string;
  /** Null when the user wrote no reflection. */
  reflection: string | null;
  totalScore: number;
  message: string;
};

/** An answer scores its position in the list: 0 for the first (least impact) up to 5. */
function scoreOf(options: readonly string[], answer: string): number {
  const index = options.indexOf(answer);
  return index === -1 ? 0 : index;
}

/**
 * The personal care score: the number of general activities ticked plus the position of the
 * personal care answer and of the sleeping answer. The reflection does not count.
 * The lowest possible score is 1 (at least one activity is required); the highest is 5 + 5 + 5 = 15.
 */
export function personalCareScore(entry: PersonalCareEntry): number {
  return (
    entry.generalActivities.length +
    scoreOf(PERSONAL_CARE_OPTIONS, entry.washingDressing) +
    scoreOf(SLEEPING_OPTIONS, entry.sleeping)
  );
}

export function impactMessage(score: number): string {
  if (score <= 3) return 'Your answers indicate that pain does not really impact your personal care.';
  if (score <= 7) return 'Your answers indicate that pain mildly impacts your personal care.';
  if (score <= 11) return 'Your answers indicate that pain moderately impacts your personal care.';
  return 'Your answers indicate that pain is significantly impacting your personal care. With the right care and guidance, these tasks can become more manageable over time.';
}

export function toPersonalCareSummary(entry: PersonalCareEntry): PersonalCareSummaryData {
  const totalScore = personalCareScore(entry);
  return {
    period: formatWeekRange(entry.weekStart),
    generalActivities: entry.generalActivities,
    personalCareLevel: entry.washingDressing,
    sleepingLevel: entry.sleeping,
    reflection: entry.reflection,
    totalScore,
    message: impactMessage(totalScore),
  };
}