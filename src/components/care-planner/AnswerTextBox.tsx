import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

type AnswerTextBoxProps = {
  /** The question being answered. Shown as the label and spoken as the field's name. */
  question: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Dictation is on: the border is highlighted. */
  listening: boolean;
  editable?: boolean;
};

export function AnswerTextBox({
  question,
  value,
  onChangeText,
  listening,
  editable = true,
}: AnswerTextBoxProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <TextInput
        accessibilityLabel={`Doctor’s answer to: ${question}`}
        multiline
        textAlignVertical="top"
        editable={editable}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, listening && styles.inputListening]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  question: {
    ...Typography.bodyLarge,
    color: Colors.light.onSurface,
  },
  input: {
    ...Typography.bodyLarge,
    minHeight: 160,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.control - 2,
    backgroundColor: Colors.light.backgroundElement,
    color: Colors.light.onSurface,
  },
  inputListening: {
    borderWidth: 3,
    borderColor: Colors.light.listening,
  },
});
