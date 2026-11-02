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

describe('mapError: errors raised by the save functions (P0001)', () => {
  it.each(['NO_PROFILE', 'FUTURE_DATE', 'BEFORE_START', 'NOT_FOUND'])('%s keeps its own code', (name) => {
    expect(mapError(dbError('P0001', name))).toEqual({ code: name, message: name });
  });

  it.each([
    'NO_LOCATION',
    'NO_CHARACTERISTIC',
    'VALUE_TOO_LONG',
    'NO_NAME',
    'MISSING_ANSWER',
    'MEDICATION_CONFLICT',
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

describe('mapError: errors raised by the Care Planner functions (P0001)', () => {
  it('CONSENT_REQUIRED keeps its own code', () => {
    expect(mapError(dbError('P0001', 'CONSENT_REQUIRED'))).toEqual({
      code: 'CONSENT_REQUIRED',
      message: 'CONSENT_REQUIRED',
    });
  });

  it('NOT_A_PATIENT means not allowed', () => {
    expect(mapError(dbError('P0001', 'NOT_A_PATIENT'))).toEqual({
      code: 'NOT_ALLOWED',
      message: 'NOT_A_PATIENT',
    });
  });

  it.each([
    'NO_DATE_TIME',
    'TOO_MANY_SUPPORT_PEOPLE',
    'INVALID_SUPPORT_PERSON',
    'UNKNOWN_QUESTION',
    'QUESTION_NOT_ON_PLAN',
    'NO_QUESTIONS',
    'INVALID_SIGNATURE',
    'INVALID_QUESTION',
    'INVALID_ANSWER',
    'APPOINTMENT_NOT_SAVED',
    'INVALID_ACCESS_TYPE',
    'DUPLICATE_SUPPORT_PERSON',
  ])('%s becomes VALIDATION and keeps the original code in detail', (name) => {
    expect(mapError(dbError('P0001', name))).toEqual({
      code: 'VALIDATION',
      message: name,
      detail: name,
    });
  });

  it('codes that already existed still map as before', () => {
    expect(mapError(dbError('P0001', 'VALUE_TOO_LONG')).detail).toBe('VALUE_TOO_LONG');
    expect(mapError(dbError('P0001', 'INVALID_PHONE')).code).toBe('INVALID_PHONE');
    expect(mapError(dbError('P0001', 'FUTURE_DATE')).code).toBe('FUTURE_DATE');
    expect(mapError(dbError('P0001', 'NOT_FOUND')).code).toBe('NOT_FOUND');
    expect(mapError(dbError('P0001', 'NO_PROFILE')).code).toBe('NO_PROFILE');
    expect(mapError(dbError('P0001', 'NO_SESSION')).code).toBe('NO_SESSION');
  });

  it('an unrecognised P0001 message is still unknown', () => {
    expect(mapError(dbError('P0001', 'NOT_A_THING')).code).toBe('UNKNOWN');
  });
});

describe('mapError: errors raised by the support person functions (P0001)', () => {
  it.each(['NOT_A_SUPPORT_PERSON', 'NO_QUESTIONS_PERMISSION', 'NO_ANSWERS_PERMISSION'])(
    '%s means not allowed and keeps its message',
    (name) => {
      expect(mapError(dbError('P0001', name))).toEqual({ code: 'NOT_ALLOWED', message: name });
    },
  );

  it('NO_QUESTIONS_PERMISSION is never read as the validation message NO_QUESTIONS inside it', () => {
    expect(mapError(dbError('P0001', 'NO_QUESTIONS_PERMISSION')).code).not.toBe('VALIDATION');
  });

  it('NO_QUESTIONS on its own is still a validation error', () => {
    expect(mapError(dbError('P0001', 'NO_QUESTIONS'))).toEqual({
      code: 'VALIDATION',
      message: 'NO_QUESTIONS',
      detail: 'NO_QUESTIONS',
    });
  });

  it.each(['REQUEST_NOT_FOUND', 'PATIENT_NOT_FOUND', 'APPOINTMENT_NOT_FOUND'])(
    '%s maps to NOT_FOUND and keeps its message, so the screen can say what was missing',
    (name) => {
      expect(mapError(dbError('P0001', name))).toEqual({ code: 'NOT_FOUND', message: name });
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
