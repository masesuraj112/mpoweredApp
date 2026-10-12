import { validateEntryDate, type EntryDateContext } from '@/features/assessments/entryDate';
import {
  GENERAL_IMPACT_OPTIONS,
  LIFTING_OPTIONS,
  MAX_ACTIVE_HOURS,
  SITTING_OPTIONS,
  STANDING_OPTIONS,
  WALKING_OPTIONS,
} from '@/features/assessments/movement/options';
import type { MovementAssessmentAnswers } from '@/features/assessments/movement/types';
import { fail, ok, type Result } from '@/lib/result';

export type MovementValidationContext = EntryDateContext;

/** What gets sent to the database: complete, de-duplicated, trimmed. */
export type ValidMovementEntry = {
  date: string;
  activeHours: number;
  generalImpacts: string[];
  walking: string;
  lifting: string;
  sitting: string;
  standing: string;
  /** Null when the user wrote nothing: the reflection is optional. */
  reflection: string | null;
};

type ChoiceField = 'walkingImpact' | 'liftingImpact' | 'sittingImpact' | 'standingImpact';

const CHOICES: readonly { field: ChoiceField; options: readonly string[]; question: string }[] = [
  { field: 'walkingImpact', options: WALKING_OPTIONS, question: 'walking' },
  { field: 'liftingImpact', options: LIFTING_OPTIONS, question: 'lifting' },
  { field: 'sittingImpact', options: SITTING_OPTIONS, question: 'sitting' },
  { field: 'standingImpact', options: STANDING_OPTIONS, question: 'standing' },
];

function invalid(field: string, detail: string, message: string): Result<never> {
  return fail({ code: 'VALIDATION', message, detail, field });
}

export function validateMovementAnswers(
  answers: MovementAssessmentAnswers,
  context: MovementValidationContext,
): Result<ValidMovementEntry> {
  const date = validateEntryDate(context);
  if (!date.ok) return date;

  const hours = answers.activeHours;
  if (hours === undefined || hours === null) {
    return invalid('activeHours', 'MISSING', 'Answer the active hours question.');
  }
  if (typeof hours !== 'number' || !Number.isFinite(hours)) {
    return invalid('activeHours', 'NOT_A_NUMBER', 'The active hours must be a number.');
  }
  if (hours < 0 || hours > MAX_ACTIVE_HOURS) {
    return invalid('activeHours', 'OUT_OF_RANGE', `The active hours must be between 0 and ${MAX_ACTIVE_HOURS}.`);
  }

  const impacts = answers.generalImpacts ?? [];
  if (impacts.length === 0) {
    return invalid('generalImpacts', 'NO_IMPACT', 'Choose at least one general movement impact.');
  }
  const unknown = impacts.find((impact) => !GENERAL_IMPACT_OPTIONS.includes(impact));
  if (unknown !== undefined) {
    return invalid('generalImpacts', 'UNKNOWN_OPTION', `"${unknown}" is not a general movement impact.`);
  }

  const chosen: Record<ChoiceField, string> = {
    walkingImpact: '',
    liftingImpact: '',
    sittingImpact: '',
    standingImpact: '',
  };
  for (const { field, options, question } of CHOICES) {
    const value = answers[field];
    if (value === undefined || value === null || value === '') {
      return invalid(field, 'MISSING', `Answer the ${question} question.`);
    }
    if (!options.includes(value)) {
      return invalid(field, 'UNKNOWN_OPTION', `That is not one of the ${question} answers.`);
    }
    chosen[field] = value;
  }

  const reflection = answers.reflection?.trim() ?? '';

  return ok({
    date: date.data,
    activeHours: hours,
    generalImpacts: [...new Set(impacts)],
    walking: chosen.walkingImpact,
    lifting: chosen.liftingImpact,
    sitting: chosen.sittingImpact,
    standing: chosen.standingImpact,
    reflection: reflection === '' ? null : reflection,
  });
}