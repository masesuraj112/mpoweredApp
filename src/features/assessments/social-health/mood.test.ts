import { MOOD_OVERALL_VALUES, toMoodOverall } from '@/features/assessments/social-health/mood';

describe('toMoodOverall', () => {
  it.each([
    ['frustrated', 'I was feeling frustrated'],
    ['sad', 'I was feeling sad'],
    ['okay', 'I was feeling okay'],
    ['calm', 'I was feeling calm'],
    ['delighted', 'I was feeling delighted'],
  ])('maps %j to %j', (value, sentence) => {
    expect(toMoodOverall(value)).toBe(sentence);
  });

  it('returns null for an unknown word', () => {
    expect(toMoodOverall('angry')).toBeNull();
    expect(toMoodOverall('Calm')).toBeNull();
  });

  it('returns null when no mood was chosen', () => {
    expect(toMoodOverall(undefined)).toBeNull();
  });
});

describe('MOOD_OVERALL_VALUES', () => {
  it('lists exactly the five sentences chk_mood_overall accepts', () => {
    expect(MOOD_OVERALL_VALUES).toEqual([
      'I was feeling frustrated',
      'I was feeling sad',
      'I was feeling okay',
      'I was feeling calm',
      'I was feeling delighted',
    ]);
  });
});
