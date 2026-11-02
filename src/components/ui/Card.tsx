import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing, makeStyles } from '@/constants/theme';

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
  const styles = useStyles();
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

const useStyles = makeStyles((colors) => ({
  base: {
    borderRadius: Radius.card,
    padding: Spacing.three,
  },
  plain: {
    backgroundColor: colors.background,
  },
  muted: {
    backgroundColor: colors.backgroundElement,
  },
  outlined: {
    backgroundColor: colors.surfaceContainer,
  },
}));
