import { TextInput, type TextInputProps } from 'react-native';

import { useKeyboardDoneBar } from '@/components/ui/KeyboardDoneBar';
import { useThemeColors } from '@/constants/theme';

import { useInputStyles } from '@/components/tracker/inputStyles';

type SearchBarProps = TextInputProps & {
  placeholder?: string;
};

/** A search box for filtering a list of options, in the same field as the other text inputs. */
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
