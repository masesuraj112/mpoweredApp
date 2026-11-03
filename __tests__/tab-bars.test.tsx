import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PatientTabsLayout from '../app/(tabs)/_layout';
import SupportTabsLayout from '../app/(support)/_layout';

// Capture the options each layout gives the tab bar, without rendering a real navigator.
const mockTabOptions: Record<string, unknown>[] = [];

jest.mock('expo-router', () => {
  const Tabs = Object.assign(
    ({ screenOptions }: { screenOptions: Record<string, unknown> }) => {
      mockTabOptions.push(screenOptions);
      return null;
    },
    { Screen: () => null },
  );
  return { Tabs };
});
jest.mock('@/features/notifications/RemindersContext', () => ({
  RemindersProvider: ({ children }: { children: unknown }) => children,
}));
jest.mock('@/features/notifications/useOpenTappedReminder', () => ({ useOpenTappedReminder: () => {} }));
jest.mock('@/features/support-person/context', () => ({
  SupportPersonProvider: ({ children }: { children: unknown }) => children,
}));

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

describe('tab bars', () => {
  beforeEach(() => {
    mockTabOptions.length = 0;
  });

  it('hides the patient tab bar while the keyboard is open, so it never rides on top of it', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <PatientTabsLayout />
      </SafeAreaProvider>,
    );

    expect(mockTabOptions.at(-1)?.tabBarHideOnKeyboard).toBe(true);
  });

  it('hides the support person tab bar while the keyboard is open', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <SupportTabsLayout />
      </SafeAreaProvider>,
    );

    expect(mockTabOptions.at(-1)?.tabBarHideOnKeyboard).toBe(true);
  });
});
