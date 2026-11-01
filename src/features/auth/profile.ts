// Turns the onboarding answers into the arguments for the create_profile database function.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { toE164 } from '@/features/auth/phone';
import { fail, ok, type Result } from '@/lib/result';
import { validateYearOfBirth } from '@/services/validation';

const NAME_MAX = 45;
const CONDITION_MAX = 45;

/** The onboarding answers, as held by OnboardingContext. */
export type OnboardingAnswers = {
  name: string;
  userType: 'patient' | 'support-person' | null;
  sex: 'female' | 'male' | 'prefer not to say' | null;
  yearOfBirth: number | null;
  hasDiagnosis: boolean | null;
  conditions: string[];
  otherConditions: string;
  phoneNumber: string;
};

/**
 * Arguments of create_profile. The generated database types cannot express a nullable
 * argument, so the service casts this when it calls the function. The function ignores sex,
 * year and conditions for a support person.
 */
export type CreateProfileArgs = {
  p_name: string;
  p_user_type: 'patient' | 'support_person';
  p_sex: 'Female' | 'Male' | 'Prefer not to say' | null;
  p_year_of_birth: number | null;
  p_conditions: string[];
  p_other_conditions: string | null;
  p_phone: string;
};

const SEX_TO_DB = {
  female: 'Female',
  male: 'Male',
  'prefer not to say': 'Prefer not to say',
} as const;

const invalid = (field: string, message: string): Result<never> =>
  fail({ code: 'VALIDATION', message, field });

export function toProfileArgs(
  answers: OnboardingAnswers,
  options: { currentYear?: number } = {},
): Result<CreateProfileArgs> {
  const currentYear = options.currentYear ?? new Date().getFullYear();

  const name = answers.name.trim();
  if (name === '') return invalid('name', 'Please enter your name.');
  if (name.length > NAME_MAX) {
    return invalid('name', `Your name must be ${NAME_MAX} characters or fewer.`);
  }

  if (answers.userType === null) {
    return invalid('userType', 'Please choose whether you are a patient or a support person.');
  }

  const phone = toE164(answers.phoneNumber);
  if (!phone.ok) return invalid('phoneNumber', 'Please enter a valid Australian mobile number.');

  const base = { p_name: name, p_phone: phone.data };

  if (answers.userType === 'support-person') {
    return ok({
      ...base,
      p_user_type: 'support_person',
      p_sex: null,
      p_year_of_birth: null,
      p_conditions: [],
      p_other_conditions: null,
    });
  }

  if (answers.sex === null) return invalid('sex', 'Please choose an option for sex.');

  const year = answers.yearOfBirth;
  const yearError = validateYearOfBirth(year, currentYear);
  if (yearError) return invalid('yearOfBirth', yearError);

  // Conditions only count when the user said they have a diagnosis.
  const conditions =
    answers.hasDiagnosis === false
      ? []
      : [...new Set(answers.conditions.map((c) => c.trim()).filter((c) => c !== ''))];
  if (conditions.some((c) => c.length > CONDITION_MAX)) {
    return invalid('conditions', `Each condition must be ${CONDITION_MAX} characters or fewer.`);
  }

  const otherConditions = answers.otherConditions.trim();
  return ok({
    ...base,
    p_user_type: 'patient',
    p_sex: SEX_TO_DB[answers.sex],
    p_year_of_birth: year,
    p_conditions: conditions,
    p_other_conditions: otherConditions === '' ? null : otherConditions,
  });
}
