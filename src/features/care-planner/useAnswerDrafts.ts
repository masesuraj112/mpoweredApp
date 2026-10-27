import { useCallback, useMemo, useState } from 'react';

import {
  changedAnswers,
  clampIndex,
  getDraftText,
  isDirty,
  setDraft,
  type Drafts,
} from './answerDrafts';
import type { PlanQuestion } from './planTypes';

/**
 * Holds the question being shown and every draft typed or dictated while the answer box is open.
 * Moving between questions keeps all drafts.
 */
export function useAnswerDrafts(questions: readonly PlanQuestion[], initialQuestionId: number) {
  const [index, setIndex] = useState(() =>
    clampIndex(
      questions.findIndex((question) => question.questionId === initialQuestionId),
      questions.length,
    ),
  );
  const [drafts, setDrafts] = useState<Drafts>({});

  const current = questions[index];

  const setText = useCallback((questionId: number, text: string) => {
    setDrafts((existing) => setDraft(existing, questionId, text));
  }, []);

  const goTo = useCallback(
    (next: number) => setIndex(clampIndex(next, questions.length)),
    [questions.length],
  );

  const getText = useCallback(
    (question: PlanQuestion) => getDraftText(drafts, question),
    [drafts],
  );

  return {
    index,
    count: questions.length,
    current,
    isFirst: index <= 0,
    isLast: index >= questions.length - 1,
    next: () => goTo(index + 1),
    previous: () => goTo(index - 1),
    text: current ? getText(current) : '',
    getText,
    setText,
    dirty: useMemo(() => isDirty(drafts, questions), [drafts, questions]),
    changed: useMemo(() => changedAnswers(drafts, questions), [drafts, questions]),
    discard: () => setDrafts({}),
  };
}
