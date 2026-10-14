import {
  ADD_ANSWER_PROMPT,
  displayOrPlaceholder,
  formatShortAppointmentDate,
  getAnswerLine,
  getEditAnswerLabel,
  isPlanEmpty,
  NOT_PROVIDED_TEXT,
  VIEW_ANSWER_PROMPT,
} from './planDisplay';
import type { AppointmentPlan, PlanQuestion } from './planTypes';

const question = (overrides: Partial<PlanQuestion> = {}): PlanQuestion => ({
  questionId: 1,
  text: 'What could be causing my pain?',
  doctorAnswer: null,
  ...overrides,
});

const plan = (counts: number[]): AppointmentPlan => ({
  appointment: {
    appointmentId: 1,
    dateTime: '2026-06-10T09:30:00',
    practitionerName: 'Dr. Maximiliano Prinzi',
    healthService: 'General Practitioner (GP)',
    status: 'saved',
  },
  supportPersonName: null,
  recordingConsentedAt: null,
  questionGroups: counts.map((count, index) => ({
    groupId: `group-${index}`,
    title: `Group ${index}`,
    questions: Array.from({ length: count }, (_, i) => question({ questionId: i + 1 })),
  })),
});

describe('formatShortAppointmentDate', () => {
  it('uses a three letter month', () => {
    expect(formatShortAppointmentDate('2026-06-10T09:30:00')).toBe('10 Jun 2026');
  });

  it('abbreviates September as Sep, not the locale form', () => {
    expect(formatShortAppointmentDate('2026-09-01T08:00:00')).toBe('1 Sep 2026');
  });

  it('keeps the calendar day around midnight (no UTC shift)', () => {
    expect(formatShortAppointmentDate('2026-12-31T23:59:59')).toBe('31 Dec 2026');
    expect(formatShortAppointmentDate('2026-01-01T00:00:00')).toBe('1 Jan 2026');
  });

  it('returns an empty string for malformed or impossible dates', () => {
    expect(formatShortAppointmentDate('nope')).toBe('');
    expect(formatShortAppointmentDate('2026-02-30T09:00:00')).toBe('');
  });
});

describe('getAnswerLine', () => {
  it('prompts for an answer when there is none', () => {
    expect(getAnswerLine(question())).toEqual({ text: ADD_ANSWER_PROMPT, answered: false });
  });

  it('treats a blank answer as missing', () => {
    expect(getAnswerLine(question({ doctorAnswer: '   ' })).answered).toBe(false);
  });

  it('prompts to view the answer when there is one', () => {
    expect(getAnswerLine(question({ doctorAnswer: 'Likely posture.' }))).toEqual({
      text: VIEW_ANSWER_PROMPT,
      answered: true,
    });
  });
});

describe('getEditAnswerLabel', () => {
  it('says Add when unanswered and names the question', () => {
    expect(getEditAnswerLabel(question())).toBe(
      "Add doctor's answer for: What could be causing my pain?",
    );
  });

  it('says Edit when answered', () => {
    expect(getEditAnswerLabel(question({ doctorAnswer: 'Yes' }))).toBe(
      "Edit doctor's answer for: What could be causing my pain?",
    );
  });
});

describe('displayOrPlaceholder', () => {
  it('returns the trimmed value', () => {
    expect(displayOrPlaceholder('  Bron ')).toBe('Bron');
  });

  it('uses a placeholder for null, undefined and blank values', () => {
    expect(displayOrPlaceholder(null)).toBe(NOT_PROVIDED_TEXT);
    expect(displayOrPlaceholder(undefined)).toBe(NOT_PROVIDED_TEXT);
    expect(displayOrPlaceholder('   ')).toBe(NOT_PROVIDED_TEXT);
  });
});

describe('isPlanEmpty', () => {
  it('is true with no groups', () => {
    expect(isPlanEmpty(plan([]))).toBe(true);
  });

  it('is true when every group has no questions', () => {
    expect(isPlanEmpty(plan([0, 0]))).toBe(true);
  });

  it('is false when any group has a question', () => {
    expect(isPlanEmpty(plan([0, 2]))).toBe(false);
  });
});
