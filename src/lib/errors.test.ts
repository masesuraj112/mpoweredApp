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

  it.each(['NO_LOCATION', 'NO_CHARACTERISTIC', 'VALUE_TOO_LONG'])(
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
