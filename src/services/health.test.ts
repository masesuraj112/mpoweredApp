jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import {
  deletePrescription,
  getAssessments,
  getCompletedWeeks,
  getPainEntries,
  getPrescription,
  getPrescriptions,
  getUserProfile,
  savePrescription,
} from '@/services/health';

const METHODS = ['select', 'eq', 'gte', 'lte', 'lt', 'is', 'order', 'limit', 'update'] as const;

// A fake query builder: every filter returns the builder, and awaiting it (or maybeSingle)
// gives the canned { data, error } result.
function query(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const method of METHODS) {
    builder[method] = jest.fn(() => builder);
  }
  builder.maybeSingle = jest.fn(() => Promise.resolve(result));
  builder.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder as Record<(typeof METHODS)[number] | 'maybeSingle', jest.Mock>;
}

const fakeClient = (parts: Record<string, unknown>) => parts as never;
const empty = () => query({ data: null, error: null });

const prescriptionRow = {
  medication_id: 4,
  name: 'Amlodipine',
  strength: 5,
  strength_unit: 'mg',
  form: 'tablets',
  dosage: { amount: 1, repeats_every: 1, unit_of_time: 'days' },
};

describe('getAssessments', () => {
  it('returns null for each assessment with no entry', async () => {
    const from = jest.fn((_table: string) => empty());
    const result = await getAssessments({ kind: 'latest' }, fakeClient({ from }));
    expect(result).toEqual({
      ok: true,
      data: { pain: null, movement: null, personalCare: null, socialHealth: null, management: null },
    });
    expect(from.mock.calls.map(([table]) => table)).toEqual([
      'pain_assessment',
      'movement_assessment',
      'personal_care_assessment',
      'social_health_assessment',
      'personal_management',
    ]);
  });

  it('limits each table to Monday to Sunday of the requested week', async () => {
    const builders: ReturnType<typeof query>[] = [];
    const from = jest.fn(() => {
      const builder = empty();
      builders.push(builder);
      return builder;
    });
    await getAssessments({ kind: 'week', weekStart: '2026-05-18' }, fakeClient({ from }));
    for (const builder of builders) {
      expect(builder.gte).toHaveBeenCalledWith('date', '2026-05-18');
      expect(builder.lte).toHaveBeenCalledWith('date', '2026-05-24');
    }
  });

  it('shapes stored rows into entries', async () => {
    const rows: Record<string, unknown> = {
      movement_assessment: {
        submission_id: 1,
        date: '2026-05-20',
        average_active_hours: '6.00',
        movement_general_impacts: [{ impact_statement: 'I walk more slowly' }],
        walking_impact: 'w',
        lifting_impact: 'l',
        sitting_impact: 's',
        standing_impact: 'st',
      },
      personal_management: {
        submission_id: 2,
        date: '2026-05-21',
        exercise: 'e',
        emotion: null,
        personal_management_medications: [
          { medications: { name: 'Vitamin D3', strength: 1000, strength_unit: 'iu' } },
          { medications: null },
        ],
      },
    };
    const from = jest.fn((table: string) => query({ data: rows[table] ?? null, error: null }));
    const result = await getAssessments({ kind: 'latest' }, fakeClient({ from }));
    expect(result).toMatchObject({
      ok: true,
      data: {
        movement: { weekStart: '2026-05-18', averageActiveHours: 6, generalImpacts: ['I walk more slowly'] },
        management: { medications: ['Vitamin D3 1000 iu'] },
      },
    });
  });

  it('fails when any table cannot be read', async () => {
    const from = jest.fn((table: string) =>
      table === 'social_health_assessment'
        ? query({ data: null, error: { code: '42501', message: 'permission denied' } })
        : empty(),
    );
    const result = await getAssessments({ kind: 'latest' }, fakeClient({ from }));
    expect(result).toMatchObject({ ok: false, error: { code: 'NOT_ALLOWED' } });
  });

  it('reports a lost connection as NETWORK instead of throwing', async () => {
    const from = jest.fn(() => {
      throw new TypeError('Network request failed');
    });
    const result = await getAssessments({ kind: 'latest' }, fakeClient({ from }));
    expect(result).toMatchObject({ ok: false, error: { code: 'NETWORK' } });
  });
});

describe('getUserProfile', () => {
  const auth = (id: string | null) => ({
    getSession: jest.fn().mockResolvedValue({
      data: { session: id ? { user: { id } } : null },
      error: null,
    }),
  });

  it('reads the signed-in user and their patient record', async () => {
    const users = query({ data: { users_id: 9, name: 'Jane' }, error: null });
    const patients = query({
      data: {
        sex: 'Female',
        year_of_birth: 1955,
        other_conditions: '  ',
        patient_musko_skeletal_pain: [{ disease: 'Osteoarthritis' }],
      },
      error: null,
    });
    const from = jest.fn((table: string) => (table === 'users' ? users : patients));
    const result = await getUserProfile(fakeClient({ auth: auth('auth-1'), from }));

    expect(users.eq).toHaveBeenCalledWith('auth_id', 'auth-1');
    expect(patients.eq).toHaveBeenCalledWith('users_id', 9);
    expect(result).toEqual({
      ok: true,
      data: {
        name: 'Jane',
        sex: 'Female',
        yearOfBirth: 1955,
        conditions: ['Osteoarthritis'],
        otherConditions: null,
      },
    });
  });

  it('works for an account without a patient record', async () => {
    const from = jest.fn((table: string) =>
      table === 'users' ? query({ data: { users_id: 9, name: 'Sam' }, error: null }) : empty(),
    );
    const result = await getUserProfile(fakeClient({ auth: auth('auth-1'), from }));
    expect(result).toMatchObject({ ok: true, data: { name: 'Sam', sex: null, conditions: [] } });
  });

  it('reports NO_SESSION and NO_PROFILE', async () => {
    expect(await getUserProfile(fakeClient({ auth: auth(null), from: jest.fn() }))).toMatchObject({
      ok: false,
      error: { code: 'NO_SESSION' },
    });
    expect(
      await getUserProfile(fakeClient({ auth: auth('auth-1'), from: jest.fn(() => empty()) })),
    ).toMatchObject({ ok: false, error: { code: 'NO_PROFILE' } });
  });
});

