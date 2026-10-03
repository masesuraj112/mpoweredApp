// Turns an AppError from saving a pain entry into text the user can act on.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { AppError } from '@/lib/errors';

export function painSaveMessage(error: AppError): string {
  switch (error.code) {
    case 'DUPLICATE_WEEK':
      return 'You have already recorded your pain for this week.';
    case 'VALIDATION':
      // The app's own validation messages are written for the user; raw database ones are not.
      return error.field
        ? error.message
        : 'Some of your answers are not valid. Please go back and check them.';
    case 'FUTURE_DATE':
      return 'You cannot record pain for a day that has not happened yet.';
    case 'BEFORE_START':
      return 'You cannot record pain for a week before you started using the app.';
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
