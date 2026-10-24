import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors } from '@/constants/theme';

import { fieldStyles } from './fieldStyles';

type TextFieldProps = {
  label: string;
  /** Small text under the label, for example "optional". */
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  /** Inline message shown under the field; the field is drawn in the error style. */
  error?: string | null;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
  onFocus?: () => void;
  onBlur?: () => void;
  /** Decorative icon at the end of the field (for example a phone). */
  trailingIcon?: ReactNode;
};

export function TextField({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  maxLength,
  error,
  autoCapitalize = 'words',
  autoCorrect,
  keyboardType,
  textContentType,
  autoComplete,
  onFocus,
  onBlur,
  trailingIcon,
}: TextFieldProps) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {hint ? <Text style={fieldStyles.optional}>{hint}</Text> : null}
      <View style={[fieldStyles.box, error ? fieldStyles.boxError : null]}>
        <TextInput
          accessibilityLabel={hint ? `${label}, ${hint}` : label}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.textSecondary}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          textContentType={textContentType}
          autoComplete={autoComplete}
          style={[fieldStyles.value, styles.input]}
        />
        {trailingIcon}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={fieldStyles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: 0,
  },
});
