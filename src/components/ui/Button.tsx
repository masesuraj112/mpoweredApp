import { Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { MinTapTarget, Radius, Spacing, Typography, makeStyles } from '@/constants/theme';
import { ArrowGlyph } from './icons';

type ButtonVariant = 'elevated' | 'tonal' | 'primary' | 'outlined';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /**
   * `elevated`: white pill with a shadow. `tonal`: purple-tinted pill.
   * `primary`: filled purple. `outlined`: white with a purple outline and black text.
   * Only `elevated` and `tonal` are dimmed when disabled; `primary` and `outlined` keep their look.
   */
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Accepted for main's callers: every button here is already fully rounded, so it changes nothing. */
  pill?: boolean;
  /** True while the action runs (for example while a code is being sent). Announced to screen readers. */
  busy?: boolean;
  /** Decorative text shown before the label (for example a plus). Hidden from screen readers. */
  leadingGlyph?: string;
  /** Decorative text shown after the label (for example an arrow). Hidden from screen readers. */
  trailingGlyph?: string;
  /** Spoken label. Defaults to `label`; set it when the visible text needs more context. */
  accessibilityLabel?: string;
  /** Spoken after the label, for example why a button is disabled. */
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'elevated',
  disabled = false,
  busy = false,
  leadingGlyph,
  trailingGlyph,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const styles = useStyles();
  const dimWhenDisabled = variant === 'elevated' || variant === 'tonal';
  const labelStyle = [
    styles.label,
    variant === 'tonal' && styles.tonalLabel,
    variant === 'primary' && styles.primaryLabel,
    variant === 'outlined' && styles.outlinedLabel,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.target,
        pressed && styles.pressed,
        disabled && dimWhenDisabled && styles.disabled,
        style,
      ]}>
      <View style={[styles.pill, styles[variant]]}>
        {leadingGlyph ? <Glyph glyph={leadingGlyph} style={labelStyle} /> : null}
        <Text style={labelStyle}>{label}</Text>
        {trailingGlyph ? <Glyph glyph={trailingGlyph} style={labelStyle} /> : null}
      </View>
    </Pressable>
  );
}

/** Decorative text beside the label. Arrows are drawn, so they centre on the label on Android too. */
function Glyph({ glyph, style }: { glyph: string; style: StyleProp<TextStyle> }) {
  if (glyph === '→' || glyph === '←') return <ArrowGlyph direction={glyph === '←' ? 'left' : 'right'} style={style} />;
  return (
    <Text accessibilityElementsHidden importantForAccessibility="no" style={style}>
      {glyph}
    </Text>
  );
}

const useStyles = makeStyles((colors) => ({
  // Buttons hug their label and sit centred, clear of the edges of whatever holds them. A caller can
  // still place one with `style` (for example `alignSelf: 'stretch'` in a pair).
  target: {
    minHeight: MinTapTarget,
    minWidth: MinTapTarget,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: MinTapTarget,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
  },
  elevated: {
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  tonal: {
    backgroundColor: colors.primaryContainer,
  },
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlined: {
    backgroundColor: colors.secondaryContainer,
  },
  label: {
    ...Typography.labelLarge,
    color: colors.secondary,
  },
  tonalLabel: {
    color: colors.onSurfaceVariant,
  },
  primaryLabel: {
    fontWeight: '600',
    color: colors.onPrimary,
  },
  outlinedLabel: {
    fontWeight: '600',
    color: colors.text,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
}));
