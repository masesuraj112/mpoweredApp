import { mapError } from '@/lib/errors';

const dbError = (code: string, message: string) => ({ code, message });

describe('mapError: Postgres error codes', () => {
  it('a unique violation (23505) means a second submission in the same week', () => {
    expect(mapError(dbError('23505', 'duplicate key value')).code).toBe('DUPLICATE_WEEK');
  });

  it('a missing required value (23502) is a validation error, not unknown', () => {
    expect(mapError(dbError('23502', 'null value in column')).code).toBe('VALIDATION');
  });

  it('a failed check constraint (23514) is a validation error', () => {
    expect(mapError(dbError('23514', 'violates check constraint')).code).toBe('VALIDATION');
  });

  it('a permission failure (42501) means not allowed', () => {
    expect(mapError(dbError('42501', 'permission denied for table users')).code).toBe(
      'NOT_ALLOWED',
    );
  });
});

describe('mapError: errors raised by save_pain_assessment (P0001)', () => {
  it.each(['NO_PROFILE', 'FUTURE_DATE', 'BEFORE_START'])('%s keeps its own code', (name) => {
    expect(mapError(dbError('P0001', name))).toEqual({ code: name, message: name });
  });

  it.each(['NO_LOCATION', 'NO_CHARACTERISTIC', 'VALUE_TOO_LONG', 'MISSING_ANSWER'])(
    '%s becomes VALIDATION and keeps the original code in detail',
    (name) => {
      expect(mapError(dbError('P0001', name))).toEqual({
        code: 'VALIDATION',
        message: name,
        detail: name,
      });
    },
  );

  it('an unrecognised P0001 message is unknown', () => {
    expect(mapError(dbError('P0001', 'something else')).code).toBe('UNKNOWN');
  });
});

describe('mapError: errors raised by create_profile (P0001)', () => {
  it.each(['PROFILE_EXISTS', 'NO_SESSION', 'INVALID_PHONE'])('%s keeps its own code', (name) => {
    expect(mapError(dbError('P0001', name))).toEqual({ code: name, message: name });
  });

  it.each([
    'INVALID_NAME',
    'INVALID_SEX',
    'INVALID_YEAR',
    'INVALID_USER_TYPE',
    'INVALID_CONDITION',
  ])(
    '%s becomes VALIDATION and keeps the original code in detail',
    (name) => {
      expect(mapError(dbError('P0001', name))).toEqual({
        code: 'VALIDATION',
        message: name,
        detail: name,
      });
    },
  );
});

describe('mapError: Supabase Auth error codes', () => {
  it('an expired or unusable code (otp_expired) gives OTP_EXPIRED', () => {
    expect(mapError(dbError('otp_expired', 'Token has expired or is invalid')).code).toBe(
      'OTP_EXPIRED',
    );
  });

  it.each(['over_sms_send_rate_limit', 'over_request_rate_limit'])(
    '%s gives RATE_LIMITED',
    (code) => {
      expect(mapError(dbError(code, 'too many requests')).code).toBe('RATE_LIMITED');
    },
  );

  it('sms_send_failed gives SMS_FAILED', () => {
    expect(mapError(dbError('sms_send_failed', 'Error sending sms')).code).toBe('SMS_FAILED');
  });

  it('an unrecognised auth code gives UNKNOWN', () => {
    expect(mapError(dbError('some_new_auth_code', 'boom')).code).toBe('UNKNOWN');
  });
});

describe('mapError: everything else', () => {
  it('a failed network request gives NETWORK', () => {
    expect(mapError(new TypeError('Network request failed')).code).toBe('NETWORK');
    expect(mapError({ message: 'TypeError: Failed to fetch' }).code).toBe('NETWORK');
  });

  it('an unrecognised database code gives UNKNOWN', () => {
    expect(mapError(dbError('99999', 'boom')).code).toBe('UNKNOWN');
  });

  it('values that are not errors at all give UNKNOWN instead of crashing', () => {
    expect(mapError(null).code).toBe('UNKNOWN');
    expect(mapError(undefined).code).toBe('UNKNOWN');
    expect(mapError(42).code).toBe('UNKNOWN');
  });
});
