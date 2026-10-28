// Shapes a saved management entry for the Summary screen, using the wording agreed on 12/10.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { formatWeekRange } from '@/features/assessments/week';
import type { ManagementEntry } from '@/services/management';

export type ManagementSummaryData = {
  period: string;
  summarySentence: string;
  medicationResult: string;
  exerciseResult: string;
  emotionResult: string;
};

const NO_EXERCISE = '0 days';

/** The ticked medication names followed by the OTC medication, when there is one. */
function medicationNames(entry: ManagementEntry): string[] {
  return entry.otcMedication ? [...entry.medications, entry.otcMedication] : entry.medications;
}

function summarySentence(exercise: string, names: string[]): string {
  const exercised = exercise !== NO_EXERCISE;
  const list = names.join(', ');
  if (exercised && names.length > 0) {
    return `You manage your pain with exercise (${exercise}) and medication (${list}).`;
  }
  if (exercised) {
    return `You mainly perform exercises to manage your pain (${exercise}).`;
  }
  if (names.length > 0) {
    return `You mainly use medication to manage your pain (${list}).`;
  }
  return 'You did not record any exercise or medication to manage your pain this week.';
}

function medicationResult(names: string[], noMedication: boolean): string {
  if (names.length === 1) return `You only consumed ${names[0]} this week.`;
  if (names.length > 1) return `You consumed ${names.join(', ')} this week.`;
  if (noMedication) return 'You did not take any medication this week.';
  return 'No medication answer recorded.';
}

export function toManagementSummary(entry: ManagementEntry): ManagementSummaryData {
  const names = medicationNames(entry);
  return {
    period: formatWeekRange(entry.weekStart),
    summarySentence: summarySentence(entry.exercise, names),
    medicationResult: medicationResult(names, entry.noMedication),
    // Open item (Appendix B.1): '0 days' reads "You exercised for 0 days this week."
    exerciseResult: `You exercised for ${entry.exercise} this week.`,
    emotionResult: entry.emotion ?? 'You did not perform any dedicated strategy to manage your mood.',
  };
}
