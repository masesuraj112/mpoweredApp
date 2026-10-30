import { canAnswerNow, getAppointmentActions, getPlanAccess, isAccessChanged } from './permissions';

const both = { canAddQuestions: true, canAddAnswers: true };
const questionsOnly = { canAddQuestions: true, canAddAnswers: false };
const answersOnly = { canAddQuestions: false, canAddAnswers: true };
const neither = { canAddQuestions: false, canAddAnswers: false };

describe('getAppointmentActions', () => {
  it('lets a support person with both permissions add questions and answers to upcoming appointments', () => {
    expect(getAppointmentActions(both, true)).toEqual(['add-questions', 'add-answer']);
  });

  it('lets a support person with both permissions view questions and answers on past appointments', () => {
    expect(getAppointmentActions(both, false)).toEqual(['view-questions', 'view-answer']);
  });

  it('shows only question buttons with the questions permission (Jane in the designs)', () => {
    expect(getAppointmentActions(questionsOnly, true)).toEqual(['add-questions']);
    expect(getAppointmentActions(questionsOnly, false)).toEqual(['view-questions']);
  });

  it('shows only answer buttons with the answers permission', () => {
    expect(getAppointmentActions(answersOnly, true)).toEqual(['add-answer']);
    expect(getAppointmentActions(answersOnly, false)).toEqual(['view-answer']);
  });

  it('still lets a support person without either permission view the plan (SRS edge case 3.3)', () => {
    expect(getAppointmentActions(neither, true)).toEqual(['view-plan']);
    expect(getAppointmentActions(neither, false)).toEqual(['view-plan']);
  });
});

describe('getPlanAccess', () => {
  it.each([
    ['no permissions', neither, { canEditQuestions: false, canEditAnswers: false }],
    ['questions only', questionsOnly, { canEditQuestions: true, canEditAnswers: false }],
    ['answers only', answersOnly, { canEditQuestions: false, canEditAnswers: true }],
    ['both', both, { canEditQuestions: true, canEditAnswers: true }],
  ])('%s', (_name, patient, expected) => {
    expect(getPlanAccess(patient)).toEqual(expected);
  });
});

describe('canAnswerNow', () => {
  const withAnswers = { canEditQuestions: false, canEditAnswers: true };

  it('needs the answers permission and recorded consent (S3)', () => {
    expect(canAnswerNow(withAnswers, '2026-11-05T03:30:00Z')).toBe(true);
  });

  it('is false before the patient records consent, even with the permission', () => {
    expect(canAnswerNow(withAnswers, null)).toBe(false);
  });

  it('is false without the answers permission, even with consent', () => {
    expect(canAnswerNow({ canEditQuestions: true, canEditAnswers: false }, '2026-11-05T03:30:00Z')).toBe(false);
  });
});

describe('isAccessChanged', () => {
  it.each(['NOT_ALLOWED', 'NOT_FOUND'] as const)('is true for %s (permission changed, removed or unpaired)', (code) => {
    expect(isAccessChanged({ code })).toBe(true);
  });

  it.each(['NETWORK', 'CONSENT_REQUIRED', 'VALIDATION', 'UNKNOWN'] as const)('is false for %s', (code) => {
    expect(isAccessChanged({ code })).toBe(false);
  });
});
