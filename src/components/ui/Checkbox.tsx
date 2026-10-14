import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, MinTapTarget, Spacing } from '@/constants/theme';

/**
 * Box and tick dimensions. These are the same numbers as the default checkbox in
 * MultiChoiceList (24dp box, 2dp border, 6dp radius, bold white "✓" at 14), kept together so the
 * proportions stay identical: 24 - 2 * 2 = 20dp of room inside the border for a 14dp glyph.
 */
const CHECKBOX_BOX_SIZE = 24;
const CHECKBOX_BORDER_WIDTH = 2;
const CHECKBOX_RADIUS = 6;
const CHECKBOX_TICK_SIZE = 14;

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Row content shown before the box. A string is styled for you; pass a node for custom text. */
  label: ReactNode;
  disabled?: boolean;
  /** Spoken label. Defaults to the label when it is a string. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  accessibilityLabel,
  style,
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? (typeof label === 'string' ? label : undefined)}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={[styles.row, style]}>
      <View style={styles.labelColumn}>
        {typeof label === 'string' ? <Text style={styles.label}>{label}</Text> : label}
      </View>
      <View testID="checkbox-box" style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          // Decorative glyph inside a fixed-size box: it must not grow with the system font size
          // or it would spill out of the box. The label text next to it still scales.
          <Text testID="checkbox-tick" allowFontScaling={false} style={styles.tick}>
            ✓
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  labelColumn: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: Colors.light.onSurfaceVariant,
  },
  box: {
    width: CHECKBOX_BOX_SIZE,
    height: CHECKBOX_BOX_SIZE,
    borderRadius: CHECKBOX_RADIUS,
    borderWidth: CHECKBOX_BORDER_WIDTH,
    borderColor: Colors.light.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  boxChecked: {
    borderColor: Colors.light.controlChecked,
    backgroundColor: Colors.light.controlChecked,
  },
  tick: {
    color: Colors.light.onPrimary,
    fontSize: CHECKBOX_TICK_SIZE,
    fontWeight: '700',
  },
});
