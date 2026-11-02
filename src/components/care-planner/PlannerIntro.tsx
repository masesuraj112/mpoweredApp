import { StyleSheet, Text, View } from 'react-native';

import { makeStyles, Spacing, Typography } from '@/constants/theme';

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
    ...Typography.title,
    letterSpacing: -0.48,
    color: colors.text,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  subtitle: {
    ...Typography.bodySmall,
    letterSpacing: 0.25,
    color: colors.onSurface,
  },
}));
