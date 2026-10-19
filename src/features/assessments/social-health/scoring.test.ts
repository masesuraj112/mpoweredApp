import { SOCIAL_LIFE_OPTIONS, TRAVELLING_OPTIONS } from '@/constants/socialHealthOptions';
import { optionPoints, scoreSocialHealth } from '@/features/assessments/social-health/scoring';

const input = (socialLifePoints: number, travellingPoints: number, sliders: [number, number, number]) => ({
  socialLife: SOCIAL_LIFE_OPTIONS[socialLifePoints],
  travelling: TRAVELLING_OPTIONS[travellingPoints],
  mood: sliders[0],
  relationWithOthers: sliders[1],
  enjoymentOfLife: sliders[2],
});

describe('optionPoints', () => {
  it.each([
    ['social life', SOCIAL_LIFE_OPTIONS],
    ['travelling', TRAVELLING_OPTIONS],
  ])('gives 0 for the first %s statement and 5 for the last', (_label, options) => {
    expect(optionPoints(options[0], options)).toBe(0);
    expect(optionPoints(options[5], options)).toBe(5);
  });

  it('returns null for a statement that is not in the list', () => {
    expect(optionPoints('Something else', SOCIAL_LIFE_OPTIONS)).toBeNull();
  });
});

describe('scoreSocialHealth', () => {
  it.each([
    [0, 0, [0, 0, 0], 0, 'none', 'does not limit'],
    [0, 0, [4, 3, 3], 10, 'none', 'does not limit'],
    [0, 0, [4, 4, 3], 11, 'slight', 'slightly limits'],
    [3, 2, [5, 5, 5], 20, 'slight', 'slightly limits'],
    [3, 3, [5, 5, 5], 21, 'moderate', 'limits'],
    [3, 2, [10, 10, 5], 30, 'moderate', 'limits'],
    [3, 2, [10, 10, 6], 31, 'significant', 'significantly limits'],
    [5, 5, [10, 10, 10], 40, 'significant', 'significantly limits'],
  ] as const)(
    'statement points %i and %i with sliders %j give %i (%s)',
    (socialLife, travelling, sliders, total, band, phrase) => {
      expect(scoreSocialHealth(input(socialLife, travelling, [...sliders]))).toEqual({ total, band, phrase });
    },
  );

  it('returns null when a statement is not in its list', () => {
    expect(scoreSocialHealth({ ...input(0, 0, [1, 1, 1]), socialLife: 'An old wording' })).toBeNull();
    expect(scoreSocialHealth({ ...input(0, 0, [1, 1, 1]), travelling: 'An old wording' })).toBeNull();
  });
});
