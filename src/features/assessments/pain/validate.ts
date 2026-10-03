// Validates the pain answers before anything is sent to the database.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.
// PainAssessmentAnswers has every field optional, so this is the only thing standing between
// an incomplete answer set and the save.

import { PAIN_CHARACTERISTICS_OPTIONS } from '@/constants/painCharacteristics';
import { PAIN_LOCATION_PRESETS } from '@/constants/painLocations';
import { isFutureDate } from '@/features/assessments/week';
import { dedupe, isValidCharacteristic, normaliseLocations } from '@/features/assessments/pain/normalise';
import type { PainAssessmentAnswers } from '@/features/assessments/pain/types';
import { fail, ok, type Result } from '@/lib/result';

export type PainValidationContext = {
  /** The day the entry refers to ('YYYY-MM-DD'). */
  entryDate: string;
  /** The device-local date today. */
  today: string;
  /**
   * The Monday of the week the user joined. When omitted, the check is skipped here and the
   * database rejects an earlier date with BEFORE_START.
   */
  startWeek?: string;
  /** Locations that may be matched to a canonical spelling. Defaults to the presets. */
  knownLocations?: readonly string[];
};

/** What savePainEntry sends to the database: normalised, de-duplicated, complete. */
export type ValidPainEntry = {
  date: string;
  current: number;
  mildest: number;
  worst: number;
  average: number;
  locations: string[];
  characteristics: string[];
};

const LEVEL_FIELDS = [
  ['currentPain', 'current pain'],
  ['mildestPain', 'mildest pain'],
  ['worstPain', 'worst pain'],
  ['averagePain', 'average pain'],
] as const;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function invalid(field: string, detail: string, message: string): Result<never> {
  return fail({ code: 'VALIDATION', message, detail, field });
}

function readLevel(
  answers: PainAssessmentAnswers,
  field: (typeof LEVEL_FIELDS)[number][0],
  label: string,
): Result<number> {
  const value = answers[field];
  if (value === undefined || value === null) {
    return invalid(field, 'MISSING', `Answer the ${label} question.`);
  }
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return invalid(field, 'NOT_INTEGER', `The ${label} must be a whole number.`);
  }
  if (value < 0 || value > 10) {
    return invalid(field, 'OUT_OF_RANGE', `The ${label} must be between 0 and 10.`);
  }
  return ok(value);
}

export function validatePainAnswers(
  answers: PainAssessmentAnswers,
  context: PainValidationContext,
): Result<ValidPainEntry> {
  const levels: Record<string, number> = {};
  for (const [field, label] of LEVEL_FIELDS) {
    const level = readLevel(answers, field, label);
    if (!level.ok) return level;
    levels[field] = level.data;
  }
  const current = levels.currentPain;
  const mildest = levels.mildestPain;
  const worst = levels.worstPain;
  const average = levels.averagePain;

  // D4: "current" is the pain on the chosen day; mildest/worst/average describe the week
  if (mildest > current) {
    return invalid('mildestPain', 'ORDERING', 'The mildest pain cannot be higher than the current pain.');
  }
  if (worst < current) {
    return invalid('worstPain', 'ORDERING', 'The worst pain cannot be lower than the current pain.');
  }
  if (average < mildest || average > worst) {
    return invalid('averagePain', 'ORDERING', 'The average pain must be between the mildest and the worst.');
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

  const rawLocations = answers.painLocations ?? [];
  const locations = normaliseLocations(rawLocations, context.knownLocations ?? PAIN_LOCATION_PRESETS);
  if (!locations.ok) return locations;
  if (locations.data.length === 0) {
    return invalid('painLocations', 'NO_LOCATION', 'Choose at least one pain location.');
  }

  const rawCharacteristics = answers.characteristics ?? [];
  const options = [...PAIN_CHARACTERISTICS_OPTIONS];
  if (rawCharacteristics.length === 0) {
    return invalid('characteristics', 'NO_CHARACTERISTIC', 'Choose at least one pain characteristic.');
  }
  const unknown = rawCharacteristics.find((value) => !isValidCharacteristic(value, options));
  if (unknown !== undefined) {
    return invalid('characteristics', 'UNKNOWN_CHARACTERISTIC', `"${unknown}" is not a pain characteristic.`);
  }

  return ok({
    date: entryDate,
    current,
    mildest,
    worst,
    average,
    locations: locations.data,
    characteristics: dedupe(rawCharacteristics),
  });
}
