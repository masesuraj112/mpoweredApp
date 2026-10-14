import {
  GENERAL_IMPACT_OPTIONS,
  LIFTING_OPTIONS,
  SITTING_OPTIONS,
  STANDING_OPTIONS,
  WALKING_OPTIONS,
} from '@/features/assessments/movement/options';
import { impactMessage, movementScore, toMovementSummary } from '@/features/assessments/movement/summary';

const answers = {
  generalImpacts: [GENERAL_IMPACT_OPTIONS[0], GENERAL_IMPACT_OPTIONS[1]],
  walking: WALKING_OPTIONS[1],
  lifting: LIFTING_OPTIONS[2],
  sitting: SITTING_OPTIONS[3],
  standing: STANDING_OPTIONS[4],
};

describe('movementScore', () => {
  it('adds the number of general impacts to the position of each single answer', () => {
    // 2 impacts + walking 1 + lifting 2 + sitting 3 + standing 4
    expect(movementScore(answers)).toBe(12);
  });

  it('scores the least-impact answers as 0, so only the general impacts count', () => {
    expect(
      movementScore({
        generalImpacts: [GENERAL_IMPACT_OPTIONS[0]],
        walking: WALKING_OPTIONS[0],
        lifting: LIFTING_OPTIONS[0],
        sitting: SITTING_OPTIONS[0],
        standing: STANDING_OPTIONS[0],
      }),
    ).toBe(1);
  });

  it('scores text that is not in the list as 0 instead of crashing', () => {
    expect(movementScore({ ...answers, walking: 'An old wording' })).toBe(11);
  });
});

describe('impactMessage', () => {
  it.each([
    [0, 'does not really impact'],
    [5, 'does not really impact'],
    [6, 'mildly impacts'],
    [10, 'mildly impacts'],
    [11, 'moderately impacts'],
    [15, 'moderately impacts'],
    [16, 'significantly impacting'],
  ])('a score of %i says "%s"', (score, wording) => {
    expect(impactMessage(score)).toContain(wording);
  });
});

const savedEntry = {
  submissionId: 5,
  date: '2026-10-01',
  weekStart: '2026-09-28',
  activeHours: 6,
  generalImpacts: [GENERAL_IMPACT_OPTIONS[0], GENERAL_IMPACT_OPTIONS[1]],
  walking: WALKING_OPTIONS[1],
  lifting: LIFTING_OPTIONS[2],
  sitting: SITTING_OPTIONS[3],
  standing: STANDING_OPTIONS[4],
  reflection: null,
};

describe('toMovementSummary', () => {
  it('shows the Monday to Sunday week as the period', () => {
    expect(toMovementSummary(savedEntry).period).toBe('28 Sep–04 Oct 2026');
  });

  it('keeps the saved answers and adds the score and message', () => {
    expect(toMovementSummary(savedEntry)).toMatchObject({
      activeHours: 6,
      reflection: null,
      totalScore: 12,
      message: impactMessage(12),
    });
  });
});