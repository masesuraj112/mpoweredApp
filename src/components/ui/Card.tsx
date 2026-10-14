import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type CardProps = {
  /** `muted` is a tinted container that holds other cards; `plain` is a white card. */
  variant?: 'muted' | 'plain';
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ variant = 'plain', children, style }: CardProps) {
  return <View style={[styles.base, variant === 'muted' ? styles.muted : styles.plain, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.card,
    padding: Spacing.three,
  },
  muted: {
    backgroundColor: Colors.light.backgroundElement,
  },
  plain: {
    backgroundColor: Colors.light.background,
  },
});
