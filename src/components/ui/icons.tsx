import { StyleSheet, useWindowDimensions, type StyleProp, type TextStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { useThemeColors } from '@/constants/theme';

type IconProps = {
  size?: number;
  color?: string;
};

// Decorative icons drawn with react-native-svg. They are hidden from screen readers: the control
// that contains them carries the accessible label.

const hidden = {
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
} as const;

export function CalendarIcon({ size = 20, color }: IconProps) {
  const colors = useThemeColors();
  const stroke = color ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...hidden}>
      <Rect x={3.5} y={5} width={17} height={15.5} rx={2.5} stroke={stroke} strokeWidth={2} />
      <Path d="M3.5 10h17" stroke={stroke} strokeWidth={2} />
      <Path d="M8 3v4M16 3v4" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      <Rect x={7.5} y={13} width={4} height={4} rx={1} fill={stroke} />
    </Svg>
  );
}

export function PhoneIcon({ size = 20, color }: IconProps) {
  const colors = useThemeColors();
  const stroke = color ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...hidden}>
      <Path
        d="M6.6 3.5h3l1.4 4-2 1.3a12 12 0 0 0 5.2 5.2l1.3-2 4 1.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7 2 2 0 0 1 6.6 3.5z"
        fill={stroke}
      />
    </Svg>
  );
}

/**
 * A right arrow drawn as a shape, for "Edit →" style buttons. The "→" character sits low in Android's
 * font, so next to a label it never lines up; this centres on the label in a row.
 */
export function ArrowRightIcon({ size = 16, color }: IconProps) {
  const colors = useThemeColors();
  const stroke = color ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...hidden}>
      <Path d="M4 12h15M13 6l6 6-6 6" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 16, color }: IconProps) {
  const colors = useThemeColors();
  const stroke = color ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...hidden}>
      <Path d="M20 12H5M11 6l-6 6 6 6" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/**
 * An arrow to sit beside a label in a row, in place of the "→" / "←" characters (which sit low in
 * Android's font). Pass the label's text style: the arrow takes its colour and size, and grows with the
 * phone's text size like the label does.
 */
export function ArrowGlyph({ direction = 'right', style }: { direction?: 'left' | 'right'; style?: StyleProp<TextStyle> }) {
  const { fontScale } = useWindowDimensions();
  const flat = StyleSheet.flatten(style) ?? {};
  const size = Math.round((flat.fontSize ?? 16) * fontScale);
  const color = typeof flat.color === 'string' ? flat.color : undefined;
  return direction === 'left' ? <ArrowLeftIcon size={size} color={color} /> : <ArrowRightIcon size={size} color={color} />;
}
