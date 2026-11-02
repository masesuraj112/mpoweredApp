import { Text, View } from 'react-native';

import { NativePicker } from './NativePicker';
import { fieldStyles } from './fieldStyles';

export type SelectOption = {
  /** Shown to the person and passed to `onChange`. */
  label: string;
};

type SelectProps = {
  label: string;
  /** Small text under the label, for example "optional". */
  hint?: string;
  placeholder: string;
  options: readonly SelectOption[];
  /** The chosen option's label, or null for nothing chosen. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Lets the person go back to nothing chosen. */
  clearable?: boolean;
  clearLabel?: string;
};

// The menu entry for "nothing chosen". A native menu always has one entry selected.
const NONE = '';

/** A labelled field with the platform's own menu of options. */
export function Select({
  label,
  hint,
  placeholder,
  options,
  value,
  onChange,
  clearable = false,
  clearLabel = 'Clear selection',
}: SelectProps) {
  // Before anything is chosen the menu shows the placeholder; once chosen, a clearable field offers
  // the clear entry instead, so the person can go back to nothing.
  const showNone = value === null || clearable;
  const noneLabel = value === null ? placeholder : clearLabel;
  const choices = [
    ...(showNone ? [{ value: NONE, label: noneLabel }] : []),
    ...options.map((option) => ({ value: option.label, label: option.label })),
  ];

  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {hint ? <Text style={fieldStyles.optional}>{hint}</Text> : null}
      <NativePicker
        value={value ?? NONE}
        options={choices}
        onChange={(next) => onChange(next === NONE ? null : next)}
        accessibilityLabel={`${label}${hint ? `, ${hint}` : ''}`}
      />
    </View>
  );
}
