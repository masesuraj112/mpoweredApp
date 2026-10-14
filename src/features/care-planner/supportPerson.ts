// Pure helpers for the support person form.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { normalisePhone, validateEmail, validatePhone } from '@/services/validation';

import { toOptionalText } from './text';
import type { SupportPerson } from './types';

/** What is typed into the form. Strings, never null, so inputs stay controlled. */
export type SupportPersonDraft = {
  name: string;
  phone: string;
  email: string;
  canAddQuestions: boolean;
  canAddAnswers: boolean;
};

export type SupportPersonErrors = {
  name?: string;
  phone?: string;
  email?: string;
};

export const EMPTY_SUPPORT_PERSON_DRAFT: SupportPersonDraft = {
  name: '',
  phone: '',
  email: '',
  canAddQuestions: false,
  canAddAnswers: false,
};

export const NAME_REQUIRED_MESSAGE = 'Please enter a name.';

/** True when nothing has been typed or ticked (whitespace does not count). */
export function isDraftEmpty(draft: SupportPersonDraft): boolean {
  return (
    draft.name.trim() === '' &&
    draft.phone.trim() === '' &&
    draft.email.trim() === '' &&
    !draft.canAddQuestions &&
    !draft.canAddAnswers
  );
}

/**
 * Checks a draft that has something in it. The name is required; phone and email are optional,
 * but whichever is filled in must be valid (same rules as the settings support persons screen).
 */
export function validateSupportPerson(draft: SupportPersonDraft): SupportPersonErrors {
  const errors: SupportPersonErrors = {};
  if (draft.name.trim() === '') errors.name = NAME_REQUIRED_MESSAGE;
  const phoneError = validatePhone(draft.phone, { required: false });
  if (phoneError) errors.phone = phoneError;
  const emailError = validateEmail(draft.email, { required: false });
  if (emailError) errors.email = emailError;
  return errors;
}

export function hasErrors(errors: SupportPersonErrors): boolean {
  return Boolean(errors.name || errors.phone || errors.email);
}

/** Validates a single field (used when the person leaves it). */
export function validateField(
  field: keyof SupportPersonErrors,
  draft: SupportPersonDraft,
): string | undefined {
  // The name is only checked once something else has been entered, so an untouched form is quiet.
  if (field === 'name') {
    return draft.name.trim() === '' && !isDraftEmpty(draft) ? NAME_REQUIRED_MESSAGE : undefined;
  }
  return validateSupportPerson(draft)[field];
}

/** A valid draft as a saved person: trimmed, phone separators removed, empty becomes null. */
export function toSupportPerson(draft: SupportPersonDraft): SupportPerson {
  const phone = toOptionalText(draft.phone);
  return {
    name: draft.name.trim(),
    phone: phone === null ? null : normalisePhone(phone),
    email: toOptionalText(draft.email),
    canAddQuestions: draft.canAddQuestions,
    canAddAnswers: draft.canAddAnswers,
  };
}

/** One line of contact details for a list row, e.g. "0400000000 · name@example.com". */
export function describeContact(person: SupportPerson): string {
  return [person.phone, person.email].filter(Boolean).join(' · ');
}

/** What access this person has, in words. */
export function describeAccess(person: SupportPerson): string {
  const access: string[] = [];
  if (person.canAddQuestions) access.push('Add questions');
  if (person.canAddAnswers) access.push('Add doctor’s answer');
  return access.length > 0 ? access.join(', ') : 'No access chosen';
}