describe('getPainEntries', () => {
  it('gets the newest weeks first, and only older weeks when paging', async () => {
    const builder = query({ data: [], error: null });
    const client = fakeClient({ from: jest.fn(() => builder) });

    await getPainEntries({ limit: 5 }, client);
    expect(builder.order).toHaveBeenCalledWith('week_start', { ascending: false });
    expect(builder.limit).toHaveBeenCalledWith(5);
    expect(builder.lt).not.toHaveBeenCalled();

    await getPainEntries({ limit: 5, beforeWeek: '2026-05-04' }, client);
    expect(builder.lt).toHaveBeenCalledWith('week_start', '2026-05-04');
  });
});

describe('getCompletedWeeks', () => {
  it('groups each assessment by the Monday of the week it was recorded in', async () => {
    const dates: Record<string, { date: string }[]> = {
      pain_assessment: [{ date: '2026-05-24' }],
      movement_assessment: [{ date: '2026-05-12' }, { date: '2026-05-18' }],
    };
    const builders: ReturnType<typeof query>[] = [];
    const from = jest.fn((table: string) => {
      const builder = query({ data: dates[table] ?? [], error: null });
      builders.push(builder);
      return builder;
    });
    const result = await getCompletedWeeks('2026-05-11', '2026-05-18', fakeClient({ from }));

    expect(builders[0].lte).toHaveBeenCalledWith('date', '2026-05-24');
    expect(result.ok && result.data.pain).toEqual(new Set(['2026-05-18']));
    expect(result.ok && result.data.movement).toEqual(new Set(['2026-05-11', '2026-05-18']));
    expect(result.ok && result.data.management).toEqual(new Set());
  });
});

describe('prescriptions', () => {
  it('lists only prescriptions that have not been deleted', async () => {
    const builder = query({ data: [prescriptionRow], error: null });
    const result = await getPrescriptions(fakeClient({ from: jest.fn(() => builder) }));
    expect(builder.is).toHaveBeenCalledWith('deleted_at', null);
    expect(result).toEqual({
      ok: true,
      data: [
        {
          id: 4,
          name: 'Amlodipine',
          strength: 5,
          strengthUnit: 'mg',
          form: 'tablets',
          amount: 1,
          repeatsEvery: 1,
          unitOfTime: 'days',
        },
      ],
    });
  });

  it('reports NOT_FOUND for a missing prescription', async () => {
    const result = await getPrescription(99, fakeClient({ from: jest.fn(() => empty()) }));
    expect(result).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
  });

  const input = {
    name: 'Amlodipine',
    strength: 5,
    strengthUnit: 'mg' as const,
    form: 'tablets' as const,
    amount: 1,
    repeatsEvery: 1,
    unitOfTime: 'days' as const,
  };

  it('adds a new prescription without a medication id', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: 12, error: null });
    const result = await savePrescription(input, undefined, fakeClient({ rpc }));
    expect(result).toEqual({ ok: true, data: 12 });
    expect(rpc).toHaveBeenCalledWith('save_prescription', {
      p_name: 'Amlodipine',
      p_strength: 5,
      p_strength_unit: 'mg',
      p_form: 'tablets',
      p_amount: 1,
      p_repeats_every: 1,
      p_unit_of_time: 'days',
    });
  });

  it('edits an existing prescription by passing its id', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: 4, error: null });
    await savePrescription(input, 4, fakeClient({ rpc }));
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_medication_id: 4 });
  });

  it('maps errors raised by save_prescription', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: 'P0001', message: 'NOT_FOUND' } });
    expect(await savePrescription(input, 4, fakeClient({ rpc }))).toMatchObject({
      ok: false,
      error: { code: 'NOT_FOUND' },
    });
  });

  it('deletes by setting deleted_at, and reports NOT_FOUND when nothing changed', async () => {
    const builder = query({ data: [{ medication_id: 4 }], error: null });
    expect(await deletePrescription(4, fakeClient({ from: jest.fn(() => builder) }))).toEqual({
      ok: true,
      data: undefined,
    });
    expect(builder.update).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
    expect(builder.eq).toHaveBeenCalledWith('medication_id', 4);

    const none = query({ data: [], error: null });
    expect(await deletePrescription(4, fakeClient({ from: jest.fn(() => none) }))).toMatchObject({
      ok: false,
      error: { code: 'NOT_FOUND' },
    });
  });
});
