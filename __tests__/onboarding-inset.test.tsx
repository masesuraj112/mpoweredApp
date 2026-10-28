import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnboardingCarousel from '../app/(auth)/onboarding';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

// A phone with on-screen navigation buttons: 48 of the bottom edge belongs to the system.
const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 48 },
};

describe('OnboardingCarousel', () => {
  it('keeps the Get started and Sign in controls above the system navigation buttons', async () => {
    const screen = await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <OnboardingCarousel />
      </SafeAreaProvider>,
    );

    // Walk up from the Sign in link to the first container that reserves the bottom inset.
    let node = screen.getByText('Sign in').parent;
    while (node && StyleSheet.flatten(node.props.style)?.paddingBottom !== 48) node = node.parent;

    expect(node).toBeTruthy();
  });
});
