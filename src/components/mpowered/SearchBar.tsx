import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { TextInput, TextInputProps } from 'react-native';
import { makeStyles, Spacing, Typography, useThemeColors } from '@/constants/theme';

type SearchBarProps = TextInputProps & {
  placeholder?: string;
};

export function SearchBar({ placeholder = 'Search', style, ...props }: SearchBarProps) {
  const styles = useStyles();
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

const useStyles = makeStyles((colors) => ({
  input: {
    color: colors.text,
    height: 30,
    width: '100%',
    borderRadius: 4,
    paddingHorizontal: Spacing.two,
    textAlign: 'center',
    ...Typography.bodySmall,
    backgroundColor: colors.surfaceContainer,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
  },
}));
