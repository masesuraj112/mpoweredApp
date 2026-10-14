import {
  getSuggestionLabel,
  hasSelectionChanged,
  isQuestionSelected,
  needsRemovalConfirmation,
  toggleQuestion,
} from './suggestionSelection';

describe('toggleQuestion', () => {
  it('adds a question that is not chosen', () => {
    expect(toggleQuestion([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('removes a question that is chosen', () => {
    expect(toggleQuestion([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it('does not change the input', () => {
    const input = [1, 2];
    toggleQuestion(input, 3);
    expect(input).toEqual([1, 2]);
  });

  it('works from an empty selection', () => {
    expect(toggleQuestion([], 5)).toEqual([5]);
  });
});

describe('isQuestionSelected', () => {
  it('reports membership', () => {
    expect(isQuestionSelected([1, 2], 2)).toBe(true);
    expect(isQuestionSelected([1, 2], 3)).toBe(false);
  });
});

describe('hasSelectionChanged', () => {
  it('is false for the same questions in any order', () => {
    expect(hasSelectionChanged([1, 2, 3], [3, 1, 2])).toBe(false);
  });

  it('is true when a question is added or removed', () => {
    expect(hasSelectionChanged([1, 2], [1, 2, 3])).toBe(true);
    expect(hasSelectionChanged([1, 2, 3], [1, 2])).toBe(true);
  });

  it('is true when one question is swapped for another', () => {
    expect(hasSelectionChanged([1, 2], [1, 3])).toBe(true);
  });

  it('is false for two empty selections', () => {
    expect(hasSelectionChanged([], [])).toBe(false);
  });
});

describe('needsRemovalConfirmation', () => {
  it('is true for a chosen question that has an answer', () => {
    expect(needsRemovalConfirmation([1, 2], [2], 2)).toBe(true);
  });

  it('is false for a chosen question with no answer', () => {
    expect(needsRemovalConfirmation([1, 2], [2], 1)).toBe(false);
  });

  it('is false when the question is not chosen yet (ticking it on)', () => {
    expect(needsRemovalConfirmation([1], [2], 2)).toBe(false);
  });
});

describe('getSuggestionLabel', () => {
  it('says what ticking does and names the question', () => {
    expect(getSuggestionLabel('What can I do?')).toBe(
      'Add to my appointment plan: What can I do?',
    );
  });
});
