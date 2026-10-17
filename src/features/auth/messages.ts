// Turns an AppErrorCode from signing in into text the user can act on.
// Never says whether an account exists for the number.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { AppErrorCode } from '@/lib/errors';

export function authErrorMessage(code: AppErrorCode): string {
  switch (code) {
    case 'INVALID_PHONE':
      return 'Enter a valid Australian mobile number, for example 0412 345 678.';
    case 'INVALID_OTP':
      return "That code isn't right. Check it and try again.";
    case 'OTP_EXPIRED':
      // Supabase uses the same error for a wrong code and an expired one, so say both.
      return 'That code is wrong or has expired. Check it, or ask for a new code.';
    case 'RATE_LIMITED':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'SMS_FAILED':
      return "We couldn't send the code. Check your number and try again.";
    case 'NETWORK':
      return 'We could not reach the server. Check your connection and try again.';
    case 'PROFILE_EXISTS':
    case 'VALIDATION':
      return 'We could not finish setting up your profile. Please check your answers and try again.';
    case 'NO_SESSION':
    case 'NOT_ALLOWED':
      return 'Please sign in again and try once more.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
