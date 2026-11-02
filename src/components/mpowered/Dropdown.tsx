import type { StyleProp, ViewStyle } from 'react-native';

import { NativePicker } from '@/components/ui/NativePicker';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** A choice from a list, shown as the platform's own menu picker. */
export function Dropdown<T extends string>({ value, options, onChange, accessibilityLabel, style }: DropdownProps<T>) {
  return (
    <NativePicker value={value} options={options} onChange={onChange} accessibilityLabel={accessibilityLabel} style={style} />
  );
}
