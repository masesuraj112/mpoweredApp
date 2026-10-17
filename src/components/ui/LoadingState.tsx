import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type LoadingStateProps = {
  /** Spoken while loading. */
  label?: string;
};

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} style={styles.container}>
      <ActivityIndicator color={Colors.light.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
});
