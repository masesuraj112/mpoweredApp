import { countWords, isReflectionTooLong, MAX_REFLECTION_WORDS } from './reflection';

describe('countWords', () => {
  it('is 0 for empty, blank or missing text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n ')).toBe(0);
    expect(countWords(undefined)).toBe(0);
  });
  it('ignores extra spaces and line breaks', () => {
    expect(countWords('  my   back\nhurts  ')).toBe(3);
  });
});

describe('isReflectionTooLong', () => {
  const words = (n: number) => Array(n).fill('word').join(' ');
  it('allows exactly the limit', () => {
    expect(isReflectionTooLong(words(MAX_REFLECTION_WORDS))).toBe(false);
  });
  it('rejects one word over', () => {
    expect(isReflectionTooLong(words(MAX_REFLECTION_WORDS + 1))).toBe(true);
  });
});