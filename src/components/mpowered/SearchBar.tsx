import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

type SearchBarProps = TextInputProps & {
  placeholder?: string;
};

export function SearchBar({ placeholder = 'Search', style, ...props }: SearchBarProps) {
  return (
    <TextInput
      {...props}
      placeholder={placeholder}
      placeholderTextColor="rgba(0, 0, 0, 0.19)"
      style={[styles.input, style]}
      accessibilityLabel={props.accessibilityLabel ?? placeholder}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: scaleHeight(30),
    width: '100%',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: scaleWidth(4),
    paddingHorizontal: scaleWidth(7),
    textAlign: 'center',
    fontSize: scaleFont(14),
  },
});
