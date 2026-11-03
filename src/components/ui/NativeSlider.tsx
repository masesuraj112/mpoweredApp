import { Host, Slider } from '@expo/ui';
import { semantics } from '@expo/ui/jetpack-compose/modifiers';
import { accessibilityLabel as labelModifier, tint } from '@expo/ui/swift-ui/modifiers';
import { Platform } from 'react-native';

import { makeStyles, useThemeColors } from '@/constants/theme';

type NativeSliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  /** The increment, for example 1 for whole numbers. */
  step?: number;
  /** What screen readers announce, for example "Average pain, 0 to 10". */
  accessibilityLabel: string;
  disabled?: boolean;
};

/**
 * The platform's own slider (SwiftUI on iOS, Material on Android), in the brand colour. It fills the width
 * it is given.
 */
export function NativeSlider({ value, onValueChange, min = 0, max = 1, step, accessibilityLabel, disabled }: NativeSliderProps) {
  const styles = useStyles();
  const colors = useThemeColors();
  const ios = Platform.OS === 'ios';
  return (
    <Host matchContents={{ vertical: true }} seedColor={colors.primary} style={styles.host}>
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        modifiers={
          ios
            ? [tint(colors.primary), labelModifier(accessibilityLabel)]
            : [semantics({ contentDescription: accessibilityLabel })]
        }
      />
    </Host>
  );
}

const useStyles = makeStyles(() => ({
  host: {
    alignSelf: 'stretch',
  },
}));
