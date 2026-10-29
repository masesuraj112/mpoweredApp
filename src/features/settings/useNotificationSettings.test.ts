jest.mock('@/services/settings', () => ({
  getNotificationSettings: jest.fn(),
  saveNotificationSettings: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';

import { getNotificationSettings, saveNotificationSettings, type NotificationSettings } from '@/services/settings';

import { useNotificationSettings } from './useNotificationSettings';

const mockGet = getNotificationSettings as jest.Mock;
const mockSave = saveNotificationSettings as jest.Mock;

const defaults: NotificationSettings = {
  assessmentReminders: false,
  assessmentEvery: 3,
  assessmentUnit: 'days',
  appointmentReminders: false,
  appointmentDayBefore: false,
  appointmentOnDay: false,
};

async function setup() {
  const hook = await renderHook(() => useNotificationSettings());
  await waitFor(() => expect(hook.result.current.settings).not.toBeNull());
  return hook;
}

beforeEach(() => {
  mockGet.mockReset().mockResolvedValue({ ok: true, data: defaults });
  mockSave.mockReset().mockResolvedValue({ ok: true, data: undefined });
});

describe('useNotificationSettings', () => {
  it('loads the settings', async () => {
    const { result } = await setup();
    expect(result.current.state.status).toBe('ready');
    expect(result.current.settings).toEqual(defaults);
  });

  it('shows an error when the settings cannot be loaded, and reloads on retry', async () => {
    mockGet.mockResolvedValueOnce({ ok: false, error: { code: 'NETWORK', message: 'x' } });
    const hook = await renderHook(() => useNotificationSettings());
    await waitFor(() => expect(hook.result.current.state.status).toBe('error'));
    expect(hook.result.current.settings).toBeNull();

    await act(async () => hook.result.current.reload());
    await waitFor(() => expect(hook.result.current.settings).toEqual(defaults));
  });

  it('shows a change straight away and saves all the settings', async () => {
    const { result } = await setup();
    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.update({ assessmentReminders: true });
    });
    expect(saved).toBe(true);
    expect(mockSave).toHaveBeenCalledWith({ ...defaults, assessmentReminders: true });
    expect(result.current.settings).toEqual({ ...defaults, assessmentReminders: true });
    expect(result.current.saveError).toBeNull();
  });

  it('puts the previous value back and sets an error when the save fails', async () => {
    const error = { code: 'NETWORK', message: 'x' };
    mockSave.mockResolvedValue({ ok: false, error });
    const { result } = await setup();
    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.update({ assessmentEvery: 2, assessmentUnit: 'weeks' });
    });
    expect(saved).toBe(false);
    expect(result.current.settings).toEqual(defaults);
    expect(result.current.saveError).toEqual(error);

    await act(async () => result.current.clearSaveError());
    expect(result.current.saveError).toBeNull();
  });

  it('does not let a slow failure undo a newer change', async () => {
    let failFirst: (value: unknown) => void = () => undefined;
    mockSave
      .mockImplementationOnce(() => new Promise((resolve) => (failFirst = resolve)))
      .mockResolvedValueOnce({ ok: true, data: undefined });
    const { result } = await setup();

    let first: Promise<boolean> = Promise.resolve(true);
    await act(async () => {
      first = result.current.update({ assessmentReminders: true });
    });
    await act(async () => {
      await result.current.update({ appointmentReminders: true });
    });
    await act(async () => {
      failFirst({ ok: false, error: { code: 'NETWORK', message: 'x' } });
      await first;
    });

    expect(result.current.settings).toEqual({ ...defaults, assessmentReminders: true, appointmentReminders: true });
  });
});
