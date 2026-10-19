import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

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
  leadingGlyph,
  trailingGlyph,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
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
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.target,
        pressed && styles.pressed,
        disabled && dimWhenDisabled && styles.disabled,
        style,
      ]}>
      <View style={[styles.pill, styles[variant]]}>
        {leadingGlyph ? (
          <Text accessibilityElementsHidden importantForAccessibility="no" style={labelStyle}>
            {leadingGlyph}
          </Text>
        ) : null}
        <Text style={labelStyle}>{label}</Text>
        {trailingGlyph ? (
          <Text accessibilityElementsHidden importantForAccessibility="no" style={labelStyle}>
            {trailingGlyph}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // The touch target is at least 48dp tall even though the visible shape is shorter.
  target: {
    minHeight: MinTapTarget,
    minWidth: MinTapTarget,
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  elevated: {
    backgroundColor: Colors.light.background,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  tonal: {
    backgroundColor: Colors.light.primaryContainer,
    borderWidth: 1,
    borderColor: Colors.light.outline,
  },
  primary: {
    backgroundColor: Colors.light.primary,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: Radius.control,
    paddingVertical: Spacing.three,
  },
  outlined: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: Radius.control,
    paddingVertical: Spacing.three,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.light.secondary,
  },
  tonalLabel: {
    color: Colors.light.onSurfaceVariant,
  },
  primaryLabel: {
    fontWeight: '600',
    color: Colors.light.onPrimary,
  },
  outlinedLabel: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
