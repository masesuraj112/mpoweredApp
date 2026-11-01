jest.mock('@/services/account', () => ({ deleteAccount: jest.fn() }));
jest.mock('@/services/auth', () => ({ sendVerificationCode: jest.fn(), signOut: jest.fn() }));

import { act, renderHook } from '@testing-library/react-native';

import { RESEND_SECONDS } from '@/features/auth/otp';
import { deleteAccount } from '@/services/account';
import { sendVerificationCode, signOut } from '@/services/auth';

import { useAccountDeletion } from './useAccountDeletion';

const mockDelete = deleteAccount as jest.Mock;
const mockSend = sendVerificationCode as jest.Mock;
const mockSignOut = signOut as jest.Mock;

const phone = '+61491570006';

beforeEach(() => {
  mockDelete.mockReset().mockResolvedValue({ ok: true, data: undefined });
  mockSend.mockReset().mockResolvedValue({ ok: true, data: { phone } });
  mockSignOut.mockReset().mockResolvedValue({ ok: true, data: undefined });
});

afterEach(() => {
  jest.useRealTimers();
});

async function started(account: string | null = phone) {
  const hook = await renderHook(() => useAccountDeletion(account));
  let message: string | null | undefined;
  await act(async () => {
    message = await hook.result.current.start();
  });
  return { hook, message };
}

describe('useAccountDeletion', () => {
  it("texts a code to the account's own phone and opens the code step", async () => {
    const { hook, message } = await started();
    expect(message).toBeNull();
    expect(mockSend).toHaveBeenCalledWith(phone);
    expect(hook.result.current.stage).toBe('code');
    expect(hook.result.current.resendIn).toBe(RESEND_SECONDS);
  });

  it('stops when the account has no phone number', async () => {
    const { hook, message } = await started(null);
    expect(message).toMatch(/needs a phone number/);
    expect(mockSend).not.toHaveBeenCalled();
    expect(hook.result.current.stage).toBe('idle');
  });

  it('stays on the first step when the code cannot be sent', async () => {
    mockSend.mockResolvedValue({ ok: false, error: { code: 'RATE_LIMITED', message: 'x' } });
    const { hook, message } = await started();
    expect(message).toMatch(/Too many attempts/);
    expect(hook.result.current.stage).toBe('idle');
  });

  it('keeps only digits in the code', async () => {
    const { hook } = await started();
    await act(async () => hook.result.current.setCode('12 34-56789'));
    expect(hook.result.current.code).toBe('123456');
  });

  it('deletes the account with the code, then signs out', async () => {
    const { hook } = await started();
    await act(async () => hook.result.current.setCode('123456'));
    let message: string | null | undefined;
    await act(async () => {
      message = await hook.result.current.confirm();
    });
    expect(message).toBeNull();
    expect(mockDelete).toHaveBeenCalledWith('123456');
    expect(mockSignOut).toHaveBeenCalled();
    expect(hook.result.current.stage).toBe('idle');
  });

  it('does not call the function for an incomplete code', async () => {
    const { hook } = await started();
    await act(async () => hook.result.current.setCode('123'));
    await act(async () => {
      await hook.result.current.confirm();
    });
    expect(mockDelete).not.toHaveBeenCalled();
    expect(hook.result.current.error).toMatch(/isn't right/);
  });

  it.each([
    ['OTP_EXPIRED', /wrong or has expired/],
    ['NETWORK', /reach the server/],
    ['UNKNOWN', /could not delete your account/],
    ['NO_PROFILE', /could not delete your account/],
  ])('keeps the code step open with a message when deletion fails with %s', async (code, pattern) => {
    mockDelete.mockResolvedValue({ ok: false, error: { code, message: 'x' } });
    const { hook } = await started();
    await act(async () => hook.result.current.setCode('123456'));
    await act(async () => {
      await hook.result.current.confirm();
    });
    expect(hook.result.current.error).toMatch(pattern);
    expect(hook.result.current.stage).toBe('code');
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('only resends after the wait, then restarts the wait', async () => {
    jest.useFakeTimers();
    const { hook } = await started();
    await act(async () => {
      await hook.result.current.resend();
    });
    expect(mockSend).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(RESEND_SECONDS * 1000);
    });
    expect(hook.result.current.resendIn).toBe(0);
    await act(async () => {
      await hook.result.current.resend();
    });
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(hook.result.current.resendIn).toBe(RESEND_SECONDS);
  });

  it('cancel closes the code step', async () => {
    const { hook } = await started();
    await act(async () => hook.result.current.cancel());
    expect(hook.result.current.stage).toBe('idle');
  });
});
