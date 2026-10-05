jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import type { PainAssessmentAnswers } from '@/features/assessments/pain/types';
import {
  getCompletedPainWeeks,
  getPainEntryForWeek,
  getRecentPainLocations,
  getUserStartWeek,
  savePainEntry,
} from '@/services/assessments';

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
const answers: PainAssessmentAnswers = {
  painLocations: ['Head'],
  characteristics: ['Sharp'],
  currentPain: 4,
  mildestPain: 2,
  worstPain: 8,
  averagePain: 5,
};

const storedRow = {
  submission_id: 7,
  date: '2026-10-01',
  week_start: '2026-09-28',
  current_pain_level: 4,
  mildest_pain_level: 2,
  worst_pain_level: 8,
  average_pain_level: 5,
  pain_location: [{ pain_location: 'Head' }],
  pain_characteristics: [{ pain_characteristic: 'Sharp' }],
};

describe('savePainEntry', () => {
  it('sends normalised values to the database and returns the new submission id', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: 42, error: null });
    const result = await savePainEntry(
      { ...answers, painLocations: [' lower  back ', 'Lower Back'], characteristics: ['Sharp', 'Sharp'] },
      '2026-10-01',
      fakeClient({ rpc }),
      options,
    );

    expect(result).toEqual({ ok: true, data: 42 });
    expect(rpc).toHaveBeenCalledWith('save_pain_assessment', {
      p_date: '2026-10-01',
      p_current: 4,
      p_mildest: 2,
      p_worst: 8,
      p_average: 5,
      p_locations: ['Lower Back'],
      p_characteristics: ['Sharp'],
    });
  });

  it('does not call the database when an answer is missing', async () => {
    const rpc = jest.fn();
    const result = await savePainEntry(
      { ...answers, worstPain: undefined },
      '2026-10-01',
      fakeClient({ rpc }),
      options,
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION', field: 'worstPain' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('does not call the database for a date in the future', async () => {
    const rpc = jest.fn();
    const result = await savePainEntry(answers, '2026-10-04', fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'FUTURE_DATE' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects an entry before the start week when the caller supplies one', async () => {
    const rpc = jest.fn();
    const result = await savePainEntry(answers, '2026-09-20', fakeClient({ rpc }), {
      ...options,
      startWeek: '2026-09-28',
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'BEFORE_START' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each([
    ['23505', 'duplicate key', 'DUPLICATE_WEEK'],
    ['42501', 'permission denied', 'NOT_ALLOWED'],
    ['P0001', 'BEFORE_START', 'BEFORE_START'],
    ['P0001', 'NO_PROFILE', 'NO_PROFILE'],
    ['23514', 'violates check constraint', 'VALIDATION'],
  ])('maps database error %s (%s) to %s', async (code, message, expected) => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code, message } });
    // a duplicate triggers the retry check, which finds nothing to match
    const from = jest.fn(() => query({ data: null, error: null }));
    const result = await savePainEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toMatchObject({ ok: false, error: { code: expected } });
  });

  it('treats a duplicate week as success when the stored entry is identical (lost response)', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'dup' } });
    const from = jest.fn(() => query({ data: storedRow, error: null }));
    const result = await savePainEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toEqual({ ok: true, data: 7 });
    expect(from).toHaveBeenCalledWith('pain_assessment');
  });

  it('keeps DUPLICATE_WEEK when the stored entry is different', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'dup' } });
    const from = jest.fn(() => query({ data: { ...storedRow, worst_pain_level: 9 }, error: null }));
    const result = await savePainEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'DUPLICATE_WEEK' } });
  });

  it('keeps DUPLICATE_WEEK when the stored entry cannot be read', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'dup' } });
    const from = jest.fn(() => query({ data: null, error: { code: '42501', message: 'denied' } }));
    const result = await savePainEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'DUPLICATE_WEEK' } });
  });

  it('gives NETWORK when the request itself fails', async () => {
    const rpc = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await savePainEntry(answers, '2026-10-01', fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'NETWORK' } });
  });

  it('gives UNKNOWN when the database returns no id and no error', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    const result = await savePainEntry(answers, '2026-10-01', fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'UNKNOWN' } });
  });
});

