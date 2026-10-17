// Turns an Australian mobile number typed by the user into the E.164 form Supabase Auth needs.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { fail, ok, type Result } from '@/lib/result';

// +61 then a mobile number: 4 followed by eight digits
const E164_AU_MOBILE = /^\+614\d{8}$/;

/**
 * Accepts `04xxxxxxxx`, `04xx xxx xxx`, `+614xxxxxxxx`, `614xxxxxxxx` and `+61 4xx xxx xxx`
 * (spaces, dashes and brackets are ignored) and returns `+614xxxxxxxx`.
 */
export function toE164(input: string): Result<string> {
  const stripped = input.replace(/[\s\-()]/g, '');

  let national: string | null = null;
  if (/^04\d{8}$/.test(stripped)) national = stripped.slice(1);
  else if (/^\+?614\d{8}$/.test(stripped)) national = stripped.replace(/^\+?61/, '');

  if (national === null) {
    return fail({ code: 'INVALID_PHONE', message: 'Not a valid Australian mobile number' });
  }
  return ok(`+61${national}`);
}

export function isValidAuMobile(input: string): boolean {
  return toE164(input).ok;
}

/** `+614xxxxxxxx` to `04xx xxx xxx`. Anything that is not an AU mobile in E.164 is returned unchanged. */
export function formatForDisplay(e164: string): string {
  if (!E164_AU_MOBILE.test(e164)) return e164;
  const local = `0${e164.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}
