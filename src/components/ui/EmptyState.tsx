import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type EmptyStateProps = {
  message: string;
  /** Optional action shown under the message. */
  children?: ReactNode;
};

export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {children}
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
    letterSpacing: 0.25,
    textAlign: 'center',
    color: Colors.light.textSecondary,
  },
});
