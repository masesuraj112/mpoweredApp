jest.mock('@/services/support-person', () => ({
  getSupportedQuestionSuggestions: jest.fn(),
  saveSupportedQuestions: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { QuestionSuggestions } from '@/features/care-planner/suggestionTypes';
import * as service from '@/services/support-person';

import { useSupportedAppointmentQuestions } from './useSupportedAppointmentQuestions';

const mocked = service as jest.Mocked<typeof service>;

// Questions 1, 3 and 5 are on the plan; 1 and 5 have the doctor's answers.
const suggestions: QuestionSuggestions = {
  appointmentStatus: 'saved',
  generatedOn: '2026-10-01',
  groups: [
    {
      groupId: 'pain-location',
      title: 'Pain location',
      questions: [
        { questionId: 1, text: 'Q1' },
        { questionId: 2, text: 'Q2' },
      ],
    },
    {
      groupId: 'management',
      title: 'Management',
      questions: [
        { questionId: 3, text: 'Q3' },
        { questionId: 5, text: 'Q5' },
      ],
    },
  ],
  selectedQuestionIds: [1, 3, 5],
  answeredQuestionIds: [1, 5],
};

async function setup(canEditAnswers: boolean) {
  const hook = await renderHook(() => useSupportedAppointmentQuestions(102, canEditAnswers));
  await waitFor(() => expect(hook.result.current.load.status).toBe('ready'));
  return hook;
}

beforeEach(() => {
  jest.resetAllMocks();
  mocked.getSupportedQuestionSuggestions.mockResolvedValue({ ok: true, data: suggestions });
  mocked.saveSupportedQuestions.mockResolvedValue({ ok: true, data: undefined });
});

describe('useSupportedAppointmentQuestions', () => {
  it('loads the suggestions with the chosen questions ticked', async () => {
    const { result } = await setup(false);
    expect(mocked.getSupportedQuestionSuggestions).toHaveBeenCalledWith(102);
    expect(result.current.selectedIds).toEqual([1, 3, 5]);
    expect(result.current.dirty).toBe(false);
  });

  it('lets any question without an answer be ticked or unticked freely', async () => {
    const { result } = await setup(false);
    expect(result.current.tapRule(2)).toBe('free');
    expect(result.current.tapRule(3)).toBe('free');
  });

  it('blocks removing an answered question without the answers permission', async () => {
    const { result } = await setup(false);
    expect(result.current.tapRule(1)).toBe('blocked');
  });

  it('asks before removing an answered question with the answers permission', async () => {
    const { result } = await setup(true);
    expect(result.current.tapRule(1)).toBe('confirm');
  });

  it('saves the new choice and is no longer dirty', async () => {
    const { result } = await setup(false);
    await act(() => result.current.toggle(2));
    expect(result.current.dirty).toBe(true);

    let saved = false;
    await act(async () => {
      saved = await result.current.save();
    });

    expect(saved).toBe(true);
    expect(result.current.dirty).toBe(false);
    const [appointmentId, questionIds] = mocked.saveSupportedQuestions.mock.calls[0];
    expect(appointmentId).toBe(102);
    expect([...questionIds].sort()).toEqual([1, 2, 3, 5]);
  });

  it('keeps the changes and reports the error when saving fails', async () => {
    mocked.saveSupportedQuestions.mockResolvedValue({
      ok: false,
      error: { code: 'NOT_ALLOWED', message: 'NO_QUESTIONS_PERMISSION' },
    });
    const { result } = await setup(false);
    await act(() => result.current.toggle(2));

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveError?.code).toBe('NOT_ALLOWED');
    expect(result.current.dirty).toBe(true);
    expect(result.current.selectedIds).toContain(2);
  });
});
