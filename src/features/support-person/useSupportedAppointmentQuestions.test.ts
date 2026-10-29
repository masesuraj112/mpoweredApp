import { act, renderHook, waitFor } from '@testing-library/react-native';

import * as service from '@/services/support-person';

import { useSupportedAppointmentQuestions } from './useSupportedAppointmentQuestions';

// Sample data: appointment 102 is Jane's past appointment (questions only), with questions 1, 3
// and 5 chosen and 1 and 5 answered. Appointment 111 is Steven's (both permissions).
async function setup(appointmentId: number, canEditAnswers: boolean) {
  const hook = await renderHook(() => useSupportedAppointmentQuestions(appointmentId, canEditAnswers));
  await waitFor(() => expect(hook.result.current.load.status).toBe('ready'));
  return hook;
}

beforeEach(() => {
  service.resetMockSupportPerson();
  service.resetMockSupportedPlans();
});
afterEach(() => jest.restoreAllMocks());

describe('useSupportedAppointmentQuestions', () => {
  it('loads the suggestions with the chosen questions ticked', async () => {
    const { result } = await setup(102, false);
    expect(result.current.selectedIds).toEqual([1, 3, 5]);
    expect(result.current.dirty).toBe(false);
  });

  it('lets any question without an answer be ticked or unticked freely', async () => {
    const { result } = await setup(102, false);
    expect(result.current.tapRule(2)).toBe('free');
    expect(result.current.tapRule(3)).toBe('free');
  });

  it('blocks removing an answered question without the answers permission', async () => {
    const { result } = await setup(102, false);
    expect(result.current.tapRule(1)).toBe('blocked');
  });

  it('asks before removing an answered question with the answers permission', async () => {
    const { result } = await setup(111, true);
    expect(result.current.tapRule(1)).toBe('confirm');
  });

  it('saves the new choice and is no longer dirty', async () => {
    const { result } = await setup(102, false);
    await act(() => result.current.toggle(2));
    expect(result.current.dirty).toBe(true);

    let saved = false;
    await act(async () => {
      saved = await result.current.save();
    });

    expect(saved).toBe(true);
    expect(result.current.dirty).toBe(false);
    const plan = await service.getSupportedAppointmentPlan(102);
    expect(plan.ok && plan.data.questionGroups.flatMap(g => g.questions.map(q => q.questionId))).toEqual([1, 2, 3, 5]);
  });

  it('keeps the changes and reports the error when saving fails', async () => {
    jest
      .spyOn(service, 'saveSupportedQuestions')
      .mockResolvedValue({ ok: false, error: { code: 'NOT_ALLOWED', message: 'NO_QUESTIONS_PERMISSION' } });
    const { result } = await setup(102, false);
    await act(() => result.current.toggle(2));

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveError?.code).toBe('NOT_ALLOWED');
    expect(result.current.dirty).toBe(true);
    expect(result.current.selectedIds).toContain(2);
  });
});
