jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import { getProfile, hasProfile, sendVerificationCode, signOut, verifyCode } from '@/services/auth';

const fakeClient = (parts: Record<string, unknown>) => parts as never;

describe('sendVerificationCode', () => {
  const clientWith = (result: unknown) => {
    const signInWithOtp = jest.fn().mockResolvedValue(result);
    return { signInWithOtp, client: fakeClient({ auth: { signInWithOtp } }) };
  };

  it('does not call Supabase for an invalid phone number', async () => {
    const { signInWithOtp, client } = clientWith({ data: {}, error: null });
    const result = await sendVerificationCode('0312345678', client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_PHONE');
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it('sends an E.164 number by SMS and returns it', async () => {
    const { signInWithOtp, client } = clientWith({ data: {}, error: null });
    const result = await sendVerificationCode('0491 570 006', client);
    expect(signInWithOtp).toHaveBeenCalledWith({
      phone: '+61491570006',
      options: { channel: 'sms', shouldCreateUser: true },
    });
    expect(result).toEqual({ ok: true, data: { phone: '+61491570006' } });
  });

  it('maps a rate-limit error', async () => {
    const { client } = clientWith({
      data: {},
      error: { code: 'over_sms_send_rate_limit', message: 'too many' },
    });
    const result = await sendVerificationCode('0491 570 006', client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('RATE_LIMITED');
  });

  it('maps a lost connection thrown by the client to NETWORK', async () => {
    const signInWithOtp = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await sendVerificationCode(
      '0491 570 006',
      fakeClient({ auth: { signInWithOtp } }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NETWORK');
  });

  it('maps an unrecognised error to UNKNOWN', async () => {
    const { client } = clientWith({ data: {}, error: { code: 'weird', message: 'boom' } });
    const result = await sendVerificationCode('0491 570 006', client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('UNKNOWN');
  });
});

describe('verifyCode', () => {
  const clientWith = (result: unknown) => {
    const verifyOtp = jest.fn().mockResolvedValue(result);
    return { verifyOtp, client: fakeClient({ auth: { verifyOtp } }) };
  };
  const failure = async (result: unknown, phone = '0491 570 006', code = '123456') => {
    const { client } = clientWith(result);
    const res = await verifyCode(phone, code, client);
    if (res.ok) throw new Error('expected a failure');
    return res.error.code;
  };

  it('does not call Supabase when the code is not six digits', async () => {
    const { verifyOtp, client } = clientWith({ data: {}, error: null });
    for (const code of ['', '12345', '1234567', '12345a']) {
      const result = await verifyCode('0491 570 006', code, client);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe('INVALID_OTP');
    }
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it('does not call Supabase when the phone number is invalid', async () => {
    const { verifyOtp, client } = clientWith({ data: {}, error: null });
    const result = await verifyCode('0312345678', '123456', client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_PHONE');
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it('verifies an E.164 number with an sms token and returns only the user id', async () => {
    const { verifyOtp, client } = clientWith({
      data: { user: { id: 'u-1' }, session: { access_token: 'secret' } },
      error: null,
    });
    const result = await verifyCode('0491 570 006', '123456', client);
    expect(verifyOtp).toHaveBeenCalledWith({
      phone: '+61491570006',
      token: '123456',
      type: 'sms',
    });
    expect(result).toEqual({ ok: true, data: { userId: 'u-1' } });
  });

  it('maps a rejected or expired code to OTP_EXPIRED', async () => {
    const code = await failure({
      data: {},
      error: { code: 'otp_expired', message: 'Token has expired or is invalid' },
    });
    expect(code).toBe('OTP_EXPIRED');
  });

  it('maps a rate-limit error', async () => {
    expect(
      await failure({ data: {}, error: { code: 'over_request_rate_limit', message: 'slow' } }),
    ).toBe('RATE_LIMITED');
  });

  it('returns UNKNOWN when the response has no user', async () => {
    expect(await failure({ data: { user: null, session: null }, error: null })).toBe('UNKNOWN');
  });

  it('maps a lost connection thrown by the client to NETWORK', async () => {
    const verifyOtp = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await verifyCode('0491 570 006', '123456', fakeClient({ auth: { verifyOtp } }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NETWORK');
  });
});

describe('signOut', () => {
  it('signs out and returns ok', async () => {
    const signOutCall = jest.fn().mockResolvedValue({ error: null });
    const result = await signOut(fakeClient({ auth: { signOut: signOutCall } }));
    expect(signOutCall).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('maps an error returned by the client', async () => {
    const signOutCall = jest.fn().mockResolvedValue({ error: { code: 'weird', message: 'boom' } });
    const result = await signOut(fakeClient({ auth: { signOut: signOutCall } }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('UNKNOWN');
  });

  it('maps a lost connection thrown by the client to NETWORK', async () => {
    const signOutCall = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await signOut(fakeClient({ auth: { signOut: signOutCall } }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NETWORK');
  });
});

describe('hasProfile', () => {
  const clientWith = (session: unknown, row: { data: unknown; error: unknown }) => {
    const eq = jest.fn();
    const maybeSingle = jest.fn().mockResolvedValue(row);
    const select = jest.fn(() => ({ eq }));
    eq.mockReturnValue({ maybeSingle });
    const from = jest.fn(() => ({ select }));
    const getSession = jest.fn().mockResolvedValue({ data: { session }, error: null });
    return { from, select, eq, getSession, client: fakeClient({ auth: { getSession }, from }) };
  };

  it('returns NO_SESSION and does not query when nobody is signed in', async () => {
    const { from, client } = clientWith(null, { data: null, error: null });
    const result = await hasProfile(client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NO_SESSION');
    expect(from).not.toHaveBeenCalled();
  });

  it('is true when a users row exists, looked up by auth_id', async () => {
    const { from, select, eq, client } = clientWith(
      { user: { id: 'u-1' } },
      { data: { users_id: 5 }, error: null },
    );
    const result = await hasProfile(client);
    expect(from).toHaveBeenCalledWith('users');
    expect(select).toHaveBeenCalledWith('users_id');
    expect(eq).toHaveBeenCalledWith('auth_id', 'u-1');
    expect(result).toEqual({ ok: true, data: true });
  });

  it('is false when there is no users row', async () => {
    const { client } = clientWith({ user: { id: 'u-1' } }, { data: null, error: null });
    expect(await hasProfile(client)).toEqual({ ok: true, data: false });
  });

  it('maps a database error', async () => {
    const { client } = clientWith(
      { user: { id: 'u-1' } },
      { data: null, error: { code: '42501', message: 'permission denied' } },
    );
    const result = await hasProfile(client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_ALLOWED');
  });
});

describe('getProfile', () => {
  const clientWith = (session: unknown, row: { data: unknown; error: unknown }) => {
    const eq = jest.fn();
    const maybeSingle = jest.fn().mockResolvedValue(row);
    const select = jest.fn(() => ({ eq }));
    eq.mockReturnValue({ maybeSingle });
    const from = jest.fn(() => ({ select }));
    const getSession = jest.fn().mockResolvedValue({ data: { session }, error: null });
    return { from, select, eq, getSession, client: fakeClient({ auth: { getSession }, from }) };
  };

  it('returns NO_SESSION and does not query when nobody is signed in', async () => {
    const { from, client } = clientWith(null, { data: null, error: null });
    const result = await getProfile(client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NO_SESSION');
    expect(from).not.toHaveBeenCalled();
  });

  it("looks up only the signed-in user's own row, by auth_id", async () => {
    // users_select also returns a patient's row to their support persons, so the filter matters.
    const { from, select, eq, client } = clientWith(
      { user: { id: 'u-1' } },
      { data: { user_type: 'patient', name: 'Sam', phone_number: '+61491570006' }, error: null },
    );
    await getProfile(client);
    expect(from).toHaveBeenCalledWith('users');
    expect(select).toHaveBeenCalledWith('user_type, name, phone_number');
    expect(eq).toHaveBeenCalledWith('auth_id', 'u-1');
  });

  it('returns a patient profile', async () => {
    const { client } = clientWith(
      { user: { id: 'u-1' } },
      { data: { user_type: 'patient', name: 'Sam', phone_number: '+61491570006' }, error: null },
    );
    expect(await getProfile(client)).toEqual({ ok: true, data: { userType: 'patient', name: 'Sam', phone: '+61491570006' } });
  });

  it('returns a support person profile', async () => {
    const { client } = clientWith(
      { user: { id: 'u-2' } },
      { data: { user_type: 'support_person', name: 'Alex', phone_number: '+61491570007' }, error: null },
    );
    expect(await getProfile(client)).toEqual({ ok: true, data: { userType: 'support_person', name: 'Alex', phone: '+61491570007' } });
  });

  it('passes through a missing phone number (rows made before phone sign-in)', async () => {
    const { client } = clientWith(
      { user: { id: 'u-3' } },
      { data: { user_type: 'patient', name: 'Old', phone_number: null }, error: null },
    );
    expect(await getProfile(client)).toEqual({ ok: true, data: { userType: 'patient', name: 'Old', phone: null } });
  });

  it('is null when there is no users row yet', async () => {
    const { client } = clientWith({ user: { id: 'u-1' } }, { data: null, error: null });
    expect(await getProfile(client)).toEqual({ ok: true, data: null });
  });

  it('maps a database error', async () => {
    const { client } = clientWith(
      { user: { id: 'u-1' } },
      { data: null, error: { code: '42501', message: 'permission denied' } },
    );
    const result = await getProfile(client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_ALLOWED');
  });
});
