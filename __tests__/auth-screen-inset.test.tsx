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

describe('sign-in screens', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('keep their content between the status bar and the system navigation buttons', async () => {
    const screen = await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <VerificationConfirmationScreen />
      </SafeAreaProvider>,
    );

    // Walk up from a piece of text to the container that reserves both system edges.
    let node = screen.getByLabelText(/off to an MPowered start/).parent;
    let style = StyleSheet.flatten(node?.props.style);
    while (node && !(style?.paddingTop === 24 && style?.paddingBottom === 48)) {
      node = node.parent;
      style = StyleSheet.flatten(node?.props.style);
    }

    expect(node).toBeTruthy();
  });
});
