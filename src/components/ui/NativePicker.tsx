import { Host, Picker } from '@expo/ui';
import type { StyleProp, ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

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
  return (
    <Host matchContents seedColor={Colors.light.primary} accessibilityLabel={accessibilityLabel} style={style}>
      <Picker selectedValue={value} onValueChange={(next) => onChange(next as T)} appearance="menu">
        {options.map((option) => (
          <Picker.Item key={option.value} label={option.label} value={option.value} />
        ))}
      </Picker>
    </Host>
  );
}
