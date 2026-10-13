jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import { sendVerificationCode } from '@/services/auth';

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
