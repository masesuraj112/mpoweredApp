import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles } from '@/constants/theme';

/** A hairline rule between sections or rows. Decorative, so hidden from screen readers. */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no" style={[styles.line, style]} />
  );
}

const useStyles = makeStyles((colors) => ({
  line: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.divider,
  },
}));
