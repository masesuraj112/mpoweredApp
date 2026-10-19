jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import type { SocialHealthAssessmentAnswers } from '@/features/assessments/social-health/types';
import { getSocialHealthEntryForWeek, saveSocialHealthEntry } from '@/services/social-health';

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
const answers: SocialHealthAssessmentAnswers = {
  socialLife: 'My social life is normal and gives me no extra pain',
  travel: 'I can travel anywhere without pain',
  moodNumber: 3,
  relationWithOthers: 4,
  enjoymentOfLife: 5,
  moodEmotion: 'calm',
  emotionReflection: '  Work was busy  ',
};

const storedRow = {
  submission_id: 7,
  date: '2026-10-01',
  week_start: '2026-09-28',
  created_at: '2026-10-01T09:00:00+00:00',
  users_id: 1,
  social_life: 'My social life is normal and gives me no extra pain',
  travelling: 'I can travel anywhere without pain',
  mood: 3,
  relation_with_others: 4,
  enjoyment_of_life: 5,
  mood_overall: 'I was feeling calm',
  reflection: 'Work was busy',
};

describe('saveSocialHealthEntry', () => {
  it('sends validated values to the database and returns the new submission id', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: 42, error: null });
    const result = await saveSocialHealthEntry(
      { ...answers, moodEmotion: 'frustrated' },
      '2026-10-01',
      fakeClient({ rpc }),
      options,
    );

    expect(result).toEqual({ ok: true, data: 42 });
    expect(rpc).toHaveBeenCalledWith('save_social_health_assessment', {
      p_date: '2026-10-01',
      p_social_life: 'My social life is normal and gives me no extra pain',
      p_travelling: 'I can travel anywhere without pain',
      p_mood: 3,
      p_relation_with_others: 4,
      p_enjoyment_of_life: 5,
      p_mood_overall: 'I was feeling frustrated',
      p_reflection: 'Work was busy',
    });
  });

  it('sends a blank reflection as an empty string, which the database stores as NULL', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: 42, error: null });
    await saveSocialHealthEntry({ ...answers, emotionReflection: '   ' }, '2026-10-01', fakeClient({ rpc }), options);
    expect(rpc).toHaveBeenCalledWith('save_social_health_assessment', expect.objectContaining({ p_reflection: '' }));
  });

  it('does not call the database when an answer is missing', async () => {
    const rpc = jest.fn();
    const result = await saveSocialHealthEntry(
      { ...answers, travel: undefined },
      '2026-10-01',
      fakeClient({ rpc }),
      options,
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION', field: 'travel' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('does not call the database for a date in the future', async () => {
    const rpc = jest.fn();
    const result = await saveSocialHealthEntry(answers, '2026-10-04', fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'FUTURE_DATE' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects an entry before the start week when the caller supplies one', async () => {
    const rpc = jest.fn();
    const result = await saveSocialHealthEntry(answers, '2026-09-20', fakeClient({ rpc }), {
      ...options,
      startWeek: '2026-09-28',
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'BEFORE_START' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each([
    ['23505', 'duplicate key', 'DUPLICATE_WEEK'],
    ['42501', 'permission denied', 'NOT_ALLOWED'],
    ['P0001', 'NO_PROFILE', 'NO_PROFILE'],
    ['P0001', 'MISSING_ANSWER', 'VALIDATION'],
    ['23514', 'violates check constraint', 'VALIDATION'],
  ])('maps database error %s (%s) to %s', async (code, message, expected) => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code, message } });
    // a duplicate triggers the retry check, which finds nothing to match
    const from = jest.fn(() => query({ data: null, error: null }));
    const result = await saveSocialHealthEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toMatchObject({ ok: false, error: { code: expected } });
  });

  it('treats a duplicate week as success when the stored entry is identical (lost response)', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'dup' } });
    const from = jest.fn(() => query({ data: storedRow, error: null }));
    const result = await saveSocialHealthEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toEqual({ ok: true, data: 7 });
    expect(from).toHaveBeenCalledWith('social_health_assessment');
  });

  it('keeps DUPLICATE_WEEK when the stored entry is different', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'dup' } });
    const from = jest.fn(() => query({ data: { ...storedRow, mood: 9 }, error: null }));
    const result = await saveSocialHealthEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'DUPLICATE_WEEK' } });
  });

  it('keeps DUPLICATE_WEEK when the stored entry cannot be read', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'dup' } });
    const from = jest.fn(() => query({ data: null, error: { code: '42501', message: 'denied' } }));
    const result = await saveSocialHealthEntry(answers, '2026-10-01', fakeClient({ rpc, from }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'DUPLICATE_WEEK' } });
  });

  it('gives NETWORK when the request itself fails', async () => {
    const rpc = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await saveSocialHealthEntry(answers, '2026-10-01', fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'NETWORK' } });
  });

  it('gives UNKNOWN when the database returns no id and no error', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    const result = await saveSocialHealthEntry(answers, '2026-10-01', fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'UNKNOWN' } });
  });
});

describe('getSocialHealthEntryForWeek', () => {
  it('filters by week_start and returns the mapped entry', async () => {
    const builder = query({ data: storedRow, error: null });
    const from = jest.fn(() => builder);
    const result = await getSocialHealthEntryForWeek('2026-09-28', fakeClient({ from }));
    expect(from).toHaveBeenCalledWith('social_health_assessment');
    expect(builder.eq).toHaveBeenCalledWith('week_start', '2026-09-28');
    expect(result).toEqual({
      ok: true,
      data: {
        submissionId: 7,
        date: '2026-10-01',
        weekStart: '2026-09-28',
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

  it('returns null when the week has no entry', async () => {
    const from = () => query({ data: null, error: null });
    expect(await getSocialHealthEntryForWeek('2026-09-28', fakeClient({ from }))).toEqual({
      ok: true,
      data: null,
    });
  });

  it('maps a database error', async () => {
    const from = () => query({ data: null, error: { code: '42501', message: 'denied' } });
    expect(await getSocialHealthEntryForWeek('2026-09-28', fakeClient({ from }))).toMatchObject({
      ok: false,
      error: { code: 'NOT_ALLOWED' },
    });
  });
});
