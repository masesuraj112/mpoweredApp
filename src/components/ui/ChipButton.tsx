import { ActivityIndicator, Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { makeStyles, MinTapTarget, Radius, Spacing, useThemeColors } from '@/constants/theme';

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

/** A small filled action next to a title, such as Print PDF or Share. At least 48dp to tap. */
export function ChipButton({
  label,
  onPress,
  disabled = false,
  busy = false,
  busyLabel = 'Working',
  accessibilityLabel,
  style,
}: ChipButtonProps) {
  const styles = useStyles();
  const colors = useThemeColors();
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
        <ActivityIndicator size="small" color={colors.onSecondaryContainer} accessibilityLabel={busyLabel} />
      ) : (
        <AppText variant="labelLargeBold" color="onSecondaryContainer">
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

// A solid fill rather than an outline, like the app's other secondary buttons.
const useStyles = makeStyles((colors) => ({
  chip: {
    minHeight: MinTapTarget,
    minWidth: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: colors.secondaryContainer,
  },
  dimmed: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
}));
