// Pure module: no imports from @/lib/supabase, react-native or expo-*.
import { MOOD_EMOTION_VALUES, type MoodEmotion } from '@/constants/socialHealthOptions';

/** The sentences chk_mood_overall accepts, in the same order as MOOD_EMOTION_VALUES. */
export const MOOD_OVERALL_VALUES = MOOD_EMOTION_VALUES.map(
  (value) => `I was feeling ${value}` as const,
);

export type MoodOverall = `I was feeling ${MoodEmotion}`;

/** Maps the stored emoji value (for example 'frustrated') to the sentence the database stores. */
export function toMoodOverall(value: string | undefined): MoodOverall | null {
  const emotion = MOOD_EMOTION_VALUES.find((v) => v === value);
  return emotion ? `I was feeling ${emotion}` : null;
}
