// Normalisation and suggestion helpers for pain locations and characteristics.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.
// Normalisation lives only here (D9); the database enforces invariants only.

import { MAX_PAIN_VALUE_LENGTH, OTHER_LOCATION_LABEL } from '@/constants/painLocations';
import { fail, ok, type Result } from '@/lib/result';

const LETTERS_AND_SPACES = /^[A-Za-z ]+$/;

function collapse(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

function titleCase(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function invalid(detail: string, message: string): Result<never> {
  return fail({ code: 'VALIDATION', message, detail, field: 'painLocations' });
}

/**
 * Trims, collapses repeated spaces and returns the canonical spelling when the text matches a
 * known location (case-insensitive), otherwise Title Case. Rejects empty text, text over 45
 * characters, anything other than letters and spaces, and the literal "Other".
 */
export function normaliseLocation(input: string, canonicalList: readonly string[]): Result<string> {
  const text = collapse(input);
  if (text === '') return invalid('EMPTY', 'Enter a location.');
  if (text.length > MAX_PAIN_VALUE_LENGTH) {
    return invalid('VALUE_TOO_LONG', `A location can be at most ${MAX_PAIN_VALUE_LENGTH} characters.`);
  }
  if (!LETTERS_AND_SPACES.test(text)) {
    return invalid('INVALID_CHARACTERS', 'A location can only contain letters and spaces.');
  }
  const lower = text.toLowerCase();
  if (lower === OTHER_LOCATION_LABEL.toLowerCase()) {
    return invalid('RESERVED', `"${OTHER_LOCATION_LABEL}" is not a location. Enter the actual place.`);
  }
  const canonical = canonicalList.find((item) => item.toLowerCase() === lower);
  return ok(canonical ?? titleCase(text));
}

/** Drops repeated values (case-insensitive), keeping the first spelling and the order. */
export function dedupe(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }
  return result;
}

/** Normalises every location, then drops duplicates. Stops at the first invalid one. */
export function normaliseLocations(
  inputs: readonly string[],
  canonicalList: readonly string[],
): Result<string[]> {
  const normalised: string[] = [];
  for (const input of inputs) {
    const result = normaliseLocation(input, canonicalList);
    if (!result.ok) return result;
    normalised.push(result.data);
  }
  return ok(dedupe(normalised));
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[b.length];
}

/**
 * Candidates the text might have meant, for the "Did you mean ...?" prompt: prefix matches and
 * near misses by edit distance. Returns [] when the text already matches a candidate exactly.
 */
export function suggestLocations(
  input: string,
  candidates: readonly string[],
  limit = 3,
): string[] {
  const text = collapse(input).toLowerCase();
  if (text.length < 2) return [];
  const maxDistance = text.length <= 4 ? 1 : 2;

  const usable = candidates.filter((c) => c.toLowerCase() !== OTHER_LOCATION_LABEL.toLowerCase());
  if (usable.some((c) => c.toLowerCase() === text)) return [];

  return usable
    .map((candidate) => {
      const lower = candidate.toLowerCase();
      return {
        candidate,
        isPrefix: lower.startsWith(text),
        distance: editDistance(text, lower),
      };
    })
    .filter((entry) => entry.isPrefix || entry.distance <= maxDistance)
    .sort(
      (a, b) =>
        Number(b.isPrefix) - Number(a.isPrefix) ||
        a.distance - b.distance ||
        a.candidate.localeCompare(b.candidate),
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/** Characteristics are tick-box only, so only the listed options are valid. */
export function isValidCharacteristic(value: string, canonicalList: readonly string[]): boolean {
  return canonicalList.includes(value);
}
