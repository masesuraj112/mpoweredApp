import type { StyleProp, ViewStyle } from 'react-native';

import { NativePicker } from '@/components/ui/NativePicker';

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type DropdownProps<T extends string> = {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  /** What the dropdown is for, for example "Pain location". Spoken with the chosen value. */
  accessibilityLabel: string;
  /** `field` is a full-width box for forms; `chip` is a small pill for filters. Both are the platform's own menu picker. */
  variant?: 'field' | 'chip';
  style?: StyleProp<ViewStyle>;
};

/** A choice from a list, shown as the platform's own menu picker. */
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  accessibilityLabel,
  variant = 'field',
  style,
}: DropdownProps<T>) {
  return (
    <NativePicker
      value={value}
      options={options}
      onChange={onChange}
      accessibilityLabel={accessibilityLabel}
      compact={variant === 'chip'}
      style={style}
    />
  );
}
