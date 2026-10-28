import { NO_MEDICATION_OPTION } from '@/constants/managementOptions';
import type { ManagementAssessmentAnswers } from '@/features/assessments/management/types';
import { validateManagementAnswers } from '@/features/assessments/management/validate';

const context = { entryDate: '2026-10-02', today: '2026-10-03', startWeek: '2026-09-28' };

const valid: ManagementAssessmentAnswers = {
  medications: [' Vitamin D3 1000 IU ', 'Vitamin D3 1000 IU', 'Amlodipine 5 mg', '  '],
  otcMedication: '  Panadol  ',
  exerciseDays: '3–4 days',
  emotionStrategies: '  Meditation  ',
};

const errorOf = (answers: ManagementAssessmentAnswers, ctx = context) => {
  const result = validateManagementAnswers(answers, ctx);
  return result.ok ? null : result.error;
};

describe('validateManagementAnswers: a complete, valid set', () => {
  it('returns the entry ready to save, with names trimmed and de-duplicated', () => {
    expect(validateManagementAnswers(valid, context)).toEqual({
      ok: true,
      data: {
        date: '2026-10-02',
        exercise: '3–4 days',
        emotion: 'Meditation',
        otcMedication: 'Panadol',
        noMedication: false,
        medications: ['Vitamin D3 1000 IU', 'Amlodipine 5 mg'],
      },
    });
  });

  it.each([[undefined], [''], ['   ']])('turns a blank OTC and emotion answer of %j into null', (value) => {
    expect(
      validateManagementAnswers({ ...valid, otcMedication: value, emotionStrategies: value }, context),
    ).toMatchObject({ ok: true, data: { otcMedication: null, emotion: null } });
  });

  it('lets the medication question be skipped', () => {
    expect(validateManagementAnswers({ exerciseDays: '0 days' }, context)).toMatchObject({
      ok: true,
      data: { medications: [], noMedication: false },
    });
  });

  it('accepts "I didn\'t take any medication" on its own', () => {
    expect(validateManagementAnswers({ ...valid, medications: [], noMedication: true }, context)).toMatchObject({
      ok: true,
      data: { medications: [], noMedication: true },
    });
  });

  it('never returns the "no medication" row as a medication name', () => {
    const result = validateManagementAnswers({ ...valid, medications: [NO_MEDICATION_OPTION] }, context);
    expect(result).toMatchObject({ ok: true, data: { medications: [] } });
  });

  it('accepts a 100-character medication name', () => {
    expect(validateManagementAnswers({ ...valid, medications: ['a'.repeat(100)] }, context).ok).toBe(true);
  });

  it('accepts today and the start week Monday as the entry date', () => {
    expect(validateManagementAnswers(valid, { ...context, entryDate: '2026-10-03' }).ok).toBe(true);
    expect(validateManagementAnswers(valid, { ...context, entryDate: '2026-09-28' }).ok).toBe(true);
  });

  it('skips the start week check when no start week is given', () => {
    const { startWeek: _unused, ...noStart } = context;
    expect(validateManagementAnswers(valid, { ...noStart, entryDate: '2020-01-01' }).ok).toBe(true);
  });
});

describe('validateManagementAnswers: exercise', () => {
  it.each([[undefined], [''], ['   ']])('rejects a missing exercise answer (%j)', (exerciseDays) => {
    expect(errorOf({ ...valid, exerciseDays })).toMatchObject({
      code: 'VALIDATION',
      detail: 'MISSING',
      field: 'exerciseDays',
    });
  });

  it.each([['3-4 days'], ['10 days']])('rejects %j, which is not in the list', (exerciseDays) => {
    expect(errorOf({ ...valid, exerciseDays })).toMatchObject({
      code: 'VALIDATION',
      detail: 'UNKNOWN_OPTION',
      field: 'exerciseDays',
    });
  });
});

describe('validateManagementAnswers: medications', () => {
  it('rejects "I didn\'t take any medication" together with a medication', () => {
    expect(errorOf({ ...valid, noMedication: true })).toMatchObject({
      code: 'VALIDATION',
      detail: 'MEDICATION_CONFLICT',
      field: 'medications',
    });
  });

  it('rejects a 101-character medication name', () => {
    expect(errorOf({ ...valid, medications: ['a'.repeat(101)] })).toMatchObject({
      code: 'VALIDATION',
      detail: 'VALUE_TOO_LONG',
      field: 'medications',
    });
  });
});

describe('validateManagementAnswers: entry date', () => {
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
