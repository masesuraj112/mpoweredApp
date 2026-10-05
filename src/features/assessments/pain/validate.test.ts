import { validatePainAnswers } from '@/features/assessments/pain/validate';
import type { PainAssessmentAnswers } from '@/features/assessments/pain/types';

const context = { entryDate: '2026-10-02', today: '2026-10-03', startWeek: '2026-09-28' };

const valid: PainAssessmentAnswers = {
  painLocations: ['Head'],
  characteristics: ['Sharp'],
  currentPain: 4,
  mildestPain: 2,
  worstPain: 8,
  averagePain: 5,
};

const errorOf = (answers: PainAssessmentAnswers, ctx = context) => {
  const result = validatePainAnswers(answers, ctx);
  return result.ok ? null : result.error;
};

describe('validatePainAnswers: a complete, valid set', () => {
  it('returns the entry ready to save', () => {
    expect(validatePainAnswers(valid, context)).toEqual({
      ok: true,
      data: {
        date: '2026-10-02',
        current: 4,
        mildest: 2,
        worst: 8,
        average: 5,
        locations: ['Head'],
        characteristics: ['Sharp'],
      },
    });
  });

  it('normalises and de-duplicates locations and characteristics', () => {
    const result = validatePainAnswers(
      {
        ...valid,
        painLocations: ['lower back', 'Lower  Back', 'outer thigh'],
        characteristics: ['Sharp', 'Sharp', 'Burning'],
      },
      context,
    );
    expect(result).toMatchObject({
      ok: true,
      data: { locations: ['Lower Back', 'Outer Thigh'], characteristics: ['Sharp', 'Burning'] },
    });
  });

  it('accepts 0 as a real answer, and the boundaries 0 and 10', () => {
    const allZero = { ...valid, currentPain: 0, mildestPain: 0, worstPain: 0, averagePain: 0 };
    expect(validatePainAnswers(allZero, context).ok).toBe(true);
    const allTen = { ...valid, currentPain: 10, mildestPain: 10, worstPain: 10, averagePain: 10 };
    expect(validatePainAnswers(allTen, context).ok).toBe(true);
  });

  it('accepts today and the start week Monday as the entry date', () => {
    expect(validatePainAnswers(valid, { ...context, entryDate: '2026-10-03' }).ok).toBe(true);
    expect(validatePainAnswers(valid, { ...context, entryDate: '2026-09-28' }).ok).toBe(true);
  });
});

describe('validatePainAnswers: pain levels', () => {
  it.each(['currentPain', 'mildestPain', 'worstPain', 'averagePain'] as const)(
    'a missing %s is rejected (an untouched slider never writes an answer)',
    (field) => {
      expect(errorOf({ ...valid, [field]: undefined })).toMatchObject({
        code: 'VALIDATION',
        field,
        detail: 'MISSING',
      });
    },
  );

  it('rejects a decimal typed into the slider box', () => {
    expect(errorOf({ ...valid, currentPain: 3.5 })).toMatchObject({
      code: 'VALIDATION',
      field: 'currentPain',
      detail: 'NOT_INTEGER',
    });
  });

  it.each([-1, 11, Number.NaN])('rejects %s', (value) => {
    expect(errorOf({ ...valid, worstPain: value })?.code).toBe('VALIDATION');
  });

  it('rejects mildest above current', () => {
    expect(errorOf({ ...valid, currentPain: 4, mildestPain: 5 })).toMatchObject({
      field: 'mildestPain',
      detail: 'ORDERING',
    });
  });

  it('rejects worst below current', () => {
    expect(errorOf({ ...valid, currentPain: 6, worstPain: 5, averagePain: 5 })).toMatchObject({
      field: 'worstPain',
      detail: 'ORDERING',
    });
  });

  it('rejects an average outside mildest and worst', () => {
    expect(errorOf({ ...valid, averagePain: 9 })).toMatchObject({
      field: 'averagePain',
      detail: 'ORDERING',
    });
    expect(errorOf({ ...valid, averagePain: 1 })).toMatchObject({
      field: 'averagePain',
      detail: 'ORDERING',
    });
  });
});

describe('validatePainAnswers: entry date', () => {
  it('rejects a date after today', () => {
    expect(errorOf(valid, { ...context, entryDate: '2026-10-04' })?.code).toBe('FUTURE_DATE');
  });

  it('rejects a date before the start week', () => {
    expect(errorOf(valid, { ...context, entryDate: '2026-09-27' })?.code).toBe('BEFORE_START');
  });

  it('skips the start-week check when no start week is given (the database enforces it)', () => {
    const { startWeek: _startWeek, ...withoutStart } = context;
    expect(validatePainAnswers(valid, { ...withoutStart, entryDate: '2020-01-01' }).ok).toBe(true);
  });

  it.each(['', 'yesterday', '2026-02-30', '03/10/2026'])('rejects %j as not a date', (entryDate) => {
    expect(errorOf(valid, { ...context, entryDate })).toMatchObject({
      code: 'VALIDATION',
      detail: 'INVALID_DATE',
    });
  });
});

describe('validatePainAnswers: locations and characteristics', () => {
  it.each([undefined, [], ['  ']])('rejects locations %j', (painLocations) => {
    expect(errorOf({ ...valid, painLocations })?.code).toBe('VALIDATION');
  });

  it('reports an empty location list as NO_LOCATION', () => {
    expect(errorOf({ ...valid, painLocations: [] })).toMatchObject({ detail: 'NO_LOCATION' });
  });

  it('rejects the literal Other and over-long locations', () => {
    expect(errorOf({ ...valid, painLocations: ['other'] })).toMatchObject({ detail: 'RESERVED' });
    expect(errorOf({ ...valid, painLocations: ['a'.repeat(46)] })).toMatchObject({
      detail: 'VALUE_TOO_LONG',
    });
  });

  it.each([undefined, []])('rejects characteristics %j', (characteristics) => {
    expect(errorOf({ ...valid, characteristics })).toMatchObject({ detail: 'NO_CHARACTERISTIC' });
  });

  it('rejects a characteristic that is not one of the seven options', () => {
    expect(errorOf({ ...valid, characteristics: ['Sharp', 'Throbbing'] })).toMatchObject({
      code: 'VALIDATION',
      detail: 'UNKNOWN_CHARACTERISTIC',
    });
  });

  it('matches a recent custom location when it is passed as known', () => {
    const result = validatePainAnswers(
      { ...valid, painLocations: ['inner thigh'] },
      { ...context, knownLocations: ['Head', 'Inner Thigh'] },
    );
    expect(result).toMatchObject({ ok: true, data: { locations: ['Inner Thigh'] } });
  });
});
