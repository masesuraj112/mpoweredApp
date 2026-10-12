import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { scaleFont, scaleHeight } from '@/services/scale';

interface LoadingStateProps {
  /** Read by screen readers, and shown under the spinner when `showLabel` is set */
  label?: string;
  showLabel?: boolean;
}

export function LoadingState({ label = 'Loading', showLabel = false }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={PRIMARY_PURPLE} accessibilityLabel={label} />
      {showLabel && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const PRIMARY_PURPLE = '#6750A4';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleHeight(48),
  },
  label: {
    fontSize: scaleFont(14),
    color: '#49454F',
    marginTop: scaleHeight(12),
  },
});
