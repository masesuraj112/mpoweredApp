import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Colors, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

type AuthInputProps = TextInputProps & {
  /** Spoken name of the box. Required, because these boxes have no visible label. */
  accessibilityLabel: string;
};

/** A filled text box for a sign-in answer (name, year of birth, phone number, conditions). */
export function AuthInput({ style, ...props }: AuthInputProps) {
  return (
    <TextInput
      placeholderTextColor={Colors.light.textSecondary}
      {...props}
      style={[styles.input, props.multiline && styles.multiline, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...Typography.bodyLarge,
    minHeight: MinTapTarget + Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.mid,
    borderRadius: Radius.medium,
    backgroundColor: Colors.light.surfaceContainer,
    color: Colors.light.onSurface,
  },
  multiline: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
});
