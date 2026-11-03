import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';

import { Screen } from './Screen';

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

function inProvider(node: React.ReactNode) {
  return <SafeAreaProvider initialMetrics={metrics}>{node}</SafeAreaProvider>;
}

describe('Screen', () => {
  it('shows its content', async () => {
    await render(inProvider(<Screen><Text>Body</Text></Screen>));

    expect(screen.getByText('Body')).toBeTruthy();
  });

  it('shows the footer below the content', async () => {
    await render(
      inProvider(
        <Screen footer={<Text>Footer</Text>}>
          <Text>Body</Text>
        </Screen>,
      ),
    );

    expect(screen.getByText('Footer')).toBeTruthy();
  });

  it('keeps the content from growing wider than the maximum on tablets', async () => {
    await render(inProvider(<Screen scroll={false}><Text>Body</Text></Screen>));

    const content = screen.getByText('Body').parent;
    expect(StyleSheet.flatten(content?.props.style).maxWidth).toBe(MaxContentWidth);
  });
});
