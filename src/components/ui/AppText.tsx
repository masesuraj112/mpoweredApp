import { Text, type TextProps } from 'react-native';

import { scaleText, Typography, useTextScale, useThemeColors, type ThemeColor } from '@/constants/theme';

type AppTextProps = TextProps & {
  /** A text style from the type scale in `Typography`. */
  variant?: keyof typeof Typography;
  /** A colour token. */
  color?: ThemeColor;
};

/**
 * Text in a type-scale style and a theme colour. Use it instead of hand-writing fontSize / fontWeight.
 * Font scaling stays on. Pass `style` for layout (margins, alignment) only.
 */
export function AppText({ variant = 'bodyLarge', color = 'text', style, ...rest }: AppTextProps) {
  const colors = useThemeColors();
  const scale = useTextScale();
  return <Text style={[scaleText(Typography[variant], scale), { color: colors[color] }, style]} {...rest} />;
}
