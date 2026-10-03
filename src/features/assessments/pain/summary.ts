// Shapes a saved pain entry for the Summary screen.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { ScoreThresholds } from '@/constants/scoring-thresholds';
import { formatWeekRange } from '@/features/assessments/week';
import type { PainEntry } from '@/services/assessments';

export type PainIntensityEntry = { value: number; description: string };

export type PainSummaryData = {
  period: string;
  locations: string[];
  characteristics: string[];
  intensity: {
    current: PainIntensityEntry;
    mildest: PainIntensityEntry;
    worst: PainIntensityEntry;
    average: PainIntensityEntry;
  };
};

function intensity(value: number): PainIntensityEntry {
  const bands = ScoreThresholds.pain as Record<number, string>;
  return { value, description: bands[value] ?? '' };
}

export function toPainSummary(entry: PainEntry): PainSummaryData {
  return {
    period: formatWeekRange(entry.weekStart),
    locations: entry.locations,
    characteristics: entry.characteristics,
    intensity: {
      current: intensity(entry.current),
      mildest: intensity(entry.mildest),
      worst: intensity(entry.worst),
      average: intensity(entry.average),
    },
  };
}
