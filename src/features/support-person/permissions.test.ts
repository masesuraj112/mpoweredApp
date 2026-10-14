import { getAppointmentActions } from './permissions';

const both = { canAddQuestions: true, canAddAnswers: true };
const questionsOnly = { canAddQuestions: true, canAddAnswers: false };
const answersOnly = { canAddQuestions: false, canAddAnswers: true };
const neither = { canAddQuestions: false, canAddAnswers: false };

describe('getAppointmentActions', () => {
  it('lets a support person with both permissions add questions and answers to upcoming appointments', () => {
    expect(getAppointmentActions(both, true)).toEqual(['add-questions', 'add-answer']);
  });

  it('lets a support person with both permissions view questions and answers on past appointments', () => {
    expect(getAppointmentActions(both, false)).toEqual(['view-questions', 'view-answer']);
  });

  it('shows only question buttons with the questions permission (Jane in the designs)', () => {
    expect(getAppointmentActions(questionsOnly, true)).toEqual(['add-questions']);
    expect(getAppointmentActions(questionsOnly, false)).toEqual(['view-questions']);
  });

  it('shows only answer buttons with the answers permission', () => {
    expect(getAppointmentActions(answersOnly, true)).toEqual(['add-answer']);
    expect(getAppointmentActions(answersOnly, false)).toEqual(['view-answer']);
  });

  it('shows no buttons without either permission', () => {
    expect(getAppointmentActions(neither, true)).toEqual([]);
    expect(getAppointmentActions(neither, false)).toEqual([]);
  });
});
