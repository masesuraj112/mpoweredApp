import { StyleSheet, TextInput } from 'react-native';

import { useKeyboardDoneBar } from '@/components/ui/KeyboardDoneBar';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

type ChoiceTextInputProps = {
  /** Spoken name of the box. */
  accessibilityLabel: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

/**
 * The multi-line box for a written answer inside a `ChoiceCard`. A multiline box has no return-to-close,
 * so on iOS it brings its own Done bar above the keyboard.
 */
export function ChoiceTextInput({ accessibilityLabel, value, onChangeText, placeholder }: ChoiceTextInputProps) {
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
        style={styles.input}
      />
      {doneBar.bar}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    ...Typography.bodyMediumRegular,
    // Fills the room the card has. The small minimum lets it shrink when the keyboard is open.
    flex: 1,
    minHeight: 56,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.mid,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: Radius.medium,
    backgroundColor: Colors.light.background,
    color: Colors.light.onSurface,
  },
});
