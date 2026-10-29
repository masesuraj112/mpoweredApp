// Validates the Personal Care answers before anything is sent to the database.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.
// PersonalCareAssessmentAnswers has every field optional, so this is the only thing standing
// between an incomplete answer set and the save.

import { validateEntryDate, type EntryDateContext } from '@/features/assessments/entryDate';
import {
  GENERAL_ACTIVITY_OPTIONS,
  PERSONAL_CARE_OPTIONS,
  SLEEPING_OPTIONS,
} from '@/features/assessments/personal-care/options';
import type { PersonalCareAssessmentAnswers } from '@/features/assessments/personal-care/types';
import { isReflectionTooLong, MAX_REFLECTION_WORDS } from '@/features/assessments/reflection';
import { fail, ok, type Result } from '@/lib/result';

export type PersonalCareValidationContext = EntryDateContext;

/** What savePersonalCareEntry sends to the database: complete, de-duplicated, trimmed. */
export type ValidPersonalCareEntry = {
  date: string;
  generalActivities: string[];
  washingDressing: string;
  sleeping: string;
  /** Null when the user wrote nothing: the reflection is optional. */
  reflection: string | null;
};

function invalid(field: string, detail: string, message: string): Result<never> {
  return fail({ code: 'VALIDATION', message, detail, field });
}

function readChoice(
  value: string | undefined,
  options: readonly string[],
  field: string,
  question: string,
): Result<string> {
  if (value === undefined || value === null || value === '') {
    return invalid(field, 'MISSING', `Answer the ${question} question.`);
  }
  if (!options.includes(value)) {
    return invalid(field, 'UNKNOWN_OPTION', `That is not one of the ${question} answers.`);
  }
  return ok(value);
}

export function validatePersonalCareAnswers(
  answers: PersonalCareAssessmentAnswers,
  context: PersonalCareValidationContext,
): Result<ValidPersonalCareEntry> {
  const date = validateEntryDate(context);
  if (!date.ok) return date;

  const activities = answers.generalActivities ?? [];
  if (activities.length === 0) {
    return invalid('generalActivities', 'NO_ACTIVITY', 'Choose at least one general activity.');
  }
  const unknown = activities.find((activity) => !GENERAL_ACTIVITY_OPTIONS.includes(activity));
  if (unknown !== undefined) {
    return invalid('generalActivities', 'UNKNOWN_OPTION', `"${unknown}" is not a general activity.`);
  }

  const washingDressing = readChoice(
    answers.personalCareLevel,
    PERSONAL_CARE_OPTIONS,
    'personalCareLevel',
    'personal care',
  );
  if (!washingDressing.ok) return washingDressing;

  const sleeping = readChoice(answers.sleepingLevel, SLEEPING_OPTIONS, 'sleepingLevel', 'sleeping');
  if (!sleeping.ok) return sleeping;

  const reflection = answers.reflection?.trim() ?? '';
  if (isReflectionTooLong(reflection)) {
    return invalid(
      'reflection',
      'TOO_LONG',
      `Your reflection must be ${MAX_REFLECTION_WORDS} words or fewer.`,
    );
  }

  return ok({
    date: date.data,
    generalActivities: [...new Set(activities)],
    washingDressing: washingDressing.data,
    sleeping: sleeping.data,
    reflection: reflection === '' ? null : reflection,
  });
}