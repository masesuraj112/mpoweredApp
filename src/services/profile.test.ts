jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import type { OnboardingAnswers } from '@/features/auth/profile';
import { createProfile, getPersonalDetails, updateProfile } from '@/services/profile';

const fakeClient = (parts: Record<string, unknown>) => parts as never;

const answers: OnboardingAnswers = {
  name: 'Sam',
  userType: 'patient',
  sex: 'female',
  yearOfBirth: 1980,
  hasDiagnosis: true,
  conditions: ['Arthritis'],
  otherConditions: '',
  phoneNumber: '0491 570 006',
};

const options = { currentYear: 2026 };

describe('createProfile', () => {
  it('does not call the database when the answers are invalid', async () => {
    const rpc = jest.fn();
    const result = await createProfile({ ...answers, name: '' }, fakeClient({ rpc }), options);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION');
      expect(result.error.field).toBe('name');
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it('calls create_profile with the mapped arguments and succeeds', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    const result = await createProfile(answers, fakeClient({ rpc }), options);
    expect(rpc).toHaveBeenCalledWith('create_profile', {
      p_name: 'Sam',
      p_user_type: 'patient',
      p_sex: 'Female',
      p_year_of_birth: 1980,
      p_conditions: ['Arthritis'],
      p_other_conditions: null,
      p_phone: '+61491570006',
    });
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('treats PROFILE_EXISTS as success so a retry is safe', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { code: 'P0001', message: 'PROFILE_EXISTS' },
    });
    const result = await createProfile(answers, fakeClient({ rpc }), options);
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it.each([
    ['NO_SESSION', 'NO_SESSION'],
    ['INVALID_PHONE', 'INVALID_PHONE'],
    ['INVALID_NAME', 'VALIDATION'],
  ])('maps the database error %s to %s', async (message, code) => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: 'P0001', message } });
    const result = await createProfile(answers, fakeClient({ rpc }), options);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe(code);
  });

  it('maps a permission error to NOT_ALLOWED', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { code: '42501', message: 'permission denied' },
    });
    const result = await createProfile(answers, fakeClient({ rpc }), options);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_ALLOWED');
  });

  it('maps a lost connection thrown by the client to NETWORK', async () => {
    const rpc = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await createProfile(answers, fakeClient({ rpc }), options);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NETWORK');
  });
});

describe('createProfile payload', () => {
  const sentArgs = async (input: OnboardingAnswers) => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    await createProfile(input, fakeClient({ rpc }), options);
    return rpc.mock.calls[0][1] as Record<string, unknown>;
  };

  it.each([
    ['a patient', answers],
    ['a patient with no year, no conditions and no other conditions', {
      ...answers,
      yearOfBirth: null,
      conditions: [],
      otherConditions: '',
    }],
    ['a support person', { ...answers, userType: 'support-person' as const, sex: null }],
  ])('for %s carries no user id and no undefined values', async (_label, input) => {
    const payload = await sentArgs(input);
    const keys = Object.keys(payload);

    // the function takes the user from the session, so nothing identifies the user
    expect(keys.filter((key) => /(^|_)(id|uid)$|auth|users?_id/i.test(key))).toEqual([]);
    expect(keys.sort()).toEqual([
      'p_conditions',
      'p_name',
      'p_other_conditions',
      'p_phone',
      'p_sex',
      'p_user_type',
      'p_year_of_birth',
    ]);
    expect(Object.values(payload).filter((value) => value === undefined)).toEqual([]);
  });
});

