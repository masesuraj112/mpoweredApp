import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MinTapTarget, Spacing } from '@/constants/theme';

import { ScreenHeader } from './ScreenHeader';

const STATUS_BAR = 30;
const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: STATUS_BAR, left: 0, right: 0, bottom: 0 },
};

async function setup(props: Partial<React.ComponentProps<typeof ScreenHeader>> = {}) {
  const onBack = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ScreenHeader onBack={onBack} {...props} />
    </SafeAreaProvider>,
  );
  return { onBack };
}

describe('ScreenHeader', () => {
  it('has a Back button that calls onBack', async () => {
    const { onBack } = await setup();

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('uses the given back label as the spoken name', async () => {
    await setup({ backLabel: 'Back to Home' });

    expect(screen.getByRole('button', { name: 'Back to Home' })).toBeTruthy();
  });

  it('shows the title as a heading', async () => {
    await setup({ title: 'Settings' });

    expect(screen.getByRole('header', { name: 'Settings' })).toBeTruthy();
  });

  it('has no heading when there is no title', async () => {
    await setup();

    expect(screen.queryByRole('header')).toBeNull();
  });

  it('keeps the back control at least 48dp tall', async () => {
    await setup();

    const style = StyleSheet.flatten(screen.getByRole('button', { name: 'Back' }).props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(MinTapTarget);
  });

  it('does not pad for the status bar when the screen already does', async () => {
    await setup({ padForStatusBar: false });

    const bar = screen.getByRole('button', { name: 'Back' }).parent;
    expect(StyleSheet.flatten(bar?.props.style).paddingTop).toBe(Spacing.two);
  });

  it('pads below the status bar from the safe-area inset, not a fixed height', async () => {
    await setup({ title: 'Settings' });

    const bar = screen.getByRole('button', { name: 'Back' }).parent;
    const style = StyleSheet.flatten(bar?.props.style);
    expect(style.paddingTop).toBe(STATUS_BAR + Spacing.two);
    expect(style.height).toBeUndefined();
  });
});
