import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';

import { Button } from './Button';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({ message, onRetry, retryLabel = 'Try again' }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="alert" style={styles.message}>
        {message}
      </Text>
      {onRetry ? <Button label={retryLabel} onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  message: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    color: Colors.light.onSurface,
  },
});
