import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

/** A hairline rule between sections or rows. Decorative, so hidden from screen readers. */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no" style={[styles.line, style]} />
  );
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: Colors.light.divider,
  },
});
