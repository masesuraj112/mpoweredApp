import { validateSocialHealthAnswers } from '@/features/assessments/social-health/validate';
import type { SocialHealthAssessmentAnswers } from '@/features/assessments/social-health/types';

const context = { entryDate: '2026-10-02', today: '2026-10-03', startWeek: '2026-09-28' };

const valid: SocialHealthAssessmentAnswers = {
  socialLife: 'My social life is normal and gives me no extra pain',
  travel: 'I can travel anywhere without pain',
  moodNumber: 3,
  relationWithOthers: 4,
  enjoymentOfLife: 5,
  moodEmotion: 'calm',
  emotionReflection: '  Work was busy  ',
};

const errorOf = (answers: SocialHealthAssessmentAnswers, ctx = context) => {
  const result = validateSocialHealthAnswers(answers, ctx);
  return result.ok ? null : result.error;
};

describe('validateSocialHealthAnswers: a complete, valid set', () => {
  it('returns the entry ready to save, with the mood mapped and the reflection trimmed', () => {
    expect(validateSocialHealthAnswers(valid, context)).toEqual({
      ok: true,
      data: {
        date: '2026-10-02',
        socialLife: 'My social life is normal and gives me no extra pain',
        travelling: 'I can travel anywhere without pain',
        mood: 3,
        relationWithOthers: 4,
        enjoymentOfLife: 5,
        moodOverall: 'I was feeling calm',
        reflection: 'Work was busy',
      },
    });
  });

  it.each([[undefined], [''], ['   ']])('turns a reflection of %j into null', (emotionReflection) => {
    expect(validateSocialHealthAnswers({ ...valid, emotionReflection }, context)).toMatchObject({
      ok: true,
      data: { reflection: null },
    });
  });

  it('accepts 0 and 10 for every slider', () => {
    const allZero = { ...valid, moodNumber: 0, relationWithOthers: 0, enjoymentOfLife: 0 };
    expect(validateSocialHealthAnswers(allZero, context).ok).toBe(true);
    const allTen = { ...valid, moodNumber: 10, relationWithOthers: 10, enjoymentOfLife: 10 };
    expect(validateSocialHealthAnswers(allTen, context).ok).toBe(true);
  });

  it('accepts today and the start week Monday as the entry date', () => {
    expect(validateSocialHealthAnswers(valid, { ...context, entryDate: '2026-10-03' }).ok).toBe(true);
    expect(validateSocialHealthAnswers(valid, { ...context, entryDate: '2026-09-28' }).ok).toBe(true);
  });

  it('skips the start week check when no start week is given', () => {
    const { startWeek: _unused, ...noStart } = context;
    expect(validateSocialHealthAnswers(valid, { ...noStart, entryDate: '2020-01-01' }).ok).toBe(true);
  });
});

describe('validateSocialHealthAnswers: missing answers', () => {
  it.each([
    ['socialLife'],
    ['travel'],
    ['moodNumber'],
    ['relationWithOthers'],
    ['enjoymentOfLife'],
    ['moodEmotion'],
  ] as const)('rejects a missing %s', (field) => {
    expect(errorOf({ ...valid, [field]: undefined })).toMatchObject({
      code: 'VALIDATION',
      detail: 'MISSING',
      field,
    });
  });

  it('rejects a blank statement', () => {
    expect(errorOf({ ...valid, socialLife: '   ' })).toMatchObject({ detail: 'MISSING', field: 'socialLife' });
  });
});

describe('validateSocialHealthAnswers: unknown options', () => {
  it('rejects a social life statement that is not in the list', () => {
    expect(errorOf({ ...valid, socialLife: 'My social life is fine' })).toMatchObject({
      code: 'VALIDATION',
      detail: 'UNKNOWN_OPTION',
      field: 'socialLife',
    });
  });

  it('rejects a travelling statement that is not in the list', () => {
    expect(errorOf({ ...valid, travel: 'I can travel anywhere without pain ' })).toMatchObject({
      detail: 'UNKNOWN_OPTION',
      field: 'travel',
    });
  });

  it('does not accept a statement from the other list', () => {
    expect(errorOf({ ...valid, travel: valid.socialLife })).toMatchObject({ field: 'travel' });
  });

  it('rejects an unknown mood word', () => {
    expect(errorOf({ ...valid, moodEmotion: 'angry' })).toMatchObject({
      code: 'VALIDATION',
      detail: 'UNKNOWN_OPTION',
      field: 'moodEmotion',
    });
  });
});

describe('validateSocialHealthAnswers: slider values', () => {
  it.each([
    [3.5, 'NOT_INTEGER'],
    [NaN, 'NOT_INTEGER'],
    [-1, 'OUT_OF_RANGE'],
    [11, 'OUT_OF_RANGE'],
  ])('rejects %p with %s', (value, detail) => {
    for (const field of ['moodNumber', 'relationWithOthers', 'enjoymentOfLife'] as const) {
      expect(errorOf({ ...valid, [field]: value })).toMatchObject({ code: 'VALIDATION', detail, field });
    }
  });
});

describe('validateSocialHealthAnswers: entry date', () => {
  it('rejects a future date', () => {
    expect(errorOf(valid, { ...context, entryDate: '2026-10-04' })).toMatchObject({
      code: 'FUTURE_DATE',
      field: 'entryDate',
    });
  });

  it('rejects a date before the start week', () => {
    expect(errorOf(valid, { ...context, entryDate: '2026-09-27' })).toMatchObject({
      code: 'BEFORE_START',
      field: 'entryDate',
    });
  });

  it.each([['2026-02-30'], ['02/10/2026'], ['']])('rejects the invalid date %j', (entryDate) => {
    expect(errorOf(valid, { ...context, entryDate })).toMatchObject({
      code: 'VALIDATION',
      detail: 'INVALID_DATE',
      field: 'entryDate',
    });
  });
});
