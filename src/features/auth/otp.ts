// Helpers for the one-time code the user types on the verify screen.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

export const OTP_LENGTH = 6;

// Seconds before the user may ask for another code (decision L3, settled): 60 s resend. The
// code itself expires after 120 s, which is set in the Supabase dashboard, not in the app.
export const RESEND_SECONDS = 60;

/** Wording for a wait, e.g. "1 minute", "2 minutes" or "45 seconds". */
export function formatResendWait(seconds: number): string {
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
}

/** Keeps digits only and cuts the result to OTP_LENGTH. */
export function sanitiseCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export function isCodeComplete(code: string): boolean {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code);
}
