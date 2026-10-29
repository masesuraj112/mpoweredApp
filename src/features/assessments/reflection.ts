// The reflection is optional free text. The spec caps it at 200 words.
// Shared by every assessment so they all count words the same way.

export const MAX_REFLECTION_WORDS = 200;

/** Words are runs of non-whitespace, so extra spaces and line breaks don't inflate the count. */
export function countWords(text: string | null | undefined): number {
  const trimmed = (text ?? '').trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

export function isReflectionTooLong(text: string | null | undefined): boolean {
  return countWords(text) > MAX_REFLECTION_WORDS;
}