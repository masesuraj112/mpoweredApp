jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import type { ManagementAssessmentAnswers } from '@/features/assessments/management/types';
import {
  getCompletedManagementWeeks,
  getManagementEntryForWeek,
  saveManagementEntry,
} from '@/services/management';

// A fake query builder: every filter returns the builder, and awaiting it (or maybeSingle)
// gives the canned { data, error } result.
function query(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'gte', 'lte']) {
    builder[method] = jest.fn(() => builder);
  }
  builder.maybeSingle = jest.fn(() => Promise.resolve(result));
  builder.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder as Record<'select' | 'eq' | 'gte' | 'lte' | 'maybeSingle', jest.Mock>;
}

const fakeClient = (parts: Record<string, unknown>) => parts as never;

const options = { today: '2026-10-03' };
const answers: ManagementAssessmentAnswers = {
  medications: [' Vitamin D3 1000 IU ', 'Amlodipine 5 mg'],
  otcMedication: '  Panadol  ',
  exerciseDays: '3–4 days',
  emotionStrategies: '  Meditation  ',
};

const storedRow = {
  submission_id: 7,
  date: '2026-10-01',
  week_start: '2026-09-28',
  created_at: '2026-10-01T09:00:00+00:00',
  users_id: 1,
  exercise: '3–4 days',
  emotion: 'Meditation',
  otc_medication: 'Panadol',
  no_medication: false,
  // the database returns the names in no particular order
  personal_management_medication_names: [
    { medication_name: 'Vitamin D3 1000 IU' },
    { medication_name: 'Amlodipine 5 mg' },
  ],
};

describe('saveManagementEntry', () => {
  it('sends validated values to the database and returns the new submission id', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: 42, error: null });
    const result = await saveManagementEntry(answers, '2026-10-01', fakeClient({ rpc }), options);

    expect(result).toEqual({ ok: true, data: 42 });
    expect(rpc).toHaveBeenCalledWith('save_management_assessment', {
      p_date: '2026-10-01',
      p_exercise: '3–4 days',
      p_emotion: 'Meditation',
      p_otc_medication: 'Panadol',
      p_no_medication: false,
      p_medications: ['Vitamin D3 1000 IU', 'Amlodipine 5 mg'],
    });
  });

  it('sends "I didn\'t take any medication" and blank text as empty strings', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: 42, error: null });
    await saveManagementEntry(
      { exerciseDays: '0 days', noMedication: true, otcMedication: '  ', emotionStrategies: '' },
      '2026-10-01',
      fakeClient({ rpc }),
      options,
    );
    expect(rpc).toHaveBeenCalledWith('save_management_assessment', {
      p_date: '2026-10-01',
      p_exercise: '0 days',
      p_emotion: '',
      p_otc_medication: '',
      p_no_medication: true,
      p_medications: [],
    });
  });

  it('does not call the database when exercise is missing', async () => {
    const rpc = jest.fn();
    const result = await saveManagementEntry(
      { ...answers, exerciseDays: undefined },
      '2026-10-01',
      fakeClient({ rpc }),
      options,
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION', field: 'exerciseDays' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('does not call the database for a date in the future', async () => {
    const rpc = jest.fn();
    const result = await saveManagementEntry(answers, '2026-10-04', fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'FUTURE_DATE' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each([
    ['23505', 'duplicate key', 'DUPLICATE_WEEK'],
    ['42501', 'permission denied', 'NOT_ALLOWED'],
    ['P0001', 'NO_PROFILE', 'NO_PROFILE'],
    ['P0001', 'MEDICATION_CONFLICT', 'VALIDATION'],
    ['P0001', 'MISSING_ANSWER', 'VALIDATION'],
    ['23514', 'violates check constraint', 'VALIDATION'],
  ])('maps database error %s (%s) to %s', async (code, message, expected) => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code, message } });
    // a duplicate triggers the retry check, which finds nothing to match
    const from = jest.fn(() => query({ data: null, error: null }));
    const result = await saveManagementEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toMatchObject({ ok: false, error: { code: expected } });
  });

  it('treats a duplicate week as success when the stored entry is identical (lost response)', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'dup' } });
    const from = jest.fn(() => query({ data: storedRow, error: null }));
    const result = await saveManagementEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toEqual({ ok: true, data: 7 });
    expect(from).toHaveBeenCalledWith('personal_management');
  });

  it('keeps DUPLICATE_WEEK when the stored entry is different', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'dup' } });
    const from = jest.fn(() =>
      query({
        data: { ...storedRow, personal_management_medication_names: [{ medication_name: 'Amlodipine 5 mg' }] },
        error: null,
      }),
    );
    const result = await saveManagementEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'DUPLICATE_WEEK' } });
  });

  it('keeps DUPLICATE_WEEK when the stored entry cannot be read', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'dup' } });
    const from = jest.fn(() => query({ data: null, error: { code: '42501', message: 'denied' } }));
    const result = await saveManagementEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'DUPLICATE_WEEK' } });
  });

  it('gives NETWORK when the request itself fails', async () => {
    const rpc = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await saveManagementEntry(answers, '2026-10-01', fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'NETWORK' } });
  });

  it('gives UNKNOWN when the database returns no id and no error', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    const result = await saveManagementEntry(answers, '2026-10-01', fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'UNKNOWN' } });
  });
});

