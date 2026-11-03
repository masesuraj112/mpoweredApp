import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useKeyboardDoneBar } from '@/components/ui/KeyboardDoneBar';
import { Colors, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

type SearchBarProps = TextInputProps & {
  placeholder?: string;
};

/** A centred search box for filtering a list of options. */
export function SearchBar({ placeholder = 'Search', style, ...props }: SearchBarProps) {
  const doneBar = useKeyboardDoneBar();

  return (
    <>
      <TextInput
        {...props}
        inputAccessoryViewID={doneBar.id}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textDisabled}
        style={[styles.input, style]}
        accessibilityLabel={props.accessibilityLabel ?? placeholder}
      />
      {doneBar.bar}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    ...Typography.bodyMedium,
    width: '100%',
    minHeight: MinTapTarget,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.medium,
    textAlign: 'center',
    color: Colors.light.text,
  },
});
