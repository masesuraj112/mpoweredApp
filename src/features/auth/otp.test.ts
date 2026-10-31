import {
  OTP_LENGTH,
  RESEND_SECONDS,
  formatResendWait,
  isCodeComplete,
  sanitiseCode,
} from '@/features/auth/otp';

describe('sanitiseCode', () => {
  it('removes anything that is not a digit', () => {
    expect(sanitiseCode('12a 3-4')).toBe('1234');
  });

  it('cuts the code to six digits', () => {
    expect(sanitiseCode('12345678')).toBe('123456');
  });

  it('returns an empty string for empty input', () => {
    expect(sanitiseCode('')).toBe('');
  });
});

describe('isCodeComplete', () => {
  it('is true only for exactly six digits', () => {
    expect(isCodeComplete('123456')).toBe(true);
    expect(isCodeComplete('12345')).toBe(false);
    expect(isCodeComplete('1234567')).toBe(false);
    expect(isCodeComplete('')).toBe(false);
  });

  it('is false when the code contains a non-digit', () => {
    expect(isCodeComplete('12345a')).toBe(false);
    expect(isCodeComplete('12 456')).toBe(false);
  });
});

describe('formatResendWait', () => {
  it('uses the singular for exactly one minute', () => {
    expect(formatResendWait(60)).toBe('1 minute');
  });

  it('uses the plural for several minutes', () => {
    expect(formatResendWait(120)).toBe('2 minutes');
  });

  it('falls back to seconds when the wait is not a whole number of minutes', () => {
    expect(formatResendWait(45)).toBe('45 seconds');
    expect(formatResendWait(1)).toBe('1 second');
  });
});

describe('constants', () => {
  it('uses a six digit code and a one minute resend interval', () => {
    expect(OTP_LENGTH).toBe(6);
    expect(RESEND_SECONDS).toBe(60);
  });
});
