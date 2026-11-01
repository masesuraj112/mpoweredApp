import {
  GENERAL_ACTIVITY_OPTIONS,
  PERSONAL_CARE_OPTIONS,
  SLEEPING_OPTIONS,
} from '@/features/assessments/personal-care/options';
import type { PersonalCareAssessmentAnswers } from '@/features/assessments/personal-care/types';
import { validatePersonalCareAnswers } from '@/features/assessments/personal-care/validate';

const context = { entryDate: '2026-10-08', today: '2026-10-12' };

const complete: PersonalCareAssessmentAnswers = {
  generalActivities: [GENERAL_ACTIVITY_OPTIONS[0], GENERAL_ACTIVITY_OPTIONS[2]],
  personalCareLevel: PERSONAL_CARE_OPTIONS[1],
  sleepingLevel: SLEEPING_OPTIONS[3],
  reflection: 'A hard week',
};

describe('validatePersonalCareAnswers', () => {
  it('accepts a complete set of answers', () => {
    expect(validatePersonalCareAnswers(complete, context)).toEqual({
      ok: true,
      data: {
        date: '2026-10-08',
        generalActivities: [GENERAL_ACTIVITY_OPTIONS[0], GENERAL_ACTIVITY_OPTIONS[2]],
        washingDressing: PERSONAL_CARE_OPTIONS[1],
        sleeping: SLEEPING_OPTIONS[3],
        reflection: 'A hard week',
      },
    });
  });

  it('accepts the first answer of each question (the score of 0 is a real answer)', () => {
    const result = validatePersonalCareAnswers(
      {
        generalActivities: [GENERAL_ACTIVITY_OPTIONS[0]],
        personalCareLevel: PERSONAL_CARE_OPTIONS[0],
        sleepingLevel: SLEEPING_OPTIONS[0],
      },
      context,
    );
    expect(result.ok).toBe(true);
  });

  it('treats the reflection as optional: blank, spaces and missing all become null', () => {
    for (const reflection of [undefined, '', '   \n ']) {
      const result = validatePersonalCareAnswers({ ...complete, reflection }, context);
      expect(result).toMatchObject({ ok: true, data: { reflection: null } });
    }
  });

  it('trims the reflection', () => {
    expect(validatePersonalCareAnswers({ ...complete, reflection: '  tired  ' }, context)).toMatchObject({
      ok: true,
      data: { reflection: 'tired' },
    });
  });

  it('accepts a reflection of exactly 200 words', () => {
    const reflection = Array(200).fill('word').join(' ');
    expect(validatePersonalCareAnswers({ ...complete, reflection }, context).ok).toBe(true);
  });

  it('rejects a reflection of more than 200 words', () => {
    const reflection = Array(201).fill('word').join(' ');
    expect(validatePersonalCareAnswers({ ...complete, reflection }, context)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', field: 'reflection', detail: 'TOO_LONG' },
    });
  });

  it('drops repeated activities', () => {
    const result = validatePersonalCareAnswers(
      { ...complete, generalActivities: [GENERAL_ACTIVITY_OPTIONS[1], GENERAL_ACTIVITY_OPTIONS[1]] },
      context,
    );
    expect(result).toMatchObject({ ok: true, data: { generalActivities: [GENERAL_ACTIVITY_OPTIONS[1]] } });
  });

  it.each([
    ['generalActivities', { generalActivities: undefined }, 'NO_ACTIVITY'],
    ['generalActivities', { generalActivities: [] }, 'NO_ACTIVITY'],
    ['personalCareLevel', { personalCareLevel: undefined }, 'MISSING'],
    ['personalCareLevel', { personalCareLevel: '' }, 'MISSING'],
    ['sleepingLevel', { sleepingLevel: undefined }, 'MISSING'],
  ])('rejects a missing %s answer', (field, change, detail) => {
    expect(validatePersonalCareAnswers({ ...complete, ...change }, context)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', field, detail },
    });
  });

  it.each([
    ['generalActivities', { generalActivities: ['Something else'] }],
    ['personalCareLevel', { personalCareLevel: SLEEPING_OPTIONS[0] }],
    ['sleepingLevel', { sleepingLevel: 'Slept fine' }],
  ])('rejects text that is not one of the %s answers', (field, change) => {
    expect(validatePersonalCareAnswers({ ...complete, ...change }, context)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', field, detail: 'UNKNOWN_OPTION' },
    });
  });

  it('rejects a date in the future and a date before the start week', () => {
    expect(validatePersonalCareAnswers(complete, { ...context, entryDate: '2026-10-13' })).toMatchObject({
      ok: false,
      error: { code: 'FUTURE_DATE' },
    });
    expect(
      validatePersonalCareAnswers(complete, { ...context, entryDate: '2026-09-20', startWeek: '2026-09-28' }),
    ).toMatchObject({ ok: false, error: { code: 'BEFORE_START' } });
  });

  it('keeps every option short enough for the database column (100 characters)', () => {
    for (const option of GENERAL_ACTIVITY_OPTIONS) expect(option.length).toBeLessThanOrEqual(100);
  });
});