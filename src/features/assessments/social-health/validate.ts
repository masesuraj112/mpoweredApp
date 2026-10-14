// Validates the social health answers before anything is sent to the database.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.
// SocialHealthAssessmentAnswers has every field optional, so this is the only thing standing
// between an incomplete answer set and the save.

import { SOCIAL_LIFE_OPTIONS, TRAVELLING_OPTIONS } from '@/constants/socialHealthOptions';
import { isFutureDate } from '@/features/assessments/week';
import { toMoodOverall, type MoodOverall } from '@/features/assessments/social-health/mood';
import type { SocialHealthAssessmentAnswers } from '@/features/assessments/social-health/types';
import { fail, ok, type Result } from '@/lib/result';

export type SocialHealthValidationContext = {
  /** The day the entry refers to ('YYYY-MM-DD'). */
  entryDate: string;
  /** The device-local date today. */
  today: string;
  /**
   * The Monday of the week the user joined. When omitted, the check is skipped here and the
   * database rejects an earlier date with BEFORE_START.
   */
  startWeek?: string;
};

/** What saveSocialHealthEntry sends to the database: complete, mood mapped, reflection trimmed. */
export type ValidSocialHealthEntry = {
  date: string;
  socialLife: string;
  travelling: string;
  mood: number;
  relationWithOthers: number;
  enjoymentOfLife: number;
  moodOverall: MoodOverall;
  reflection: string | null;
};

const SLIDER_FIELDS = [
  ['moodNumber', 'mood'],
  ['relationWithOthers', 'relation with others'],
  ['enjoymentOfLife', 'enjoyment of life'],
] as const;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function invalid(field: string, detail: string, message: string): Result<never> {
  return fail({ code: 'VALIDATION', message, detail, field });
}

function readStatement(
  value: string | undefined,
  options: readonly string[],
  field: string,
  label: string,
): Result<string> {
  if (value === undefined || value === null || value.trim() === '') {
    return invalid(field, 'MISSING', `Answer the ${label} question.`);
  }
  if (!options.includes(value)) {
    return invalid(field, 'UNKNOWN_OPTION', `Choose one of the ${label} statements.`);
  }
  return ok(value);
}

function readSlider(
  answers: SocialHealthAssessmentAnswers,
  field: (typeof SLIDER_FIELDS)[number][0],
  label: string,
): Result<number> {
  const value = answers[field];
  if (value === undefined || value === null) {
    return invalid(field, 'MISSING', `Answer the ${label} question.`);
  }
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return invalid(field, 'NOT_INTEGER', `The ${label} answer must be a whole number.`);
  }
  if (value < 0 || value > 10) {
    return invalid(field, 'OUT_OF_RANGE', `The ${label} answer must be between 0 and 10.`);
  }
  return ok(value);
}

export function validateSocialHealthAnswers(
  answers: SocialHealthAssessmentAnswers,
  context: SocialHealthValidationContext,
): Result<ValidSocialHealthEntry> {
  const socialLife = readStatement(answers.socialLife, SOCIAL_LIFE_OPTIONS, 'socialLife', 'social life');
  if (!socialLife.ok) return socialLife;
  const travelling = readStatement(answers.travel, TRAVELLING_OPTIONS, 'travel', 'travelling');
  if (!travelling.ok) return travelling;

  const sliders: Record<string, number> = {};
  for (const [field, label] of SLIDER_FIELDS) {
    const slider = readSlider(answers, field, label);
    if (!slider.ok) return slider;
    sliders[field] = slider.data;
  }

  if (answers.moodEmotion === undefined || answers.moodEmotion === '') {
    return invalid('moodEmotion', 'MISSING', 'Choose how your mood was generally.');
  }
  const moodOverall = toMoodOverall(answers.moodEmotion);
  if (moodOverall === null) {
    return invalid('moodEmotion', 'UNKNOWN_OPTION', 'Choose one of the mood options.');
  }

  const { entryDate, today, startWeek } = context;
  if (!DATE_PATTERN.test(entryDate)) {
    return invalid('entryDate', 'INVALID_DATE', 'The entry date is not a valid date.');
  }
  try {
    if (isFutureDate(entryDate, today)) {
      return fail({ code: 'FUTURE_DATE', message: 'The entry date cannot be in the future.', field: 'entryDate' });
    }
    if (startWeek !== undefined && entryDate < startWeek) {
      return fail({ code: 'BEFORE_START', message: 'The entry date is before you started using the app.', field: 'entryDate' });
    }
  } catch {
    return invalid('entryDate', 'INVALID_DATE', 'The entry date is not a valid date.');
  }

  const reflection = answers.emotionReflection?.trim();

  return ok({
    date: entryDate,
    socialLife: socialLife.data,
    travelling: travelling.data,
    mood: sliders.moodNumber,
    relationWithOthers: sliders.relationWithOthers,
    enjoymentOfLife: sliders.enjoymentOfLife,
    moodOverall,
    reflection: reflection ? reflection : null,
  });
}
