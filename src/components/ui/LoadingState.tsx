import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type LoadingStateProps = {
  /** Read by screen readers; optionally displayed under the spinner. */
  label?: string;
  showLabel?: boolean;
};

export function LoadingState({ label = 'Loading', showLabel = false }: LoadingStateProps) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={styles.container}
    >
      <ActivityIndicator color={Colors.light.primary} />
      {showLabel ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  label: {
    marginTop: Spacing.two,
    fontSize: 14,
    color: Colors.light.onSurface,
  },
});
