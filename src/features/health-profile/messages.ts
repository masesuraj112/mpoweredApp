// Turns an AppError from loading My Health data into text the user can act on.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { AppError } from '@/lib/errors';

export function healthLoadMessage(error: AppError): string {
  switch (error.code) {
    case 'NO_PROFILE':
      return 'We could not find your profile. Please finish setting up your account.';
    case 'NOT_FOUND':
      return 'We could not find this record. It may have been deleted.';
    case 'NO_SESSION':
    case 'NOT_ALLOWED':
      return 'Please sign in again and try once more.';
    case 'NETWORK':
      return 'We could not reach the server. Check your connection and try again.';
    default:
      return 'Something went wrong while loading your health records. Please try again.';
  }
}
