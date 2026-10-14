import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /** `elevated` is a white button with a shadow; `tonal` is a purple filled button. */
  variant?: 'elevated' | 'tonal';
  disabled?: boolean;
  /** Decorative text shown after the label (for example an arrow). Hidden from screen readers. */
  trailingGlyph?: string;
  /** Spoken label. Defaults to `label`; set it when the visible text needs more context. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'elevated',
  disabled = false,
  trailingGlyph,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const tonal = variant === 'tonal';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.target, pressed && styles.pressed, disabled && styles.disabled, style]}>
      <View style={[styles.pill, tonal ? styles.tonal : styles.elevated]}>
        <Text style={[styles.label, tonal && styles.tonalLabel]}>{label}</Text>
        {trailingGlyph ? (
          <Text
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[styles.label, tonal && styles.tonalLabel]}>
            {trailingGlyph}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // The touch target is at least 48dp tall even though the visible pill is shorter.
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
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: Colors.light.secondary,
  },
  tonalLabel: {
    color: Colors.light.onSurfaceVariant,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
