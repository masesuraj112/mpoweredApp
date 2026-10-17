import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type CardProps = {
  /**
   * `plain` is a white card, `muted` a tinted container that holds other cards, and `outlined` a
   * white card with a border (the main card of a screen).
   */
  variant?: 'plain' | 'muted' | 'outlined';
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ variant = 'plain', children, style }: CardProps) {
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.card,
    padding: Spacing.three,
  },
  plain: {
    backgroundColor: Colors.light.background,
  },
  muted: {
    backgroundColor: Colors.light.backgroundElement,
  },
  outlined: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
  },
});
