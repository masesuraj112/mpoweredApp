import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { TextInput, TextInputProps } from 'react-native';
import { useThemeColors } from '@/constants/theme';

import { useInputStyles } from './inputStyles';

type SearchBarProps = TextInputProps & {
  placeholder?: string;
};

export function SearchBar({ placeholder = 'Search', style, ...props }: SearchBarProps) {
  const styles = useInputStyles();
  const colors = useThemeColors();
  const doneBar = useKeyboardDoneBar();

  return (
    <>
      <TextInput
        {...props}
        inputAccessoryViewID={doneBar.id}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        style={[styles.input, style]}
        accessibilityLabel={props.accessibilityLabel ?? placeholder}
      />
      {doneBar.bar}
    </>
  );
}
