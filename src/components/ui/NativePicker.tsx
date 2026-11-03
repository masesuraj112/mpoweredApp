import { Host, Picker } from '@expo/ui';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';

import { useThemeColors } from '@/constants/theme';

export type NativePickerOption<T extends string> = { value: T; label: string };

type NativePickerProps<T extends string> = {
  value: T;
  options: NativePickerOption<T>[];
  onChange: (value: T) => void;
  /** What screen readers announce for the picker, for example "Unit of time". */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * The platform's own menu picker (a SwiftUI menu on iOS, a Material dropdown on Android), tinted with
 * the brand. It shows the selected option and opens the system menu of the rest.
 */
export function NativePicker<T extends string>({ value, options, onChange, accessibilityLabel, style }: NativePickerProps<T>) {
  const colors = useThemeColors();
  return (
    // A Material dropdown fills whatever width it is given, so on Android the picker only takes its height
    // from its contents and its width from the layout (it fills its parent). iOS menus size themselves.
    <Host
      matchContents={Platform.OS === 'android' ? { vertical: true } : true}
      seedColor={colors.primary}
      accessibilityLabel={accessibilityLabel}
      style={[Platform.OS === 'android' && { alignSelf: 'stretch' }, style]}>
      <Picker selectedValue={value} onValueChange={(next) => onChange(next as T)} appearance="menu">
        {options.map((option) => (
          <Picker.Item key={option.value} label={option.label} value={option.value} />
        ))}
      </Picker>
    </Host>
  );
}
