import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import VerificationConfirmationScreen from '../app/(auth)/verification-confirmation';

jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ refreshProfile: jest.fn() }) }));

// A phone with on-screen navigation buttons: 24 of the top edge and 48 of the bottom edge belong to the system.
const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 48 },
};

describe('sign-in screens on a fixed-size canvas', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('keeps the canvas between the status bar and the system navigation buttons', async () => {
    const screen = await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <VerificationConfirmationScreen />
      </SafeAreaProvider>,
    );

    // Walk up from a piece of text to the canvas: the first container with an explicit size and position.
    let node = screen.getByText(/off to an MPowered start/).parent;
    let style = StyleSheet.flatten(node?.props.style);
    while (node && !(typeof style?.height === 'number' && typeof style?.top === 'number')) {
      node = node.parent;
      style = StyleSheet.flatten(node?.props.style);
    }

    expect(node).toBeTruthy();
    expect(style.top).toBeGreaterThanOrEqual(24);
    expect(style.top + style.height).toBeLessThanOrEqual(780 - 48 + 0.001);
  });
});
