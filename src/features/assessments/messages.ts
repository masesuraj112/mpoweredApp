import type { AppError } from '@/lib/errors';

// `subject` finishes the sentence, for example 'personal care' or 'movement'.
export function assessmentSaveMessage(error: AppError, subject: string): string {
  switch (error.code) {
    case 'DUPLICATE_WEEK':
      return `You have already recorded your ${subject} for this week.`;
    case 'VALIDATION':
      // The app's own validation messages are written for the user; raw database ones are not.
      return error.field
        ? error.message
        : 'Some of your answers are not valid. Please go back and check them.';
    case 'FUTURE_DATE':
      return `You cannot record ${subject} for a day that has not happened yet.`;
    case 'BEFORE_START':
      return `You cannot record ${subject} for a week before you started using the app.`;
    case 'NO_PROFILE':
      return 'We could not find your profile. Please finish setting up your account.';
    case 'NO_SESSION':
    case 'NOT_ALLOWED':
      return 'Please sign in again and try once more.';
    case 'NETWORK':
      return 'We could not reach the server. Check your connection and try again.';
    default:
      return 'Something went wrong while saving. Please try again.';
  }
}