describe('getPainEntryForWeek', () => {
  it('filters by week_start and returns the entry with its children', async () => {
    const builder = query({ data: storedRow, error: null });
    const result = await getPainEntryForWeek('2026-09-28', fakeClient({ from: () => builder }));
    expect(builder.eq).toHaveBeenCalledWith('week_start', '2026-09-28');
    expect(result).toEqual({
      ok: true,
      data: {
        submissionId: 7,
        date: '2026-10-01',
        weekStart: '2026-09-28',
        current: 4,
        mildest: 2,
        worst: 8,
        average: 5,
        locations: ['Head'],
        characteristics: ['Sharp'],
      },
    });
  });

  it('returns null when the week has no entry', async () => {
    const from = () => query({ data: null, error: null });
    expect(await getPainEntryForWeek('2026-09-28', fakeClient({ from }))).toEqual({
      ok: true,
      data: null,
    });
  });

  it('maps a database error', async () => {
    const from = () => query({ data: null, error: { code: '42501', message: 'denied' } });
    expect(await getPainEntryForWeek('2026-09-28', fakeClient({ from }))).toMatchObject({
      ok: false,
      error: { code: 'NOT_ALLOWED' },
    });
  });
});

describe('getCompletedPainWeeks', () => {
  it('returns the set of completed week starts in the range', async () => {
    const builder = query({
      data: [{ week_start: '2026-09-28' }, { week_start: '2026-10-05' }, { week_start: null }],
      error: null,
    });
    const result = await getCompletedPainWeeks('2026-09-21', '2026-10-12', fakeClient({ from: () => builder }));
    expect(builder.gte).toHaveBeenCalledWith('week_start', '2026-09-21');
    expect(builder.lte).toHaveBeenCalledWith('week_start', '2026-10-12');
    expect(result).toEqual({ ok: true, data: new Set(['2026-09-28', '2026-10-05']) });
  });

  it('maps a database error', async () => {
    const from = () => query({ data: null, error: { code: '42501', message: 'denied' } });
    expect(await getCompletedPainWeeks('a', 'b', fakeClient({ from }))).toMatchObject({
      ok: false,
      error: { code: 'NOT_ALLOWED' },
    });
  });
});

describe('getUserStartWeek', () => {
  const session = (id?: string) => ({
    getSession: jest.fn().mockResolvedValue({
      data: { session: id ? { user: { id } } : null },
      error: null,
    }),
  });

  it('gives NO_SESSION when nobody is signed in', async () => {
    expect(await getUserStartWeek(fakeClient({ auth: session() }))).toMatchObject({
      ok: false,
      error: { code: 'NO_SESSION' },
    });
  });

  it('filters by the signed-in auth_id and returns the Monday of the join week', async () => {
    const builder = query({ data: { created_at: '2026-10-07T12:00:00Z' }, error: null });
    const result = await getUserStartWeek(
      fakeClient({ auth: session('auth-1'), from: () => builder }),
    );
    expect(builder.eq).toHaveBeenCalledWith('auth_id', 'auth-1');
    expect(result).toEqual({ ok: true, data: '2026-10-05' });
  });

  it('gives NO_PROFILE when the user has no users row', async () => {
    const from = () => query({ data: null, error: null });
    expect(await getUserStartWeek(fakeClient({ auth: session('auth-1'), from }))).toMatchObject({
      ok: false,
      error: { code: 'NO_PROFILE' },
    });
  });
});

describe('getRecentPainLocations', () => {
  it('returns distinct locations from this week and the previous one', async () => {
    const builder = query({
      data: [
        { pain_location: [{ pain_location: 'Head' }, { pain_location: 'Outer Thigh' }] },
        { pain_location: [{ pain_location: 'head' }, { pain_location: 'Inner Thigh' }] },
      ],
      error: null,
    });
    const result = await getRecentPainLocations(2, fakeClient({ from: () => builder }), '2026-10-07');
    // today is in the week starting 2026-10-05, so two weeks reach back to 2026-09-28
    expect(builder.gte).toHaveBeenCalledWith('week_start', '2026-09-28');
    expect(result).toEqual({ ok: true, data: ['Head', 'Outer Thigh', 'Inner Thigh'] });
  });
});
