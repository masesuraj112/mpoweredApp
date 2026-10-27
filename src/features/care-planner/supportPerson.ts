// Pure helpers for the support person form.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { formatForDisplay, isValidAuMobile, toE164 } from '@/features/auth/phone';
import { validateEmail } from '@/services/validation';

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

/** The most support people one appointment can have (the database enforces the same limit). */
export const MAX_SUPPORT_PEOPLE = 2;
export const SUPPORT_PEOPLE_LIMIT_MESSAGE =
  'You can add up to two support people to an appointment. Remove one to add someone else.';

export const NAME_REQUIRED_MESSAGE = 'Please enter a name.';
export const MOBILE_REQUIRED_MESSAGE = 'Please enter an Australian mobile number, e.g. 0400 000 000.';

/** True while another support person can still be added to an appointment with `count` people. */
export function canAddAnotherPerson(count: number): boolean {
  return count < MAX_SUPPORT_PEOPLE;
}

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
 * but whichever is filled in must be valid. The phone must be an Australian mobile, because only
 * mobiles can sign in by SMS (the support person's login is matched to this number later).
 */
export function validateSupportPerson(draft: SupportPersonDraft): SupportPersonErrors {
  const errors: SupportPersonErrors = {};
  if (draft.name.trim() === '') errors.name = NAME_REQUIRED_MESSAGE;
  if (draft.phone.trim() !== '' && !isValidAuMobile(draft.phone)) {
    errors.phone = MOBILE_REQUIRED_MESSAGE;
  }
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

/** A valid draft as a saved person: trimmed, phone in E.164 (+614...), empty becomes null. */
export function toSupportPerson(draft: SupportPersonDraft): SupportPerson {
  const phone = toOptionalText(draft.phone);
  const e164 = phone === null ? null : toE164(phone);
  return {
    name: draft.name.trim(),
    phone: e164 !== null && e164.ok ? e164.data : null,
    email: toOptionalText(draft.email),
    canAddQuestions: draft.canAddQuestions,
    canAddAnswers: draft.canAddAnswers,
  };
}

/** One line of contact details for a list row, e.g. "0400 000 000 · name@example.com". */
export function describeContact(person: SupportPerson): string {
  const phone = person.phone === null ? null : formatForDisplay(person.phone);
  return [phone, person.email].filter(Boolean).join(' · ');
}

/** What access this person has, in words. */
export function describeAccess(person: SupportPerson): string {
  const access: string[] = [];
  if (person.canAddQuestions) access.push('Add questions');
  if (person.canAddAnswers) access.push('Add doctor’s answer');
  return access.length > 0 ? access.join(', ') : 'No access chosen';
}
