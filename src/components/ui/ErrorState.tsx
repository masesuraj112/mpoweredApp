import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

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
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
    color: Colors.light.onSurface,
  },
});
