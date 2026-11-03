import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import type { ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { AppLockProvider, useAppLock } from './AppLockContext';
import { LOCK_AFTER_MS } from './policy';

const KEY = '@mpowered/app-lock';
const authenticate = LocalAuthentication.authenticateAsync as jest.Mock;
const enrolledLevel = LocalAuthentication.getEnrolledLevelAsync as jest.Mock;

let appStateListener: ((state: AppStateStatus) => void) | undefined;

function setup(active = true) {
  const wrapper = ({ children }: { children: ReactNode }) => <AppLockProvider active={active}>{children}</AppLockProvider>;
  return renderHook(() => useAppLock(), { wrapper });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  authenticate.mockResolvedValue({ success: true });
  enrolledLevel.mockResolvedValue(3);
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    appStateListener = listener as (state: AppStateStatus) => void;
    return { remove: jest.fn() } as unknown as ReturnType<typeof AppState.addEventListener>;
  });
});

afterEach(() => jest.restoreAllMocks());

describe('AppLockProvider', () => {
  it('stays unlocked when the lock is off', async () => {
    const { result } = await setup();
    await waitFor(() => expect(result.current.methodName).toBe('Face ID'));

    expect(result.current.enabled).toBe(false);
    expect(result.current.locked).toBe(false);
  });

  it('locks as the app opens when it is on, and unlocks once the phone checks', async () => {
    await AsyncStorage.setItem(KEY, 'on');
    const { result } = await setup();
    await waitFor(() => expect(result.current.locked).toBe(true));

    let message: string | null = 'not run';
    await act(async () => {
      message = await result.current.unlock();
    });

    expect(message).toBeNull();
    expect(result.current.locked).toBe(false);
  });

  it('stays locked when the check fails, and says why', async () => {
    await AsyncStorage.setItem(KEY, 'on');
    authenticate.mockResolvedValue({ success: false, error: 'lockout' });
    const { result } = await setup();
    await waitFor(() => expect(result.current.locked).toBe(true));

    let message: string | null = null;
    await act(async () => {
      message = await result.current.unlock();
    });

    expect(message).toMatch(/Too many tries/);
    expect(result.current.locked).toBe(true);
  });

  it('never covers the sign-in screens', async () => {
    await AsyncStorage.setItem(KEY, 'on');
    const { result } = await setup(false);
    await waitFor(() => expect(result.current.methodName).toBe('Face ID'));

    expect(result.current.locked).toBe(false);
  });

  it('locks again after five minutes in the background, not after a quick switch', async () => {
    await AsyncStorage.setItem(KEY, 'on');
    const now = jest.spyOn(Date, 'now');
    const { result } = await setup();
    await waitFor(() => expect(result.current.locked).toBe(true));
    await act(async () => {
      await result.current.unlock();
    });

    now.mockReturnValue(0);
    await act(async () => appStateListener?.('background'));
    now.mockReturnValue(60_000);
    await act(async () => appStateListener?.('active'));
    expect(result.current.locked).toBe(false);

    now.mockReturnValue(0);
    await act(async () => appStateListener?.('background'));
    now.mockReturnValue(LOCK_AFTER_MS);
    await act(async () => appStateListener?.('active'));
    expect(result.current.locked).toBe(true);
  });

  it('turns on only after the phone checks it is its owner, and remembers it', async () => {
    const { result } = await setup();

    let message: string | null = 'not run';
    await act(async () => {
      message = await result.current.setEnabled(true);
    });

    expect(message).toBeNull();
    expect(authenticate).toHaveBeenCalled();
    expect(result.current.enabled).toBe(true);
    expect(await AsyncStorage.getItem(KEY)).toBe('on');
  });

  it('will not turn on when the phone has no biometrics or passcode, or the check is cancelled', async () => {
    const { result } = await setup();

    enrolledLevel.mockResolvedValue(0);
    let message: string | null = null;
    await act(async () => {
      message = await result.current.setEnabled(true);
    });
    expect(message).toMatch(/Set up Face ID/);

    enrolledLevel.mockResolvedValue(3);
    authenticate.mockResolvedValue({ success: false, error: 'user_cancel' });
    await act(async () => {
      message = await result.current.setEnabled(true);
    });
    expect(message).toBeNull();
    expect(result.current.enabled).toBe(false);
  });

  it('turns off without asking', async () => {
    await AsyncStorage.setItem(KEY, 'on');
    const { result } = await setup();
    await waitFor(() => expect(result.current.enabled).toBe(true));
    authenticate.mockClear();

    await act(async () => {
      await result.current.setEnabled(false);
    });

    expect(authenticate).not.toHaveBeenCalled();
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });
});
