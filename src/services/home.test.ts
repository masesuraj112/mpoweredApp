jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import { getWeeklyProgress, getWeeklyReflection, saveWeeklyReflection } from '@/services/home';

// A fake query builder: every filter returns the builder, and maybeSingle gives the canned result.
function query(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq']) {
    builder[method] = jest.fn(() => builder);
  }
  builder.maybeSingle = jest.fn(() => Promise.resolve(result));
  return builder as Record<'select' | 'eq' | 'maybeSingle', jest.Mock>;
}

const fakeClient = (parts: Record<string, unknown>) => parts as never;
const dbError = { code: '42501', message: 'permission denied' };

describe('getWeeklyProgress', () => {
  it('returns the entry date of each assessment saved in the week', async () => {
    const tables: Record<string, ReturnType<typeof query>> = {
      pain_assessment: query({ data: { date: '2026-10-27' }, error: null }),
      movement_assessment: query({ data: null, error: null }),
      social_health_assessment: query({ data: { date: '2026-10-26' }, error: null }),
      personal_management: query({ data: null, error: null }),
    };
    const from = jest.fn((table: string) => tables[table]);

    const result = await getWeeklyProgress('2026-10-26', fakeClient({ from }));

    expect(result).toEqual({ ok: true, data: { pain: '2026-10-27', socialHealth: '2026-10-26' } });
    expect(from).toHaveBeenCalledTimes(4);
    for (const builder of Object.values(tables)) {
      expect(builder.select).toHaveBeenCalledWith('date');
      expect(builder.eq).toHaveBeenCalledWith('week_start', '2026-10-26');
    }
  });

  it('fails when any table cannot be read', async () => {
    const from = jest.fn((table: string) =>
      table === 'movement_assessment'
        ? query({ data: null, error: dbError })
        : query({ data: null, error: null }),
    );
    const result = await getWeeklyProgress('2026-10-26', fakeClient({ from }));
    expect(result.ok).toBe(false);
  });

  it('turns a thrown error (for example a lost connection) into a failed Result', async () => {
    const from = jest.fn(() => {
      throw new TypeError('Network request failed');
    });
    const result = await getWeeklyProgress('2026-10-26', fakeClient({ from }));
    expect(result.ok).toBe(false);
  });
});

describe('getWeeklyReflection', () => {
  it('returns the reflection saved for the week', async () => {
    const builder = query({
      data: { entry: 'Felt better', is_complete: false, updated_at: '2026-10-27T09:00:00+00:00' },
      error: null,
    });
    const from = jest.fn(() => builder);

    const result = await getWeeklyReflection('2026-10-26', fakeClient({ from }));

    expect(result).toEqual({
      ok: true,
      data: { entry: 'Felt better', isComplete: false, updatedAt: '2026-10-27T09:00:00+00:00' },
    });
    expect(from).toHaveBeenCalledWith('weekly_reflection');
    expect(builder.eq).toHaveBeenCalledWith('week_start', '2026-10-26');
  });

  it('returns null when the week has no reflection', async () => {
    const from = jest.fn(() => query({ data: null, error: null }));
    expect(await getWeeklyReflection('2026-10-26', fakeClient({ from }))).toEqual({ ok: true, data: null });
  });

  it('fails when the database returns an error', async () => {
    const from = jest.fn(() => query({ data: null, error: dbError }));
    expect((await getWeeklyReflection('2026-10-26', fakeClient({ from }))).ok).toBe(false);
  });
});

describe('saveWeeklyReflection', () => {
  const options = { today: '2026-10-28' };

  it('sends the trimmed text, today and the completion flag', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: 5, error: null });
    const result = await saveWeeklyReflection('  Felt better  ', { isComplete: true }, fakeClient({ rpc }), options);

    expect(result).toEqual({ ok: true, data: 5 });
    expect(rpc).toHaveBeenCalledWith('save_weekly_reflection', {
      p_date: '2026-10-28',
      p_entry: 'Felt better',
      p_is_complete: true,
    });
  });

  it('saves a draft with isComplete false', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: 5, error: null });
    await saveWeeklyReflection('Half written', { isComplete: false }, fakeClient({ rpc }), options);
    expect(rpc).toHaveBeenCalledWith('save_weekly_reflection', expect.objectContaining({ p_is_complete: false }));
  });

  it('does not call the database for blank text', async () => {
    const rpc = jest.fn();
    const result = await saveWeeklyReflection('   ', { isComplete: true }, fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION', detail: 'MISSING_ANSWER' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('does not call the database for more than 200 words', async () => {
    const rpc = jest.fn();
    const result = await saveWeeklyReflection('word '.repeat(201), { isComplete: true }, fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION', detail: 'VALUE_TOO_LONG' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('accepts exactly 200 words', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: 5, error: null });
    const result = await saveWeeklyReflection('word '.repeat(200), { isComplete: true }, fakeClient({ rpc }), options);
    expect(result.ok).toBe(true);
  });

  it('maps a database error', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: 'P0001', message: 'FUTURE_DATE' } });
    const result = await saveWeeklyReflection('Felt better', { isComplete: true }, fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'FUTURE_DATE' } });
  });

  it('fails when the save returns no id', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    const result = await saveWeeklyReflection('Felt better', { isComplete: true }, fakeClient({ rpc }), options);
    expect(result).toMatchObject({ ok: false, error: { code: 'UNKNOWN' } });
  });
});
