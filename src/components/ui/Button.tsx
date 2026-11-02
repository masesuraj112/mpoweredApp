import { Button as NativeButton, Host, type ButtonVariant as NativeVariant } from '@expo/ui';
import { semantics } from '@expo/ui/jetpack-compose/modifiers';
import {
  accessibilityHint as hintModifier,
  accessibilityLabel as labelModifier,
  buttonBorderShape,
  controlSize,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { MinTapTarget, Radius, makeStyles, useThemeColors } from '@/constants/theme';

type ButtonVariant = 'elevated' | 'tonal' | 'primary' | 'outlined';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /**
   * `primary`: the screen's main action, filled with the brand colour. `outlined`, `tonal` and `elevated`:
   * other actions, drawn with the platform's secondary button style.
   */
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Decorative text shown before the label (for example a plus). Not read by screen readers. */
  leadingGlyph?: string;
  /** Decorative text shown after the label (for example an arrow). Not read by screen readers. */
  trailingGlyph?: string;
  /** Spoken label. Defaults to `label`; set it when the visible text needs more context. */
  accessibilityLabel?: string;
  /** Spoken after the label, for example why a button is disabled. */
  accessibilityHint?: string;
  /** Placement only (margins, alignment): the button draws itself. */
  style?: StyleProp<ViewStyle>;
};

const NATIVE_VARIANT: Record<ButtonVariant, NativeVariant> = {
  primary: 'filled',
  outlined: 'outlined',
  tonal: 'outlined',
  elevated: 'outlined',
};

/**
 * The platform's own button (SwiftUI on iOS, Material on Android) in the brand colour, at the large size
 * and with the platform's own pressed, disabled and text-size behaviour.
 */
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
  const styles = useStyles();
  const colors = useThemeColors();
  const text = [leadingGlyph, label, trailingGlyph].filter(Boolean).join(' ');
  const spoken = accessibilityLabel ?? label;
  const modifiers =
    Platform.OS === 'ios'
      ? [
          tint(colors.primary),
          controlSize('large'),
          buttonBorderShape('roundedRectangle', Radius.control),
          labelModifier(spoken),
          ...(accessibilityHint ? [hintModifier(accessibilityHint)] : []),
        ]
      : [
          semantics({
            contentDescription: accessibilityHint ? `${spoken}. ${accessibilityHint}` : spoken,
          }),
        ];

  return (
    <View style={[styles.target, style]}>
      <Host matchContents seedColor={colors.primary}>
        <NativeButton
          label={text}
          variant={NATIVE_VARIANT[variant]}
          disabled={disabled}
          onPress={onPress}
          modifiers={modifiers}
        />
      </Host>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  // The touch target is at least 48dp tall even where the platform draws a shorter button.
  target: {
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
