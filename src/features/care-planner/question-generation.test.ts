import type { PainEntry } from '@/services/assessments';
import type { AssessmentSet } from '@/services/health';

import {
  GENERATION_REQUIRES_ALL_ASSESSMENTS,
  generateQuestions,
  MAX_GENERATED_QUESTIONS,
  missingAssessments,
  MAX_QUESTION_LENGTH,
} from './question-generation';

const pain = (overrides: Partial<PainEntry> = {}): PainEntry => ({
  submissionId: 1,
  date: '2026-10-20',
  weekStart: '2026-10-19',
  current: 0,
  mildest: 2,
  worst: 9,
  average: 7,
  locations: ['lower back', 'neck', 'knee'],
  characteristics: [],
  ...overrides,
});

const base = { submissionId: 1, date: '2026-10-20', weekStart: '2026-10-19' };

const complete = (painEntry: PainEntry | null = pain()): AssessmentSet => ({
  pain: painEntry,
  movement: {
    ...base,
    averageActiveHours: 3,
    generalImpacts: [],
    walking: 'a',
    lifting: 'a',
    sitting: 'a',
    standing: 'a',
  },
  personalCare: { ...base, generalActivities: [], washingDressing: 'a', sleeping: 'a' },
  socialHealth: {
    ...base,
    socialLife: 'a',
    travelling: 'a',
    mood: 3,
    relationWithOthers: 3,
    enjoymentOfLife: 3,
    moodOverall: 'a',
  },
  management: { ...base, exercise: 'a', emotion: null, medications: [] },
});

const EMPTY: AssessmentSet = {
  pain: null,
  movement: null,
  personalCare: null,
  socialHealth: null,
  management: null,
};

describe('generateQuestions', () => {
  it('produces the 17 design questions, in display order, for the design example', () => {
    const questions = generateQuestions(complete());
    expect(questions).toHaveLength(17);
    expect(questions[0].question).toBe('What could be causing pain in my lower back, neck, and knee?');
    expect(questions.map((q) => q.groupKey)).toEqual([
      'pain-location',
      'pain-location',
      'pain-intensity',
      'pain-intensity',
      'pain-intensity',
      'pain-intensity',
      'pain-impact',
      'pain-impact',
      'pain-impact',
      'pain-impact',
      'pain-impact',
      'pain-impact',
      'pain-impact',
      'pain-impact',
      'management',
      'management',
      'management',
    ]);
  });

  it('fills the figures into the intensity questions', () => {
    const texts = generateQuestions(complete()).map((q) => q.question);
    expect(texts).toContain(
      'My average pain over the past two weeks has been around 7 — what does this indicate?',
    );
    expect(texts).toContain(
      'Even though I don’t have pain right now, I’ve had severe pain at times (up to 9). What could explain these flare-ups?',
    );
    expect(texts).toContain('Is it normal for pain to vary between mild (2) and very severe (9)?');
  });

  it('preselects the eight questions drawn ticked in the design', () => {
    const preselected = generateQuestions(complete())
      .map((q, index) => [index + 1, q.preselected] as const)
      .filter(([, selected]) => selected)
      .map(([position]) => position);
    expect(preselected).toEqual([1, 2, 3, 4, 6, 7, 9, 15]);
  });

  it('is deterministic', () => {
    expect(generateQuestions(complete())).toEqual(generateQuestions(complete()));
  });

  it('leaves no placeholder braces in any question, for a range of answers', () => {
    const variants = [
      pain(),
      pain({ locations: ['neck'] }),
      pain({ locations: ['neck', 'knee'], current: 4, mildest: 4, worst: 4 }),
      pain({ locations: [] }),
    ];
    for (const entry of variants) {
      for (const q of generateQuestions(complete(entry))) {
        expect(q.question).not.toMatch(/[{}]/);
      }
    }
  });

  it('uses a valid group key, a non-empty question and the length limit for every question', () => {
    for (const q of generateQuestions(complete())) {
      expect(q.groupKey).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(q.question.trim()).not.toBe('');
      expect(q.question.length).toBeLessThanOrEqual(MAX_QUESTION_LENGTH);
    }
  });

  it('has unique template keys', () => {
    const keys = generateQuestions(complete()).map((q) => q.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('stays within the total limit', () => {
    expect(generateQuestions(complete()).length).toBeLessThanOrEqual(MAX_GENERATED_QUESTIONS);
  });

  describe('conditional questions', () => {
    const texts = (entry: PainEntry) => generateQuestions(complete(entry)).map((q) => q.question);

    it('names a single area and drops the "are these areas related" question', () => {
      const result = texts(pain({ locations: ['neck'] }));
      expect(result[0]).toBe('What could be causing pain in my neck?');
      expect(result).not.toContain('Are these areas related, or are they likely separate issues?');
    });

    it('joins two areas with "and"', () => {
      expect(texts(pain({ locations: ['neck', 'knee'] }))[0]).toBe(
        'What could be causing pain in my neck and knee?',
      );
    });

    it('drops the flare-up question when there is pain right now', () => {
      expect(texts(pain({ current: 5 })).some((t) => t.includes('flare-ups'))).toBe(false);
    });

    it('drops the "vary between" question when the levels are the same', () => {
      expect(texts(pain({ mildest: 6, worst: 6 })).some((t) => t.includes('vary between'))).toBe(false);
    });

    it('cuts a very long list of areas short instead of exceeding the limit', () => {
      const locations = Array.from({ length: 30 }, (_, i) => `location number ${i}`);
      const first = generateQuestions(complete(pain({ locations })))[0].question;
      expect(first.length).toBeLessThanOrEqual(MAX_QUESTION_LENGTH);
      expect(first).toContain('and other areas');
    });
  });

  describe('the generation gate', () => {
    it('is on: all five assessments are required (M3)', () => {
      expect(GENERATION_REQUIRES_ALL_ASSESSMENTS).toBe(true);
    });

    it('gives nothing when no assessment has been completed', () => {
      expect(generateQuestions(EMPTY)).toEqual([]);
    });

    it('gives nothing when one assessment is missing', () => {
      expect(generateQuestions({ ...complete(), management: null })).toEqual([]);
      expect(generateQuestions({ ...complete(), movement: null })).toEqual([]);
    });

    it('gives nothing when there is no pain entry', () => {
      expect(generateQuestions(complete(null))).toEqual([]);
    });
  });
});

describe('missingAssessments', () => {
  it('lists every assessment when none is completed', () => {
    expect(missingAssessments(EMPTY)).toEqual([
      'pain',
      'movement',
      'personalCare',
      'socialHealth',
      'management',
    ]);
  });

  it('lists only the ones still missing, in the app order', () => {
    expect(missingAssessments({ ...complete(), movement: null, management: null })).toEqual([
      'movement',
      'management',
    ]);
  });

  it('is empty when all five are completed', () => {
    expect(missingAssessments(complete())).toEqual([]);
  });
});
