import {
  appendDictatedText,
  changedAnswers,
  clampIndex,
  getDraftText,
  isDirty,
  setDraft,
} from './answerDrafts';
import type { PlanQuestion } from './planTypes';

const questions: PlanQuestion[] = [
  { questionId: 1, text: 'One?', doctorAnswer: null },
  { questionId: 2, text: 'Two?', doctorAnswer: 'Saved answer' },
  { questionId: 3, text: 'Three?', doctorAnswer: null },
];

describe('getDraftText', () => {
  it('falls back to the saved answer, then to empty', () => {
    expect(getDraftText({}, questions[1])).toBe('Saved answer');
    expect(getDraftText({}, questions[0])).toBe('');
  });

  it('prefers a draft, even an empty one', () => {
    expect(getDraftText({ 2: 'New' }, questions[1])).toBe('New');
    expect(getDraftText({ 2: '' }, questions[1])).toBe('');
  });
});

describe('setDraft', () => {
  it('returns a new object and keeps other drafts', () => {
    const before = { 1: 'a' };
    const after = setDraft(before, 2, 'b');
    expect(after).toEqual({ 1: 'a', 2: 'b' });
    expect(before).toEqual({ 1: 'a' });
  });
});

describe('isDirty', () => {
  it('is false with no drafts', () => {
    expect(isDirty({}, questions)).toBe(false);
  });

  it('is true when a draft differs from the saved answer', () => {
    expect(isDirty({ 1: 'typed' }, questions)).toBe(true);
    expect(isDirty({ 2: 'Changed' }, questions)).toBe(true);
  });

  it('is false when a draft is typed back to the saved answer', () => {
    expect(isDirty({ 2: 'Saved answer' }, questions)).toBe(false);
    expect(isDirty({ 2: '  Saved answer ' }, questions)).toBe(false);
  });

  it('treats an empty draft on an unanswered question as unchanged', () => {
    expect(isDirty({ 1: '   ' }, questions)).toBe(false);
  });

  it('is true when a saved answer is cleared', () => {
    expect(isDirty({ 2: '' }, questions)).toBe(true);
  });
});

describe('changedAnswers', () => {
  it('lists every edited question, trimmed, and nothing else', () => {
    expect(changedAnswers({ 1: ' typed ', 2: 'Saved answer', 3: 'third' }, questions)).toEqual([
      { questionId: 1, answerText: 'typed' },
      { questionId: 3, answerText: 'third' },
    ]);
  });

  it('uses an empty text to clear a saved answer', () => {
    expect(changedAnswers({ 2: '' }, questions)).toEqual([{ questionId: 2, answerText: '' }]);
  });

  it('ignores drafts for questions that are not in the list', () => {
    expect(changedAnswers({ 99: 'x' }, questions)).toEqual([]);
  });
});

describe('appendDictatedText', () => {
  it('returns the dictated text when there is nothing yet', () => {
    expect(appendDictatedText('', 'hello there')).toBe('hello there');
    expect(appendDictatedText('   ', 'hello')).toBe('hello');
  });

  it('adds one space after existing text', () => {
    expect(appendDictatedText('Pain in my knee', 'and my back')).toBe('Pain in my knee and my back');
  });

  it('does not double the space when the text already ends with one', () => {
    expect(appendDictatedText('Pain in my knee ', 'and my back')).toBe('Pain in my knee and my back');
    expect(appendDictatedText('Line one\n', 'line two')).toBe('Line one\nline two');
  });

  it('trims the dictated text', () => {
    expect(appendDictatedText('A', '  b  ')).toBe('A b');
  });

  it('leaves the text alone when the result is whitespace only', () => {
    expect(appendDictatedText('Keep this', '   ')).toBe('Keep this');
    expect(appendDictatedText('Keep this', '')).toBe('Keep this');
  });

  it('never replaces existing text', () => {
    expect(appendDictatedText('Existing', 'new')).toContain('Existing');
  });
});

describe('clampIndex', () => {
  it('keeps the index in range', () => {
    expect(clampIndex(-1, 3)).toBe(0);
    expect(clampIndex(1, 3)).toBe(1);
    expect(clampIndex(5, 3)).toBe(2);
  });

  it('returns 0 for an empty list', () => {
    expect(clampIndex(2, 0)).toBe(0);
  });
});
