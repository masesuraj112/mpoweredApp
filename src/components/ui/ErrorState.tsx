import { Text, View } from 'react-native';

import { makeStyles, Spacing, Typography } from '@/constants/theme';

import { Button } from './Button';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({ message, onRetry, retryLabel = 'Try again' }: ErrorStateProps) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text accessibilityRole="alert" style={styles.message}>
        {message}
      </Text>
      {onRetry ? <Button label={retryLabel} onPress={onRetry} /> : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  message: {
    ...Typography.bodySmall,
    fontWeight: '500',
    textAlign: 'center',
    color: colors.onSurface,
  },
}));
