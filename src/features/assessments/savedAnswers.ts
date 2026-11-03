// Turns a saved assessment back into the answers its question screens read, so the user can edit
// what they recorded. Pure module: no imports from @/lib/supabase, react-native or expo-*.
//
// entryDate is left out on purpose: the question screens save to today's week, which is the week
// being edited, and a stored entryDate would stay in the draft and send next week's answers to
// this week.

import { MOOD_EMOTION_VALUES } from '@/constants/socialHealthOptions';
import type { ManagementAssessmentAnswers } from '@/features/assessments/management/types';
import type { MovementAssessmentAnswers } from '@/features/assessments/movement/types';
import type { PainAssessmentAnswers } from '@/features/assessments/pain/types';
import type { PersonalCareAssessmentAnswers } from '@/features/assessments/personal-care/types';
import type { SocialHealthAssessmentAnswers } from '@/features/assessments/social-health/types';
import type { MovementEntry, PainEntry, PersonalCareEntry } from '@/services/assessments';
import type { ManagementEntry } from '@/services/management';
import type { SocialHealthEntry } from '@/services/social-health';

const optional = (value: string | null) => value ?? undefined;

export function painEntryToAnswers(entry: PainEntry): PainAssessmentAnswers {
  return {
    painLocations: [...entry.locations],
    characteristics: [...entry.characteristics],
    currentPain: entry.current,
    mildestPain: entry.mildest,
    worstPain: entry.worst,
    averagePain: entry.average,
  };
}

export function movementEntryToAnswers(entry: MovementEntry): MovementAssessmentAnswers {
  return {
    activeHours: entry.activeHours,
    generalImpacts: [...entry.generalImpacts],
    walkingImpact: entry.walking,
    liftingImpact: entry.lifting,
    sittingImpact: entry.sitting,
    standingImpact: entry.standing,
    reflection: optional(entry.reflection),
  };
}

export function personalCareEntryToAnswers(entry: PersonalCareEntry): PersonalCareAssessmentAnswers {
  return {
    generalActivities: [...entry.generalActivities],
    personalCareLevel: entry.washingDressing,
    sleepingLevel: entry.sleeping,
    reflection: optional(entry.reflection),
  };
}

export function socialHealthEntryToAnswers(entry: SocialHealthEntry): SocialHealthAssessmentAnswers {
  return {
    socialLife: entry.socialLife,
    travel: entry.travelling,
    moodNumber: entry.mood,
    relationWithOthers: entry.relationWithOthers,
    enjoymentOfLife: entry.enjoymentOfLife,
    // stored as the full sentence, for example "I was feeling calm"; the screens use "calm"
    moodEmotion: MOOD_EMOTION_VALUES.find((value) => entry.moodOverall === `I was feeling ${value}`),
    emotionReflection: optional(entry.reflection),
  };
}

export function managementEntryToAnswers(entry: ManagementEntry): ManagementAssessmentAnswers {
  return {
    medications: [...entry.medications],
    noMedication: entry.noMedication,
    otcMedication: optional(entry.otcMedication),
    exerciseDays: entry.exercise,
    emotionStrategies: optional(entry.emotion),
  };
}
