import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { makeStyles, Spacing, Typography } from '@/constants/theme';

type ChoicePromptProps = {
  children: ReactNode;
  /** Secondary line(s) under the question, for example "Examples: walking, stretching". */
  note?: string | readonly string[];
};

/** The question under a `ChoiceCard` title, with an optional note. Every question reads the same. */
export function ChoicePrompt({ children, note }: ChoicePromptProps) {
  const styles = useStyles();
  const notes = note === undefined ? [] : typeof note === 'string' ? [note] : note;

  return (
    <View style={styles.prompt}>
      <QuestionPrompt>{children}</QuestionPrompt>
      {notes.map((line) => (
        <QuestionHint key={line}>{line}</QuestionHint>
      ))}
    </View>
  );
}

/** The question itself. Nest a `<Text>` with only `textDecorationLine` to underline a word. */
export function QuestionPrompt({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.promptText}>{children}</Text>;
}

/** A secondary line under the question: examples, "scroll for more", where the options come from. */
export function QuestionHint({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.hintText}>{children}</Text>;
}

/** An underlined word inside a prompt, such as the MOST in "Select the MOST relevant statement". */
export function PromptEmphasis({ children }: { children: string }) {
  const styles = useStyles();
  return <Text style={[styles.promptText, styles.emphasis]}>{children}</Text>;
}

const useStyles = makeStyles((colors) => ({
  prompt: {
    gap: Spacing.one,
  },
  promptText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  hintText: {
    ...Typography.bodySmall,
    color: colors.textSecondary,
  },
  emphasis: {
    textDecorationLine: 'underline',
  },
}));
