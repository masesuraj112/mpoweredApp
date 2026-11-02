// The first screen records whether the person is signing up or signing in (sign-up-sign-in-plan.md, SU-1).
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnboardingCarousel from '../app/(auth)/onboarding';
import { OnboardingProvider, useOnboarding } from '../src/context/Onboarding-Context';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ router: { push: (href: unknown) => mockPush(href) } }));

const metrics = { frame: { x: 0, y: 0, width: 360, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 24 } };

function IntentProbe() {
  const { data } = useOnboarding();
  return <Text>intent: {String(data.intent)}</Text>;
}

async function setup() {
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <OnboardingProvider>
        <OnboardingCarousel />
        <IntentProbe />
      </OnboardingProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => mockPush.mockClear());

describe('OnboardingCarousel intent', () => {
  it('starts with no intent', async () => {
    await setup();
    expect(screen.getByText('intent: null')).toBeTruthy();
  });

  it('Get started records sign-up and opens the sign-up questions', async () => {
    await setup();

    fireEvent.press(screen.getByText('Get started →'));

    expect(await screen.findByText('intent: sign-up')).toBeTruthy();
    expect(mockPush).toHaveBeenCalledWith('/(auth)/user-type');
  });

  it('Sign in records sign-in and opens the phone screen', async () => {
    await setup();

    fireEvent.press(screen.getByText('Sign in'));

    expect(await screen.findByText('intent: sign-in')).toBeTruthy();
    expect(mockPush).toHaveBeenCalledWith('/(auth)/phone');
  });
});
