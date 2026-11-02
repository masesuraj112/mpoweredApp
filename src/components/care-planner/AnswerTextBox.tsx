import { Text, TextInput, View } from 'react-native';

import { Radius, Spacing, Typography, makeStyles } from '@/constants/theme';

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
  const styles = useStyles();
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

const useStyles = makeStyles((colors) => ({
  container: {
    gap: Spacing.two,
  },
  question: {
    ...Typography.bodyLarge,
    color: colors.onSurface,
  },
  input: {
    ...Typography.bodyLarge,
    minHeight: 160,
    padding: Spacing.three,
    borderRadius: Radius.control - 2,
    backgroundColor: colors.surfaceContainer,
    color: colors.onSurface,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
  },
  inputListening: {
    borderWidth: 3,
    borderColor: colors.listening,
  },
}));
