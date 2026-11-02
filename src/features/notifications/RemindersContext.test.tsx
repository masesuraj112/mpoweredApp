jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/services/notifications', () => ({
  ...jest.requireActual('@/services/notifications'),
  showRemindersWhileOpen: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { showRemindersWhileOpen } from '@/services/notifications';

import { RemindersProvider, useReminders } from './RemindersContext';
import type { ReminderSources } from './syncReminders';

const NOW = new Date(2026, 10, 2, 12, 0);
const now = () => NOW;

function fakeSources(): jest.Mocked<ReminderSources> {
  return {
    getReminderPermission: jest.fn(async () => ({ ok: true as const, data: { status: 'granted' as const, canAskAgain: true } })),
    getNotificationSettings: jest.fn(async () => ({
      ok: true as const,
      data: {
        assessmentReminders: false,
        assessmentEvery: 3,
        assessmentUnit: 'days' as const,
        appointmentReminders: true,
        appointmentDayBefore: true,
        appointmentOnDay: false,
      },
    })),
    listAppointments: jest.fn(async () => ({ ok: true as const, data: [] })),
    getLatestAssessments: jest.fn(),
    applyReminders: jest.fn(async () => ({ ok: true as const, data: undefined })),
    cancelAllReminders: jest.fn(async () => ({ ok: true as const, data: undefined })),
  } as unknown as jest.Mocked<ReminderSources>;
}

let appStateListener: ((state: AppStateStatus) => void) | undefined;
const remove = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  appStateListener = undefined;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    appStateListener = listener as (state: AppStateStatus) => void;
    return { remove } as never;
  });
});

async function setup(sources = fakeSources()) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <RemindersProvider sources={sources} now={now}>
      {children}
    </RemindersProvider>
  );
  const hook = await renderHook(() => useReminders(), { wrapper });
  await waitFor(() => expect(sources.applyReminders).toHaveBeenCalledTimes(1));
  return { ...hook, sources };
}

describe('RemindersProvider', () => {
  it('plans the reminders when it starts, and sets how they show while the app is open', async () => {
    const { sources } = await setup();

    expect(sources.applyReminders).toHaveBeenCalledWith([]);
    expect(showRemindersWhileOpen).toHaveBeenCalledTimes(1);
  });

  it('plans again when the app comes back to the foreground, not when it goes to the background', async () => {
    const { sources } = await setup();

    await act(async () => appStateListener?.('background'));
    expect(sources.applyReminders).toHaveBeenCalledTimes(1);

    await act(async () => appStateListener?.('active'));
    await waitFor(() => expect(sources.applyReminders).toHaveBeenCalledTimes(2));
  });

  it('plans again on refresh', async () => {
    const { result, sources } = await setup();

    await act(async () => result.current.refresh());

    await waitFor(() => expect(sources.applyReminders).toHaveBeenCalledTimes(2));
  });

  it('runs one sync at a time, then once more for refreshes made during it', async () => {
    const sources = fakeSources();
    const { result } = await setup(sources);
    let finish: () => void = () => {};
    sources.getReminderPermission.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = () => resolve({ ok: true, data: { status: 'granted', canAskAgain: true } });
        }),
    );

    await act(async () => {
      result.current.refresh();
      result.current.refresh();
      result.current.refresh();
    });
    expect(sources.getReminderPermission).toHaveBeenCalledTimes(2);

    await act(async () => finish());
    // The first sync (on start), the slow one, and one more for the two refreshes made during it.
    await waitFor(() => expect(sources.applyReminders).toHaveBeenCalledTimes(3));
    expect(sources.getReminderPermission).toHaveBeenCalledTimes(3);
  });

  it('keeps working after a sync throws', async () => {
    const sources = fakeSources();
    const { result } = await setup(sources);
    sources.getReminderPermission.mockRejectedValueOnce(new Error('unexpected'));

    await act(async () => result.current.refresh());
    await act(async () => result.current.refresh());

    await waitFor(() => expect(sources.applyReminders).toHaveBeenCalledTimes(2));
  });

  it('stops listening when it unmounts', async () => {
    const { unmount } = await setup();

    await act(async () => unmount());

    expect(remove).toHaveBeenCalled();
  });
});

describe('useReminders outside the provider', () => {
  it('gives a refresh that does nothing', async () => {
    const { result } = await renderHook(() => useReminders());

    expect(() => result.current.refresh()).not.toThrow();
  });
});
