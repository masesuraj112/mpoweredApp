import { TextInput } from 'react-native';

import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { useThemeColors } from '@/constants/theme';

import { useInputStyles } from './inputStyles';

type ChoiceTextInputProps = {
  /** Spoken name of the box. */
  accessibilityLabel: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

/**
 * The multi-line box for a written answer inside a `ChoiceCard`, in the same field as the other text
 * inputs. A multiline box has no return-to-close, so on iOS it brings its own Done bar above the keyboard.
 */
export function ChoiceTextInput({ accessibilityLabel, value, onChangeText, placeholder }: ChoiceTextInputProps) {
  const inputStyles = useInputStyles();
  const colors = useThemeColors();
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
        placeholderTextColor={colors.textSubtle}
        textAlignVertical="top"
        style={[inputStyles.input, inputStyles.multiline]}
      />
      {doneBar.bar}
    </>
  );
}
