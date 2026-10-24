// Maps raw database / network errors to the small set of codes the app understands.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

export type AppErrorCode =
  | 'DUPLICATE_WEEK'
  | 'VALIDATION'
  | 'NOT_ALLOWED'
  | 'NO_SESSION'
  | 'NO_PROFILE'
  | 'FUTURE_DATE'
  | 'BEFORE_START'
  | 'NOT_FOUND'
  | 'INVALID_PHONE'
  | 'INVALID_OTP'
  | 'OTP_EXPIRED'
  | 'RATE_LIMITED'
  | 'PROFILE_EXISTS'
  | 'SMS_FAILED'
  | 'NETWORK'
  | 'UNKNOWN';

export type AppError = {
  code: AppErrorCode;
  message: string;
  /** For VALIDATION errors raised by a save function: the original message code. */
  detail?: string;
  /** For VALIDATION errors raised by the app: the answer that failed (for example 'worstPain'). */
  field?: string;
};

// P0001 messages raised by the save functions that keep their own code
const PASSTHROUGH_CODES = [
  'NO_PROFILE',
  'FUTURE_DATE',
  'BEFORE_START',
  'NOT_FOUND',
  'PROFILE_EXISTS',
  'NO_SESSION',
  'INVALID_PHONE',
] as const;
// P0001 messages that the app treats as a validation problem
const VALIDATION_MESSAGES = [
  'NO_LOCATION',
  'NO_CHARACTERISTIC',
  'NO_ACTIVITY',
  'NO_IMPACT',
  'MISSING_ANSWER',
  'INVALID_HOURS',
  'VALUE_TOO_LONG',
  'INVALID_NAME',
  'INVALID_SEX',
  'INVALID_YEAR',
  'INVALID_USER_TYPE',
  'INVALID_CONDITION',
  'MEDICATION_CONFLICT',
  'NO_NAME',
] as const;

export function mapError(error: unknown): AppError {
  const { code, message } = readError(error);

  switch (code) {
    case '23505':
      return { code: 'DUPLICATE_WEEK', message };
    case '23502':
    case '23514':
      return { code: 'VALIDATION', message };
    case '42501':
      return { code: 'NOT_ALLOWED', message };
    // Supabase Auth error codes (AuthApiError.code), checked against @supabase/auth-js ErrorCode
    case 'otp_expired':
      return { code: 'OTP_EXPIRED', message };
    case 'over_sms_send_rate_limit':
    case 'over_request_rate_limit':
      return { code: 'RATE_LIMITED', message };
    case 'sms_send_failed':
      return { code: 'SMS_FAILED', message };
    case 'P0001': {
      const passthrough = PASSTHROUGH_CODES.find((c) => message.includes(c));
      if (passthrough) return { code: passthrough, message };
      const validation = VALIDATION_MESSAGES.find((c) => message.includes(c));
      if (validation) return { code: 'VALIDATION', message, detail: validation };
      return { code: 'UNKNOWN', message };
    }
  }

  if (!code && isNetworkFailure(error, message)) {
    return { code: 'NETWORK', message };
  }
  return { code: 'UNKNOWN', message };
}

function readError(error: unknown): { code: string; message: string } {
  if (typeof error === 'object' && error !== null) {
    const { code, message } = error as { code?: unknown; message?: unknown };
    return {
      code: typeof code === 'string' ? code : '',
      message: typeof message === 'string' ? message : '',
    };
  }
  return { code: '', message: typeof error === 'string' ? error : '' };
}

function isNetworkFailure(error: unknown, message: string): boolean {
  return (
    error instanceof TypeError ||
    /network request failed|failed to fetch|fetch failed|network error/i.test(message)
  );
}
