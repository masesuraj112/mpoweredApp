import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

type ChipButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shows a spinner in place of the label while the action runs. */
  busy?: boolean;
  /** Spoken name of the spinner while busy. */
  busyLabel?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** A small outlined action next to a title, such as Print PDF or Share. At least 48dp to tap. */
export function ChipButton({
  label,
  onPress,
  disabled = false,
  busy = false,
  busyLabel = 'Working',
  accessibilityLabel,
  style,
}: ChipButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        disabled && !busy && styles.dimmed,
        pressed && styles.pressed,
        style,
      ]}>
      {busy ? (
        <ActivityIndicator size="small" color={Colors.light.onSurfaceVariant} accessibilityLabel={busyLabel} />
      ) : (
        <AppText variant="labelMedium" color="onSurfaceVariant">
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MinTapTarget,
    minWidth: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.mid,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.large,
  },
  dimmed: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
