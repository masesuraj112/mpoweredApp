import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export function PlannerIntro() {
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
  },
  title: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '600',
    letterSpacing: -0.48,
    color: Colors.light.text,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.outline,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    color: Colors.light.onSurface,
  },
});
