import {
  LIFTING_OPTIONS,
  SITTING_OPTIONS,
  STANDING_OPTIONS,
  WALKING_OPTIONS,
} from '@/features/assessments/movement/options';

import { formatWeekRange } from '@/features/assessments/week';
import type { MovementEntry } from '@/services/assessments';

/** An answer scores its position in the list: 0 for the first (least impact) up to 5. */
export function scoreOf(options: readonly string[], answer: string | undefined): number {
  const index = answer === undefined ? -1 : options.indexOf(answer);
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

export type MovementSummaryData = {
  period: string;
  activeHours: number;
  generalImpacts: string[];
  walking: string;
  lifting: string;
  sitting: string;
  standing: string;
  /** Null when the user wrote no reflection. */
  reflection: string | null;
  totalScore: number;
  message: string;
};

export function toMovementSummary(entry: MovementEntry): MovementSummaryData {
  const totalScore = movementScore(entry);
  return {
    period: formatWeekRange(entry.weekStart),
    activeHours: entry.activeHours,
    generalImpacts: entry.generalImpacts,
    walking: entry.walking,
    lifting: entry.lifting,
    sitting: entry.sitting,
    standing: entry.standing,
    reflection: entry.reflection,
    totalScore,
    message: impactMessage(totalScore),
  };
}