describe('getManagementEntryForWeek', () => {
  it('filters by week_start and returns the mapped entry with its medication names', async () => {
    const builder = query({ data: storedRow, error: null });
    const from = jest.fn(() => builder);
    const result = await getManagementEntryForWeek('2026-09-28', fakeClient({ from }));
    expect(from).toHaveBeenCalledWith('personal_management');
    expect(builder.select).toHaveBeenCalledWith('*, personal_management_medication_names(medication_name)');
    expect(builder.eq).toHaveBeenCalledWith('week_start', '2026-09-28');
    expect(result).toEqual({
      ok: true,
      data: {
        submissionId: 7,
        date: '2026-10-01',
        weekStart: '2026-09-28',
        exercise: '3–4 days',
        emotion: 'Meditation',
        otcMedication: 'Panadol',
        noMedication: false,
        medications: ['Amlodipine 5 mg', 'Vitamin D3 1000 IU'],
      },
    });
  });

  it('maps "I didn\'t take any medication" with no names', async () => {
    const row = { ...storedRow, no_medication: true, otc_medication: null, personal_management_medication_names: [] };
    const result = await getManagementEntryForWeek('2026-09-28', fakeClient({ from: () => query({ data: row, error: null }) }));
    expect(result).toMatchObject({ ok: true, data: { noMedication: true, otcMedication: null, medications: [] } });
  });

  it('returns null when the week has no entry', async () => {
    const from = () => query({ data: null, error: null });
    expect(await getManagementEntryForWeek('2026-09-28', fakeClient({ from }))).toEqual({
      ok: true,
      data: null,
    });
  });

  it('maps a database error', async () => {
    const from = () => query({ data: null, error: { code: '42501', message: 'denied' } });
    expect(await getManagementEntryForWeek('2026-09-28', fakeClient({ from }))).toMatchObject({
      ok: false,
      error: { code: 'NOT_ALLOWED' },
    });
  });
});

describe('getCompletedManagementWeeks', () => {
  it('returns the set of completed week starts in the range', async () => {
    const builder = query({
      data: [{ week_start: '2026-09-28' }, { week_start: '2026-10-05' }, { week_start: null }],
      error: null,
    });
    const result = await getCompletedManagementWeeks('2026-09-21', '2026-10-12', fakeClient({ from: () => builder }));
    expect(builder.gte).toHaveBeenCalledWith('week_start', '2026-09-21');
    expect(builder.lte).toHaveBeenCalledWith('week_start', '2026-10-12');
    expect(result).toEqual({ ok: true, data: new Set(['2026-09-28', '2026-10-05']) });
  });

  it('maps a database error', async () => {
    const from = () => query({ data: null, error: { code: '42501', message: 'denied' } });
    expect(await getCompletedManagementWeeks('a', 'b', fakeClient({ from }))).toMatchObject({
      ok: false,
      error: { code: 'NOT_ALLOWED' },
    });
  });
});
