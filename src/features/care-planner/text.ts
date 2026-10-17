// Pure module: no imports from @/lib/supabase, react-native or expo-*.

/** Trims typed text, and returns null when nothing is left (optional fields are stored as null). */
export function toOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
