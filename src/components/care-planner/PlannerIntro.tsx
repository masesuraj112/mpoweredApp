import { StyleSheet, Text, View } from 'react-native';

import { Spacing, makeStyles } from '@/constants/theme';

export function PlannerIntro() {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Plan your visit with confidence
      </Text>
      <View style={styles.rule} />
      <Text style={styles.subtitle}>
        Get ready for your visit. Prepare questions, add support people, and keep notes during your
        appointments.
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
  },
  title: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '600',
    letterSpacing: -0.48,
    color: colors.text,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    color: colors.onSurface,
  },
}));
