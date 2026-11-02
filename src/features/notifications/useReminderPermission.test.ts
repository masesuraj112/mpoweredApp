import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState, Linking, type AppStateStatus } from 'react-native';

import type { ReminderPermission } from '@/services/notifications';

import { useReminderPermission, type PermissionSources } from './useReminderPermission';

const granted: ReminderPermission = { status: 'granted', canAskAgain: true };
const undetermined: ReminderPermission = { status: 'undetermined', canAskAgain: true };
const refused: ReminderPermission = { status: 'denied', canAskAgain: false };
const offline = { ok: false as const, error: { code: 'UNKNOWN' as const, message: 'native module missing' } };

function fakeSources(first: ReminderPermission, answer: ReminderPermission = first): jest.Mocked<PermissionSources> {
  return {
    getReminderPermission: jest.fn(async () => ({ ok: true as const, data: first })),
    requestReminderPermission: jest.fn(async () => ({ ok: true as const, data: answer })),
  } as jest.Mocked<PermissionSources>;
}

let appStateListener: ((state: AppStateStatus) => void) | undefined;
const remove = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    appStateListener = listener as (state: AppStateStatus) => void;
    return { remove } as never;
  });
});

async function setup(sources: jest.Mocked<PermissionSources>) {
  const hook = await renderHook(() => useReminderPermission(sources));
  await waitFor(() => expect(sources.getReminderPermission).toHaveBeenCalled());
  return hook;
}

describe('useReminderPermission', () => {
  it('reads the permission without asking', async () => {
    const sources = fakeSources(refused);
    const { result } = await setup(sources);

    await waitFor(() => expect(result.current.permission).toEqual(refused));
    expect(result.current.denied).toBe(true);
    expect(sources.requestReminderPermission).not.toHaveBeenCalled();
  });

  it('does not ask again when already allowed', async () => {
    const sources = fakeSources(granted);
    const { result } = await setup(sources);

    let allowed = false;
    await act(async () => {
      allowed = await result.current.ensure();
    });

    expect(allowed).toBe(true);
    expect(sources.requestReminderPermission).not.toHaveBeenCalled();
  });

  it('asks when not yet decided, and reports a yes', async () => {
    const sources = fakeSources(undetermined, granted);
    const { result } = await setup(sources);

    let allowed = false;
    await act(async () => {
      allowed = await result.current.ensure();
    });

    expect(allowed).toBe(true);
    expect(result.current.permission).toEqual(granted);
    expect(result.current.denied).toBe(false);
  });

  it('reports a refusal and marks it denied', async () => {
    const sources = fakeSources(undetermined, refused);
    const { result } = await setup(sources);

    let allowed = true;
    await act(async () => {
      allowed = await result.current.ensure();
    });

    expect(allowed).toBe(false);
    expect(result.current.denied).toBe(true);
  });

  it('says no when asking fails', async () => {
    const sources = fakeSources(undetermined);
    sources.requestReminderPermission.mockResolvedValue(offline);
    const { result } = await setup(sources);

    let allowed = true;
    await act(async () => {
      allowed = await result.current.ensure();
    });

    expect(allowed).toBe(false);
  });

  it('treats a failed read as unknown, not refused', async () => {
    const sources = fakeSources(undetermined);
    sources.getReminderPermission.mockResolvedValue(offline);
    const { result } = await setup(sources);

    expect(result.current.permission).toBeNull();
    expect(result.current.denied).toBe(false);
  });

  it('reads it again when the app comes back from the phone’s settings', async () => {
    const sources = fakeSources(refused);
    const { result } = await setup(sources);
    sources.getReminderPermission.mockResolvedValue({ ok: true, data: granted });

    await act(async () => appStateListener?.('active'));

    await waitFor(() => expect(result.current.denied).toBe(false));
  });

  it('opens the phone’s settings for the app', async () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    const { result } = await setup(fakeSources(refused));

    await act(async () => result.current.openSettings());

    expect(openSettings).toHaveBeenCalled();
  });

  it('stops listening when it unmounts', async () => {
    const { unmount } = await setup(fakeSources(granted));

    await act(async () => unmount());

    expect(remove).toHaveBeenCalled();
  });
});
