import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Colors } from '@/constants/theme';

type SearchBarProps = TextInputProps & {
  placeholder?: string;
};

export function SearchBar({ placeholder = 'Search', style, ...props }: SearchBarProps) {
  const doneBar = useKeyboardDoneBar();

  return (
    <>
      <TextInput
        {...props}
        inputAccessoryViewID={doneBar.id}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textSubtle}
        style={[styles.input, style]}
        accessibilityLabel={props.accessibilityLabel ?? placeholder}
      />
      {doneBar.bar}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    height: scaleHeight(30),
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.light.outline,
    borderRadius: scaleWidth(4),
    paddingHorizontal: scaleWidth(7),
    textAlign: 'center',
    fontSize: scaleFont(14),
  },
});