describe('getPersonalDetails', () => {
  const clientWith = (session: unknown, row: { data: unknown; error: unknown }) => {
    const eq = jest.fn();
    const maybeSingle = jest.fn().mockResolvedValue(row);
    const select = jest.fn(() => ({ eq }));
    eq.mockReturnValue({ maybeSingle });
    const from = jest.fn(() => ({ select }));
    const getSession = jest.fn().mockResolvedValue({ data: { session }, error: null });
    return { from, select, eq, client: fakeClient({ auth: { getSession }, from }) };
  };
  const signedIn = { user: { id: 'u-1' } };

  it('returns NO_SESSION and does not query when nobody is signed in', async () => {
    const { from, client } = clientWith(null, { data: null, error: null });
    const result = await getPersonalDetails(client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NO_SESSION');
    expect(from).not.toHaveBeenCalled();
  });

  it("reads only the signed-in user's own row, with the year from patients", async () => {
    const { from, select, eq, client } = clientWith(signedIn, {
      data: { name: 'Sam', phone_number: '+61491570006', patients: [{ year_of_birth: 1980 }] },
      error: null,
    });
    const result = await getPersonalDetails(client);
    // users_select also returns a patient's row to their support persons, so the filter matters.
    expect(from).toHaveBeenCalledWith('users');
    expect(select).toHaveBeenCalledWith('name, phone_number, patients(year_of_birth)');
    expect(eq).toHaveBeenCalledWith('auth_id', 'u-1');
    expect(result).toEqual({ ok: true, data: { name: 'Sam', phone: '+61491570006', yearOfBirth: 1980 } });
  });

  it.each([
    ['a support person (no patients row)', []],
    ['a patient who gave no year', [{ year_of_birth: null }]],
  ])('returns a null year for %s', async (_label, patients) => {
    const { client } = clientWith(signedIn, {
      data: { name: 'Pat', phone_number: null, patients },
      error: null,
    });
    const result = await getPersonalDetails(client);
    expect(result).toEqual({ ok: true, data: { name: 'Pat', phone: null, yearOfBirth: null } });
  });

  it('returns NO_PROFILE when the user has no users row', async () => {
    const { client } = clientWith(signedIn, { data: null, error: null });
    const result = await getPersonalDetails(client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NO_PROFILE');
  });

  it('maps a database error', async () => {
    const { client } = clientWith(signedIn, { data: null, error: { code: '42501', message: 'permission denied' } });
    const result = await getPersonalDetails(client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_ALLOWED');
  });

  it('returns an error instead of throwing when the connection fails', async () => {
    const getSession = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await getPersonalDetails(fakeClient({ auth: { getSession } }));
    expect(result.ok).toBe(false);
  });
});

describe('updateProfile', () => {
  it('calls update_profile with the trimmed name and the year, and no user id', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    const result = await updateProfile({ name: '  Sam Lee  ', yearOfBirth: 1975 }, fakeClient({ rpc }));
    expect(rpc).toHaveBeenCalledWith('update_profile', { p_name: 'Sam Lee', p_year_of_birth: 1975 });
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('sends a null year as null (a support person, or a patient clearing it)', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    await updateProfile({ name: 'Pat', yearOfBirth: null }, fakeClient({ rpc }));
    expect(rpc).toHaveBeenCalledWith('update_profile', { p_name: 'Pat', p_year_of_birth: null });
  });

  it.each([
    ['a blank name', { name: '   ', yearOfBirth: null }, 'name'],
    ['a name over 45 characters', { name: 'a'.repeat(46), yearOfBirth: null }, 'name'],
    ['a year before 1900', { name: 'Sam', yearOfBirth: 1899 }, 'yearOfBirth'],
    ['a year in the future', { name: 'Sam', yearOfBirth: new Date().getFullYear() + 1 }, 'yearOfBirth'],
  ])('rejects %s without calling the database', async (_label, details, field) => {
    const rpc = jest.fn();
    const result = await updateProfile(details, fakeClient({ rpc }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION');
      expect(result.error.field).toBe(field);
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each([
    ['NO_SESSION', 'NO_SESSION'],
    ['NO_PROFILE', 'NO_PROFILE'],
    ['INVALID_NAME', 'VALIDATION'],
    ['INVALID_YEAR', 'VALIDATION'],
  ])('maps the database code %s to %s', async (message, code) => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { code: 'P0001', message } });
    const result = await updateProfile({ name: 'Sam', yearOfBirth: 1980 }, fakeClient({ rpc }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe(code);
  });

  it('returns an error instead of throwing when the connection fails', async () => {
    const rpc = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await updateProfile({ name: 'Sam', yearOfBirth: 1980 }, fakeClient({ rpc }));
    expect(result.ok).toBe(false);
  });
});
