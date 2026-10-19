jest.mock('@/lib/supabase', () => ({ supabase: {} })); // summary.ts imports a type from the service

import {
  GENERAL_ACTIVITY_OPTIONS,
  PERSONAL_CARE_OPTIONS,
  SLEEPING_OPTIONS,
} from '@/features/assessments/personal-care/options';
import {
  impactMessage,
  personalCareScore,
  toPersonalCareSummary,
} from '@/features/assessments/personal-care/summary';

const entry = {
  submissionId: 3,
  date: '2026-10-01',
  weekStart: '2026-09-28',
  generalActivities: [GENERAL_ACTIVITY_OPTIONS[0], GENERAL_ACTIVITY_OPTIONS[1]],
  washingDressing: PERSONAL_CARE_OPTIONS[3],
  sleeping: SLEEPING_OPTIONS[1],
  reflection: 'A hard week',
};

const allFirst = {
  ...entry,
  generalActivities: [GENERAL_ACTIVITY_OPTIONS[0]],
  washingDressing: PERSONAL_CARE_OPTIONS[0],
  sleeping: SLEEPING_OPTIONS[0],
};

describe('personalCareScore', () => {
  it('adds the number of general activities to the position of each single answer', () => {
    // 2 activities + personal care 3 + sleeping 1
    expect(personalCareScore(entry)).toBe(6);
  });

  it('scores the least-impact answers as 0, so only the general activities count', () => {
    expect(personalCareScore(allFirst)).toBe(1);
  });

  it('does not count the reflection', () => {
    expect(personalCareScore({ ...entry, reflection: null })).toBe(personalCareScore(entry));
  });

  it('scores the worst possible answers as 5 activities + 5 + 5 = 15', () => {
    const worst = {
      ...entry,
      generalActivities: [...GENERAL_ACTIVITY_OPTIONS],
      washingDressing: PERSONAL_CARE_OPTIONS[5],
      sleeping: SLEEPING_OPTIONS[5],
    };
    expect(personalCareScore(worst)).toBe(15);
  });

  it('scores text that is no longer in the list as 0 instead of crashing', () => {
    expect(personalCareScore({ ...allFirst, sleeping: 'An old wording' })).toBe(1);
  });
});

describe('impactMessage', () => {
  it.each([
    [0, 'does not really impact'],
    [3, 'does not really impact'],
    [4, 'mildly impacts'],
    [7, 'mildly impacts'],
    [8, 'moderately impacts'],
    [11, 'moderately impacts'],
    [12, 'significantly impacting'],
    [15, 'significantly impacting'],
  ])('a score of %i says "%s"', (score, wording) => {
    expect(impactMessage(score)).toContain(wording);
  });
});

describe('toPersonalCareSummary', () => {
  it('shows the Monday to Sunday week as the period', () => {
    expect(toPersonalCareSummary(entry).period).toBe('28 Sep–04 Oct 2026');
  });

  it('keeps the saved answers and adds the score and message', () => {
    expect(toPersonalCareSummary(entry)).toMatchObject({
      generalActivities: [GENERAL_ACTIVITY_OPTIONS[0], GENERAL_ACTIVITY_OPTIONS[1]],
      personalCareLevel: PERSONAL_CARE_OPTIONS[3],
      sleepingLevel: SLEEPING_OPTIONS[1],
      reflection: 'A hard week',
      totalScore: 6,
      message: impactMessage(6),
    });
  });

  it('keeps a missing reflection as null so the screen can say so', () => {
    expect(toPersonalCareSummary({ ...entry, reflection: null }).reflection).toBeNull();
  });
});

describe('the option lists', () => {
  it.each([
    ['general activity', GENERAL_ACTIVITY_OPTIONS, 5],
    ['personal care', PERSONAL_CARE_OPTIONS, 6],
    ['sleeping', SLEEPING_OPTIONS, 6],
  ])('%s has %i answers, each different', (_name, options, count) => {
    expect(options).toHaveLength(count);
    expect(new Set(options).size).toBe(count);
  });
});