import type { AppError, AppErrorCode } from '@/lib/errors';

import { carePlannerMessage, FALLBACK_MESSAGE, missingAssessmentsMessage } from './messages';

const RAW = 'raw database text P0001';

const error = (code: AppErrorCode, extra: Partial<AppError> = {}): AppError => ({
  code,
  message: RAW,
  ...extra,
});

const CODES_WITH_OWN_MESSAGE: AppErrorCode[] = [
  'CONSENT_REQUIRED',
  'INVALID_PHONE',
  'NOT_FOUND',
  'NO_PROFILE',
  'NO_SESSION',
  'NOT_ALLOWED',
  'NETWORK',
];

describe('carePlannerMessage', () => {
  it('has a friendly message for the codes the screens can show', () => {
    for (const code of CODES_WITH_OWN_MESSAGE) {
      const message = carePlannerMessage(error(code));
      expect(message).not.toBe(FALLBACK_MESSAGE);
      expect(message).not.toContain(RAW);
    }
  });

  it.each([
    'NO_QUESTIONS',
    'TOO_MANY_SUPPORT_PEOPLE',
    'DUPLICATE_SUPPORT_PERSON',
    'INVALID_SUPPORT_PERSON',
    'INVALID_ACCESS_TYPE',
    'NO_DATE_TIME',
    'VALUE_TOO_LONG',
    'INVALID_SIGNATURE',
    'APPOINTMENT_NOT_SAVED',
    'INVALID_ANSWER',
    'QUESTION_NOT_ON_PLAN',
    'UNKNOWN_QUESTION',
    'INVALID_QUESTION',
  ])('%s (a database validation) has its own message', (detail) => {
    const message = carePlannerMessage(error('VALIDATION', { detail, message: detail }));
    expect(message).not.toContain(detail);
    expect(message).not.toContain('_');
    expect(message).not.toBe(carePlannerMessage(error('VALIDATION')));
  });

  it.each(['INVALID_DATE_TIME', 'NAME_TOO_LONG'])(
    'the app-raised validation %s has its own message',
    (name) => {
      const message = carePlannerMessage({ code: 'VALIDATION', message: name });
      expect(message).not.toContain(name);
      expect(message).not.toBe(carePlannerMessage(error('VALIDATION')));
    },
  );

  it('says why a plan needs a question and why a third support person is refused', () => {
    expect(carePlannerMessage(error('VALIDATION', { detail: 'NO_QUESTIONS' }))).toMatch(/at least one question/i);
    expect(carePlannerMessage(error('VALIDATION', { detail: 'TOO_MANY_SUPPORT_PEOPLE' }))).toMatch(/two/i);
  });

  it('explains that consent is needed before answers are saved', () => {
    expect(carePlannerMessage(error('CONSENT_REQUIRED'))).toMatch(/consent/i);
  });

  it('never shows raw database text, whatever the code', () => {
    const codes: AppErrorCode[] = [
      'DUPLICATE_WEEK',
      'VALIDATION',
      'NOT_ALLOWED',
      'NO_SESSION',
      'NO_PROFILE',
      'FUTURE_DATE',
      'BEFORE_START',
      'NOT_FOUND',
      'INVALID_PHONE',
      'INVALID_OTP',
      'OTP_EXPIRED',
      'RATE_LIMITED',
      'PROFILE_EXISTS',
      'CONSENT_REQUIRED',
      'SMS_FAILED',
      'NETWORK',
      'UNKNOWN',
    ];
    for (const code of codes) {
      const message = carePlannerMessage(error(code, { detail: 'SOMETHING_ODD' }));
      expect(message).not.toContain(RAW);
      expect(message).not.toContain('SOMETHING_ODD');
      expect(message).not.toMatch(/[A-Z]+_[A-Z_]+/);
    }
  });

  it.each([
    ['NO_QUESTIONS_PERMISSION', /permission to change the questions/],
    ['NO_ANSWERS_PERMISSION', /permission to add the doctor’s answers/],
    ['NOT_A_SUPPORT_PERSON', /Only a support person account/],
  ])('says which permission is missing for NOT_ALLOWED with %s', (message, text) => {
    expect(carePlannerMessage(error('NOT_ALLOWED', { message }))).toMatch(text);
  });

  it.each([
    ['REQUEST_NOT_FOUND', /request is no longer available/],
    ['PATIENT_NOT_FOUND', /no longer supporting this person/],
    ['APPOINTMENT_NOT_FOUND', /can no longer see this appointment/],
  ])('says what was not found for NOT_FOUND with %s', (message, text) => {
    expect(carePlannerMessage(error('NOT_FOUND', { message }))).toMatch(text);
  });

  it('keeps the general NOT_ALLOWED and NOT_FOUND messages for other causes', () => {
    expect(carePlannerMessage(error('NOT_ALLOWED', { message: 'NOT_A_PATIENT' }))).toBe(
      'You cannot do that with this account.',
    );
    expect(carePlannerMessage(error('NOT_FOUND', { message: 'NOT_FOUND' }))).toBe(
      'We could not find that appointment. It may have been removed.',
    );
  });

  it('uses the fallback for codes it has no message for', () => {
    expect(carePlannerMessage(error('UNKNOWN'))).toBe(FALLBACK_MESSAGE);
    expect(carePlannerMessage(error('DUPLICATE_WEEK'))).toBe(FALLBACK_MESSAGE);
  });
});

describe('missingAssessmentsMessage', () => {
  it('names the assessments still to do, using the names shown in the app', () => {
    const message = missingAssessmentsMessage(['personalCare', 'management']);
    expect(message).toContain('Personal Care, Management');
    expect(message).toMatch(/Tracker/);
  });

  it('falls back to a plain message when nothing is missing', () => {
    expect(missingAssessmentsMessage([])).toBe('There are no suggested questions yet.');
  });
});
