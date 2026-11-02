import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WelcomeSplash, type WelcomeGreeting } from './WelcomeSplash';

const metrics = { frame: { x: 0, y: 0, width: 360, height: 800 }, insets: { top: 24, left: 0, right: 0, bottom: 24 } };

async function setup(greeting: WelcomeGreeting) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <WelcomeSplash greeting={greeting} />
    </SafeAreaProvider>,
  );
}

describe('WelcomeSplash', () => {
  it.each<WelcomeGreeting>(['Welcome to', 'Welcome back to'])('shows “%s” with the MPowered name', async (greeting) => {
    await setup(greeting);

    expect(screen.getByText(greeting)).toBeTruthy();
    expect(screen.getByRole('header', { name: `${greeting} MPowered` })).toBeTruthy();
  });

  it('says who it is powered by', async () => {
    await setup('Welcome to');

    expect(screen.getByText(/Powered by\s+Musculoskeletal Health Australia/)).toBeTruthy();
  });

  it('hides the decorative waves from screen readers', async () => {
    const { toJSON } = await setup('Welcome to');
    const tree = JSON.stringify(toJSON());

    // Android and iOS each have their own switch.
    expect(tree).toContain('"importantForAccessibility":"no-hide-descendants"');
    expect(tree).toContain('"accessibilityElementsHidden":true');
  });
});
