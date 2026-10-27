import { FIRST_TIME_ANSWERS_HINT, getReviewMode } from './reviewMode';

describe('getReviewMode', () => {
  it('is first-time for a draft appointment', () => {
    expect(getReviewMode({ status: 'draft' })).toBe('first-time');
  });

  it('is saved for a saved appointment', () => {
    expect(getReviewMode({ status: 'saved' })).toBe('saved');
  });
});

describe('FIRST_TIME_ANSWERS_HINT', () => {
  it('is the approved one-line wording', () => {
    expect(FIRST_TIME_ANSWERS_HINT).toBe('You can add the doctor’s answers after you save this plan.');
  });
});
