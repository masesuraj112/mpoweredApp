/**
 * Front-end checks for contact and profile details. Each returns an error message to show the
 * user, or '' when the value is fine. They catch typos only; Supabase does the real validation.
 */

/** The earliest year of birth accepted at sign-up and in Settings (create_profile uses the same). */
export const YEAR_OF_BIRTH_MIN = 1900;

// name@domain.tld: no spaces, one @, a dot-separated domain, and a TLD of at least two letters.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;

// Australian numbers, once spaces, dashes, dots and brackets are removed:
// mobile / landline as 0X XXXX XXXX (X = 2, 3, 4, 7 or 8), or the same in +61 form without the 0.
const PHONE_PATTERN = /^(0|\+61)[23478]\d{8}$/;

/** Strips the separators people commonly type in phone numbers. */
export function normalisePhone(value: string): string {
  return value.replace(/[\s\-().]/g, '');
}

export function validateEmail(value: string, { required = true } = {}): string {
  const email = value.trim();
  if (!email) return required ? 'Please enter an email address.' : '';
  if (/\s/.test(email)) return "Email addresses can't contain spaces.";
  if ((email.match(/@/g) ?? []).length !== 1) return 'Email addresses need exactly one @, e.g. name@example.com.';
  if (email.includes('..')) return "Email addresses can't contain two dots in a row.";
  if (!EMAIL_PATTERN.test(email)) return 'Please enter a valid email address, e.g. name@example.com.';
  return '';
}

export function validatePhone(value: string, { required = true } = {}): string {
  const phone = normalisePhone(value.trim());
  if (!phone) return required ? 'Please enter a phone number.' : '';
  if (!/^\+?\d+$/.test(phone)) return 'Phone numbers can only contain digits, spaces and a leading +.';
  if (!PHONE_PATTERN.test(phone)) return 'Please enter a valid Australian phone number, e.g. 0400 000 000.';
  return '';
}

/** Year of birth is optional: null is fine, otherwise a whole year from 1900 to this year. */
export function validateYearOfBirth(year: number | null, currentYear: number = new Date().getFullYear()): string {
  if (year === null) return '';
  if (!Number.isInteger(year) || year < YEAR_OF_BIRTH_MIN || year > currentYear) {
    return `Please enter a year between ${YEAR_OF_BIRTH_MIN} and ${currentYear}.`;
  }
  return '';
}
