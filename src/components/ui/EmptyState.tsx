import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Spacing, Typography, makeStyles } from '@/constants/theme';

type EmptyStateProps = {
  message: string;
  /** Optional action shown under the message. */
  children?: ReactNode;
};

export function EmptyState({ message, children }: EmptyStateProps) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {children}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  message: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    color: colors.textSecondary,
  },
}));
