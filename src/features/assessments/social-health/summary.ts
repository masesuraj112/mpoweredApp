// Shapes a saved social health entry for the Summary screen.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { ScoreThresholds } from '@/constants/scoring-thresholds';
import { scoreSocialHealth } from '@/features/assessments/social-health/scoring';
import { formatWeekRange } from '@/features/assessments/week';
import type { SocialHealthEntry } from '@/services/social-health';

type ScoredAssessment = 'mood' | 'relationships' | 'enjoyment';

export type SocialHealthSummaryData = {
  period: string;
  /** Completes "Your answers indicate that pain ...". null when the entry cannot be scored. */
  impactPhrase: string | null;
  results: {
    socialLife: string;
    travelling: string;
    mood: string;
    relationWithOthers: string;
    enjoymentOfLife: string;
  };
  generalMood: string;
  triggers: string;
};

// Map a 0-10 slider score to the phrase shown on the slider for that question.
export function describeScore(assessment: ScoredAssessment, score: number | undefined): string {
  if (score === undefined) {
    return 'No response recorded.';
  }
  const thresholds = ScoreThresholds[assessment];
  const clamped = Math.min(10, Math.max(0, Math.round(score))) as keyof typeof thresholds;
  return `${thresholds[clamped]}.`;
}

export function toSocialHealthSummary(entry: SocialHealthEntry): SocialHealthSummaryData {
  const score = scoreSocialHealth(entry);
  return {
    period: formatWeekRange(entry.weekStart),
    impactPhrase: score ? score.phrase : null,
    results: {
      socialLife: `${entry.socialLife}.`,
      travelling: `${entry.travelling}.`,
      mood: describeScore('mood', entry.mood),
      relationWithOthers: describeScore('relationships', entry.relationWithOthers),
      enjoymentOfLife: describeScore('enjoyment', entry.enjoymentOfLife),
    },
    generalMood: entry.moodOverall,
    triggers: entry.reflection ?? 'No triggers added.',
  };
}
