import { TextInput, type TextInputProps } from 'react-native';

import { makeStyles, MinTapTarget, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';

type AuthInputProps = TextInputProps & {
  /** Spoken name of the box. Required, because these boxes have no visible label. */
  accessibilityLabel: string;
};

/** A filled text box for a sign-in answer (name, year of birth, phone number, conditions), like the app's other fields. */
export function AuthInput({ style, ...props }: AuthInputProps) {
  const styles = useStyles();
  const colors = useThemeColors();
  return (
    <TextInput
      placeholderTextColor={colors.textSubtle}
      {...props}
      style={[styles.input, props.multiline && styles.multiline, style]}
    />
  );
}

const useStyles = makeStyles((colors) => ({
  input: {
    ...Typography.bodyLarge,
    minHeight: MinTapTarget + Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.mid,
    borderRadius: Radius.control,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
    backgroundColor: colors.surfaceContainer,
    color: colors.text,
  },
  multiline: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
}));
