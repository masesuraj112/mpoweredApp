// Turns an AppError from the Care Planner into text the user can act on. Raw database text and
// message codes are never shown.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { AppError } from '@/lib/errors';

export const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

// VALIDATION errors, keyed by the message code (`detail` for a database error, `message` for one
// the app raised itself).
const VALIDATION_MESSAGES: Record<string, string> = {
  NO_QUESTIONS: 'Keep at least one question on your plan.',
  TOO_MANY_SUPPORT_PEOPLE: 'You can add up to two support people to an appointment.',
  DUPLICATE_SUPPORT_PERSON: 'You already have a support person with that mobile number.',
  INVALID_SUPPORT_PERSON: 'Please check the support person’s details and try again.',
  INVALID_ACCESS_TYPE: 'Please check what this support person can do and try again.',
  NO_DATE_TIME: 'Please choose a date and time for your appointment.',
  INVALID_DATE_TIME: 'Please choose a date and time for your appointment.',
  VALUE_TOO_LONG: 'One of your entries is too long. Please shorten it and try again.',
  NAME_TOO_LONG: 'The doctor’s name is too long. Please shorten it and try again.',
  INVALID_SIGNATURE: 'We could not read the signature. Please sign again.',
  APPOINTMENT_NOT_SAVED: 'Please save your appointment plan first.',
  INVALID_ANSWER: 'We could not save that answer. Please check it and try again.',
  QUESTION_NOT_ON_PLAN: 'That question is no longer on your plan. Please go back and check your plan.',
  UNKNOWN_QUESTION: 'That question is no longer available. Please go back and try again.',
  INVALID_QUESTION: 'We could not prepare your questions. Please try again.',
};

const VALIDATION_FALLBACK = 'Some details are not valid. Please check them and try again.';

export function carePlannerMessage(error: AppError): string {
  switch (error.code) {
    case 'CONSENT_REQUIRED':
      return 'The doctor needs to give consent to be recorded before you can save their answers.';
    case 'VALIDATION':
      return VALIDATION_MESSAGES[error.detail ?? error.message] ?? VALIDATION_FALLBACK;
    case 'INVALID_PHONE':
      return 'Please enter an Australian mobile number, e.g. 0400 000 000.';
    case 'NOT_FOUND':
      return 'We could not find that appointment. It may have been removed.';
    case 'NO_PROFILE':
      return 'We could not find your profile. Please finish setting up your account.';
    case 'NO_SESSION':
      return 'Please sign in again and try once more.';
    case 'NOT_ALLOWED':
      return 'You cannot do that with this account.';
    case 'FUTURE_DATE':
      return 'We could not prepare your questions. Please try again.';
    case 'NETWORK':
      return 'We could not reach the server. Check your connection and try again.';
    default:
      return FALLBACK_MESSAGE;
  }
}
