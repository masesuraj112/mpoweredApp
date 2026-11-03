import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/theme';

import { TabIcon } from './TabIcon';

describe('TabIcon', () => {
  it('tints the pill while the tab is selected', async () => {
    await render(<TabIcon focused><Text>icon</Text></TabIcon>);

    const style = StyleSheet.flatten(screen.getByText('icon').parent?.props.style);
    expect(style.backgroundColor).toBe(Colors.light.secondaryContainer);
  });

  it('leaves the pill clear when the tab is not selected', async () => {
    await render(<TabIcon focused={false}><Text>icon</Text></TabIcon>);

    const style = StyleSheet.flatten(screen.getByText('icon').parent?.props.style);
    expect(style.backgroundColor).toBeUndefined();
  });
});
