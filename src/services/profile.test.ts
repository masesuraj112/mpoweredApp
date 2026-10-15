jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import type { OnboardingAnswers } from '@/features/auth/profile';
import { createProfile } from '@/services/profile';

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
