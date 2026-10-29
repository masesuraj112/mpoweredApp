jest.mock('@/services/care-planner', () => ({
  getQuestionSuggestions: jest.fn(),
  saveAppointmentQuestions: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';

import { getQuestionSuggestions, saveAppointmentQuestions } from '@/services/care-planner';

import type { QuestionSuggestions } from './suggestionTypes';
import { useAppointmentQuestions } from './useAppointmentQuestions';

const mockGet = getQuestionSuggestions as jest.Mock;
const mockSave = saveAppointmentQuestions as jest.Mock;

const suggestions = (overrides: Partial<QuestionSuggestions> = {}): QuestionSuggestions => ({
  appointmentStatus: 'draft',
  generatedOn: '2026-10-27',
  groups: [{ groupId: 'pain-location', title: 'Pain location', questions: [{ questionId: 1, text: 'Q1' }] }],
  selectedQuestionIds: [1],
  answeredQuestionIds: [],
  ...overrides,
});

async function setup() {
  const hook = await renderHook(() => useAppointmentQuestions(7));
  await waitFor(() => expect(hook.result.current.load.status).toBe('ready'));
  return hook;
}

beforeEach(() => {
  mockGet.mockReset();
  mockSave.mockReset().mockResolvedValue({ ok: true, data: undefined });
});

describe('useAppointmentQuestions: save', () => {
  it('saves the chosen questions', async () => {
    mockGet.mockResolvedValue({ ok: true, data: suggestions() });
    const { result } = await setup();
    let saved = false;
    await act(async () => {
      saved = await result.current.save();
    });
    expect(saved).toBe(true);
    expect(mockSave).toHaveBeenCalledWith(7, [1]);
  });

  it('succeeds without calling the service when no questions could be generated', async () => {
    mockGet.mockResolvedValue({
      ok: true,
      data: suggestions({ generatedOn: null, groups: [], selectedQuestionIds: [] }),
    });
    const { result } = await setup();
    let saved = false;
    await act(async () => {
      saved = await result.current.save();
    });
    expect(saved).toBe(true);
    expect(mockSave).not.toHaveBeenCalled();
    expect(result.current.saveError).toBeNull();
  });

  it('keeps the error when saving fails', async () => {
    mockGet.mockResolvedValue({ ok: true, data: suggestions() });
    mockSave.mockResolvedValue({ ok: false, error: { code: 'NETWORK', message: 'x' } });
    const { result } = await setup();
    let saved = true;
    await act(async () => {
      saved = await result.current.save();
    });
    expect(saved).toBe(false);
    expect(result.current.saveError).toMatchObject({ code: 'NETWORK' });
  });
});
