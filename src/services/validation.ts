/**
 * Front-end checks for contact details. Each returns an error message to show the user,
 * or '' when the value is fine. They catch typos only; Supabase does the real validation.
 */

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

// Keep these in line with Supabase (Auth → Providers → Email → Password requirements),
// otherwise the server will reject passwords that pass here (or the reverse).
export const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_RULES: { test: (password: string) => boolean; description: string }[] = [
  { test: password => /[a-z]/.test(password), description: 'a lowercase letter' },
  { test: password => /[A-Z]/.test(password), description: 'a capital letter' },
  { test: password => /\d/.test(password), description: 'a number' },
  { test: password => /[^A-Za-z\d\s]/.test(password), description: 'a symbol (e.g. ! @ # $)' },
];

/** Lists everything the password is missing in one message, so the user can fix it in one go. */
export function validatePassword(password: string): string {
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  const missing = PASSWORD_RULES.filter(rule => !rule.test(password)).map(rule => rule.description);
  if (missing.length === 0) return '';
  const list = missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(', ')} and ${missing.at(-1)}`;
  return `Password must include ${list}.`;
}
