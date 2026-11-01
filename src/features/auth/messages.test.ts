import { authErrorMessage } from '@/features/auth/messages';
import type { AppErrorCode } from '@/lib/errors';

const authCodes: AppErrorCode[] = [
  'INVALID_PHONE',
  'INVALID_OTP',
  'OTP_EXPIRED',
  'RATE_LIMITED',
  'SMS_FAILED',
  'NETWORK',
];

describe('authErrorMessage', () => {
  it('has a distinct, friendly message for each sign-in failure', () => {
    const messages = authCodes.map(authErrorMessage);
    expect(new Set(messages).size).toBe(authCodes.length);
    messages.forEach((m) => expect(m.length).toBeGreaterThan(10));
  });

  it('tells the user a wrong code can be retried', () => {
    expect(authErrorMessage('INVALID_OTP')).toBe("That code isn't right. Check it and try again.");
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(authErrorMessage('UNKNOWN')).toBe('Something went wrong. Please try again.');
  });

  it('tells the user to wait, not that they did anything wrong, when rate limited', () => {
    expect(authErrorMessage('RATE_LIMITED')).toMatch(/wait/i);
  });

  it('asks the user to check the number when the text message cannot be sent', () => {
    expect(authErrorMessage('SMS_FAILED')).toMatch(/check your number/i);
  });

  it('asks for an Australian mobile when the number is not accepted', () => {
    expect(authErrorMessage('INVALID_PHONE')).toMatch(/australian mobile/i);
  });

  it('never reveals whether an account exists for the number', () => {
    const codes: AppErrorCode[] = [...authCodes, 'PROFILE_EXISTS', 'VALIDATION', 'UNKNOWN'];
    codes.forEach((code) => {
      expect(authErrorMessage(code)).not.toMatch(/already|exists|registered|no account|not found/i);
    });
  });
});
