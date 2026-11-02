import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { TextInput, TextInputProps } from 'react-native';
import { makeStyles, useThemeColors } from '@/constants/theme';

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
    height: scaleHeight(30),
    width: '100%',
    borderWidth: 2,
    borderColor: colors.outline,
    borderRadius: scaleWidth(4),
    paddingHorizontal: scaleWidth(7),
    textAlign: 'center',
    fontSize: scaleFont(14),
  },
}));
