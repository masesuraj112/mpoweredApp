const mockNavigate = jest.fn();
const mockPush = jest.fn();
const mockClear = jest.fn();
let mockResponse: unknown;

jest.mock('expo-router', () => ({
  router: { navigate: (href: unknown) => mockNavigate(href), push: (href: unknown) => mockPush(href) },
}));
jest.mock('expo-notifications', () => ({
  DEFAULT_ACTION_IDENTIFIER: 'expo.modules.notifications.actions.DEFAULT',
  useLastNotificationResponse: () => mockResponse,
  clearLastNotificationResponse: () => mockClear(),
}));

import { renderHook } from '@testing-library/react-native';

import { useOpenTappedReminder } from './useOpenTappedReminder';

const tap = (data: unknown, actionIdentifier = 'expo.modules.notifications.actions.DEFAULT') => ({
  actionIdentifier,
  notification: { request: { content: { data } } },
});

beforeEach(() => {
  jest.clearAllMocks();
  mockResponse = undefined;
});

describe('useOpenTappedReminder', () => {
  it('opens an appointment’s plan on top of the Care Planner list, and clears the tap', async () => {
    mockResponse = tap({ target: { kind: 'appointment', appointmentId: 42 } });

    await renderHook(() => useOpenTappedReminder());

    expect(mockNavigate).toHaveBeenCalledWith('/planner');
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/planner/review', params: { appointmentId: '42' } });
    expect(mockNavigate.mock.invocationCallOrder[0]).toBeLessThan(mockPush.mock.invocationCallOrder[0]);
    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  it('opens the Pain Tracker home for an assessment reminder', async () => {
    mockResponse = tap({ target: { kind: 'assessment' } });

    await renderHook(() => useOpenTappedReminder());

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/home' });
  });

  it.each([
    ['not known yet', undefined],
    ['no tap', null],
  ])('does nothing when there is %s', async (_, response) => {
    mockResponse = response;

    await renderHook(() => useOpenTappedReminder());

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockClear).not.toHaveBeenCalled();
  });

  it('ignores an action that is not a plain tap', async () => {
    mockResponse = tap({ target: { kind: 'assessment' } }, 'expo.modules.notifications.actions.DISMISS');

    await renderHook(() => useOpenTappedReminder());

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('clears but opens nothing for a notification this app didn’t schedule', async () => {
    mockResponse = tap({ url: 'https://example.com' });

    await renderHook(() => useOpenTappedReminder());

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockClear).toHaveBeenCalledTimes(1);
  });
});
