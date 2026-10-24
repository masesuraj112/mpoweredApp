// Helpers for the one-time code the user types on the verify screen.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

export const OTP_LENGTH = 6;

// Seconds before the user may ask for another code. Placeholder: the real value (and the
// code's expiry, 60 s on the dev project) is decision L3, to be settled in the Twilio sprint.
export const RESEND_SECONDS = 120;

/** Keeps digits only and cuts the result to OTP_LENGTH. */
export function sanitiseCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export function isCodeComplete(code: string): boolean {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code);
}
