// Validates the management answers before anything is sent to the database.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.
// ManagementAssessmentAnswers has every field optional, so this is the only thing standing
// between an incomplete answer set and the save. Only exercise is required (M10).

import {
  EXERCISE_OPTIONS,
  MAX_MEDICATION_NAME_LENGTH,
  NO_MEDICATION_OPTION,
} from '@/constants/managementOptions';
import type { ManagementAssessmentAnswers } from '@/features/assessments/management/types';
import { isFutureDate } from '@/features/assessments/week';
import { fail, ok, type Result } from '@/lib/result';

export type ManagementValidationContext = {
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

/** What saveManagementEntry sends to the database: complete, trimmed, de-duplicated. */
export type ValidManagementEntry = {
  date: string;
  exercise: string;
  emotion: string | null;
  otcMedication: string | null;
  noMedication: boolean;
  medications: string[];
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function invalid(field: string, detail: string, message: string): Result<never> {
  return fail({ code: 'VALIDATION', message, detail, field });
}

function blankToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Trims, drops blanks and the "no medication" row, and de-duplicates (keeping the first order). */
function cleanMedications(raw: readonly string[]): string[] {
  const names = raw
    .map((name) => name.trim())
    .filter((name) => name !== '' && name !== NO_MEDICATION_OPTION);
  return [...new Set(names)];
}

export function validateManagementAnswers(
  answers: ManagementAssessmentAnswers,
  context: ManagementValidationContext,
): Result<ValidManagementEntry> {
  const exercise = answers.exerciseDays;
  if (exercise === undefined || exercise === null || exercise.trim() === '') {
    return invalid('exerciseDays', 'MISSING', 'Answer the exercise question.');
  }
  if (!(EXERCISE_OPTIONS as readonly string[]).includes(exercise)) {
    return invalid('exerciseDays', 'UNKNOWN_OPTION', 'Choose one of the exercise options.');
  }

  const medications = cleanMedications(answers.medications ?? []);
  // Postgres char_length counts code points, so count them the same way here
  const tooLong = medications.find((name) => [...name].length > MAX_MEDICATION_NAME_LENGTH);
  if (tooLong !== undefined) {
    return invalid(
      'medications',
      'VALUE_TOO_LONG',
      `Medication names must be at most ${MAX_MEDICATION_NAME_LENGTH} characters.`,
    );
  }
  const noMedication = answers.noMedication === true;
  if (noMedication && medications.length > 0) {
    return invalid(
      'medications',
      'MEDICATION_CONFLICT',
      `Either choose your medications or "${NO_MEDICATION_OPTION}", not both.`,
    );
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

  return ok({
    date: entryDate,
    exercise,
    emotion: blankToNull(answers.emotionStrategies),
    otcMedication: blankToNull(answers.otcMedication),
    noMedication,
    medications,
  });
}
