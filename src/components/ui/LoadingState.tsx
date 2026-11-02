import { ActivityIndicator, Text, View } from 'react-native';

import { makeStyles, Spacing, Typography, useThemeColors } from '@/constants/theme';

type LoadingStateProps = {
  /** Read by screen readers; optionally displayed under the spinner. */
  label?: string;
  showLabel?: boolean;
};

export function LoadingState({ label = 'Loading', showLabel = false }: LoadingStateProps) {
  const styles = useStyles();
  const colors = useThemeColors();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={styles.container}
    >
      <ActivityIndicator color={colors.primary} />
      {showLabel ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  label: {
    marginTop: Spacing.two,
    ...Typography.bodySmall,
    color: colors.onSurface,
  },
}));
