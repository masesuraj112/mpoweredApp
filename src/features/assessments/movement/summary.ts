import {
  LIFTING_OPTIONS,
  SITTING_OPTIONS,
  STANDING_OPTIONS,
  WALKING_OPTIONS,
} from '@/features/assessments/movement/options';

/** An answer scores its position in the list: 0 for the first (least impact) up to 5. */
function scoreOf(options: readonly string[], answer: string): number {
  const index = options.indexOf(answer);
  return index === -1 ? 0 : index;
}

export type MovementAnswers = {
  generalImpacts: string[];
  walking: string;
  lifting: string;
  sitting: string;
  standing: string;
};

/**
 * The movement score: the number of general impacts ticked plus the position of each of the
 * four single answers. The active hours and the reflection do not count.
 */
export function movementScore(answers: MovementAnswers): number {
  return (
    answers.generalImpacts.length +
    scoreOf(WALKING_OPTIONS, answers.walking) +
    scoreOf(LIFTING_OPTIONS, answers.lifting) +
    scoreOf(SITTING_OPTIONS, answers.sitting) +
    scoreOf(STANDING_OPTIONS, answers.standing)
  );
}

export function impactMessage(score: number): string {
  if (score <= 5) return 'Your answers indicate that pain does not really impact your movement.';
  if (score <= 10) return 'Your answers indicate that pain mildly impacts your movement.';
  if (score <= 15) return 'Your answers indicate that pain moderately impacts your movement.';
  return 'Your answers indicate that pain is significantly impacting your movement. With the right support and treatment, your movement and mobility can improve.';
}