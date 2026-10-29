import { accessTypeFromDb, accessTypeToDb } from './accessType';

describe('accessTypeToDb', () => {
  it.each([
    [{ canAddQuestions: false, canAddAnswers: false }, 'none'],
    [{ canAddQuestions: true, canAddAnswers: false }, 'questions'],
    [{ canAddQuestions: false, canAddAnswers: true }, 'answers'],
    [{ canAddQuestions: true, canAddAnswers: true }, 'questions,answers'],
  ])('%j becomes %s', (flags, expected) => {
    expect(accessTypeToDb(flags)).toBe(expected);
  });
});

describe('accessTypeFromDb', () => {
  it.each([
    ['none', { canAddQuestions: false, canAddAnswers: false }],
    ['questions', { canAddQuestions: true, canAddAnswers: false }],
    ['answers', { canAddQuestions: false, canAddAnswers: true }],
    ['questions,answers', { canAddQuestions: true, canAddAnswers: true }],
  ])('%s gives %j', (value, flags) => {
    expect(accessTypeFromDb(value)).toEqual(flags);
  });

  it.each(['everything', 'answers,questions', 'Questions', '', null, undefined])(
    'unknown value %p gives no access',
    (value) => {
      expect(accessTypeFromDb(value)).toEqual({ canAddQuestions: false, canAddAnswers: false });
    },
  );

  it('round-trips every stored value', () => {
    for (const value of ['none', 'questions', 'answers', 'questions,answers'] as const) {
      expect(accessTypeToDb(accessTypeFromDb(value))).toBe(value);
    }
  });
});
