// Pure helpers for the support person form.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { formatForDisplay, isValidAuMobile, toE164 } from '@/features/auth/phone';
import { validateEmail } from '@/services/validation';

import { toOptionalText } from './text';
import type { SupportPerson, SupportPersonStatus } from './types';

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

/** Shown when a typed number already belongs to a saved support person. */
export const duplicateNumberMessage = (name: string) =>
  `This mobile number is already saved for ${name}.`;

/** The saved person with this mobile number, if any. `ignoreId` skips the person being edited. */
export function findPersonWithPhone(
  people: readonly SupportPerson[],
  phoneInput: string,
  ignoreId?: number,
): SupportPerson | undefined {
  const entered = toE164(phoneInput);
  if (!entered.ok) return undefined;
  return people.find(
    (person) =>
      person.phone === entered.data &&
      (ignoreId === undefined || person.supportPersonId !== ignoreId),
  );
}

/**
 * Checks a draft that has something in it. The name is required; phone and email are optional,
 * but whichever is filled in must be valid. `knownPeople` are the patient's saved support people:
 * a number that is already one of theirs is reported instead of silently renaming that person. The phone must be an Australian mobile, because only
 * mobiles can sign in by SMS (the support person's login is matched to this number later).
 */
export function validateSupportPerson(
  draft: SupportPersonDraft,
  knownPeople: readonly SupportPerson[] = [],
  ignoreSupportPersonId?: number,
): SupportPersonErrors {
  const errors: SupportPersonErrors = {};
  if (draft.name.trim() === '') errors.name = NAME_REQUIRED_MESSAGE;
  if (draft.phone.trim() !== '' && !isValidAuMobile(draft.phone)) {
    errors.phone = MOBILE_REQUIRED_MESSAGE;
  } else {
    // Saving a number that is already saved would rename that person, so ask first.
    const existing = findPersonWithPhone(knownPeople, draft.phone, ignoreSupportPersonId);
    if (existing) errors.phone = duplicateNumberMessage(existing.name);
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

/**
 * The patient's saved support people who are not yet on this appointment, so they can be added
 * without typing them again. Only people already stored (with an id) can be offered.
 */
export function availableSupportPeople(
  saved: readonly SupportPerson[],
  chosen: readonly SupportPerson[],
): SupportPerson[] {
  const chosenIds = new Set(
    chosen.flatMap((person) => (person.supportPersonId === undefined ? [] : [person.supportPersonId])),
  );
  return saved.filter(
    (person) => person.supportPersonId !== undefined && !chosenIds.has(person.supportPersonId),
  );
}

/**
 * How the patient's Support persons list describes an invitation. Null before the database has
 * invitation status, so the row looks as it did.
 */
export function invitationStatusLabel(status: SupportPersonStatus | undefined): string | null {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'declined':
      return 'Declined';
    default:
      return null;
  }
}
