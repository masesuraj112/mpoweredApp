jest.mock('@/lib/supabase', () => ({ supabase: {} })); // summary.ts imports a type from the service

import { SOCIAL_LIFE_OPTIONS, TRAVELLING_OPTIONS } from '@/constants/socialHealthOptions';
import { toSocialHealthSummary } from '@/features/assessments/social-health/summary';

const entry = {
  submissionId: 7,
  date: '2026-10-01',
  weekStart: '2026-09-28',
  socialLife: SOCIAL_LIFE_OPTIONS[3],
  travelling: TRAVELLING_OPTIONS[3],
  mood: 0,
  relationWithOthers: 10,
  enjoymentOfLife: 5,
  moodOverall: 'I was feeling frustrated',
  reflection: 'Work was busy',
};

describe('toSocialHealthSummary', () => {
  it('shows the Monday to Sunday week as the period', () => {
    expect(toSocialHealthSummary(entry).period).toBe('28 Sep–04 Oct 2026');
  });

  it('uses the phrase for the score band (3 + 3 + 0 + 10 + 5 = 21: limits)', () => {
    expect(toSocialHealthSummary(entry).impactPhrase).toBe('limits');
    expect(toSocialHealthSummary({ ...entry, enjoymentOfLife: 4 }).impactPhrase).toBe('slightly limits');
  });

  it('shows the statements as full sentences', () => {
    const { results } = toSocialHealthSummary(entry);
    expect(results.socialLife).toBe('Pain has restricted my social life and I do not go out as often.');
    expect(results.travelling).toBe('Pain restricts me to journeys of less than one hour.');
  });

  it('describes each slider with the existing wording, including 0 and 10', () => {
    const { results } = toSocialHealthSummary(entry);
    expect(results.mood).toBe('Pain does not impact my mood at all.');
    expect(results.relationWithOthers).toBe('Pain completely interferes with my relationships with others.');
    expect(results.enjoymentOfLife).toBe('Pain moderately impacts my ability to enjoy life.');
  });

  it('shows the stored mood sentence and the triggers', () => {
    const summary = toSocialHealthSummary(entry);
    expect(summary.generalMood).toBe('I was feeling frustrated');
    expect(summary.triggers).toBe('Work was busy');
  });

  it('shows "No triggers added." when there is no reflection', () => {
    expect(toSocialHealthSummary({ ...entry, reflection: null }).triggers).toBe('No triggers added.');
  });

  it('gives no impact phrase when a stored statement is not in its list', () => {
    expect(toSocialHealthSummary({ ...entry, travelling: 'An old wording' }).impactPhrase).toBeNull();
  });
});
