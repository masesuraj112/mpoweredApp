import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

/** Width and height of the pill behind a tab's icon (Material 3 navigation item). */
export const TAB_ICON_PILL_WIDTH = 56;
export const TAB_ICON_PILL_HEIGHT = 32;

/** A tab bar icon: the glyph centred in a pill that is tinted while the tab is selected. */
export function TabIcon({ focused, children }: { focused: boolean; children: ReactNode }) {
  return <View style={[styles.pill, focused && styles.pillActive]}>{children}</View>;
}

const styles = StyleSheet.create({
  pill: {
    width: TAB_ICON_PILL_WIDTH,
    height: TAB_ICON_PILL_HEIGHT,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: Colors.light.secondaryContainer,
  },
});
