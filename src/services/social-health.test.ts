jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import { getSocialHealthEntryForWeek } from '@/services/social-health';

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
