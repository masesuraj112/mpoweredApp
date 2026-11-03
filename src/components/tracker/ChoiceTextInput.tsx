import { StyleSheet, TextInput } from 'react-native';

import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

type ChoiceTextInputProps = {
  /** Spoken name of the box. */
  accessibilityLabel: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  /** Grow to fill the room left in the card, instead of a fixed minimum height. */
  fill?: boolean;
};

/**
 * The multi-line box for a written answer inside a `ChoiceCard`. A multiline box has no return-to-close,
 * so on iOS it brings its own Done bar above the keyboard.
 */
export function ChoiceTextInput({ accessibilityLabel, value, onChangeText, placeholder, fill = false }: ChoiceTextInputProps) {
  const doneBar = useKeyboardDoneBar();

  return (
    <>
      <TextInput
        multiline
        accessibilityLabel={accessibilityLabel}
        inputAccessoryViewID={doneBar.id}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textDisabled}
        textAlignVertical="top"
        style={[styles.input, fill && styles.fill]}
      />
      {doneBar.bar}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    ...Typography.bodyMediumRegular,
    minHeight: 120,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.mid,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: Radius.medium,
    backgroundColor: Colors.light.background,
    color: Colors.light.onSurface,
  },
  fill: {
    flex: 1,
  },
});
