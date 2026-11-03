import { Host, Picker } from '@expo/ui';
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { makeStyles, MinTapTarget, Spacing, useThemeColors } from '@/constants/theme';

export type NativePickerOption<T extends string> = { value: T; label: string };

export type NativePickerProps<T extends string> = {
  value: T;
  options: NativePickerOption<T>[];
  onChange: (value: T) => void;
  /** What screen readers announce for the picker, for example "Unit of time". */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * The platform's own menu picker (a SwiftUI menu here, a Material dropdown in NativePicker.android.tsx),
 * tinted with the brand. It shows the selected option and opens the system menu of the rest. It sits in the
 * same lavender field as the app's text inputs.
 */
export function NativePicker<T extends string>({ value, options, onChange, accessibilityLabel, style }: NativePickerProps<T>) {
  const styles = useStyles();
  const colors = useThemeColors();
  return (
    <View style={[styles.field, style]}>
      <Host matchContents seedColor={colors.primary} accessibilityLabel={accessibilityLabel}>
        <Picker selectedValue={value} onValueChange={(next) => onChange(next as T)} appearance="menu">
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </Host>
    </View>
  );
}

// Matches the text inputs beside it: the lavender fill, small corners and a line along the bottom.
const useStyles = makeStyles((colors) => ({
  field: {
    minHeight: MinTapTarget,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.two,
    borderRadius: 4,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
    backgroundColor: colors.surfaceContainer,
  },
}));
