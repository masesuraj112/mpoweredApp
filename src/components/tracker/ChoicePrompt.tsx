import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';

type ChoicePromptProps = {
  children: ReactNode;
  /** A grey italic line under the question, for example "Examples: walking, stretching". */
  note?: string;
};

/** The question under a `ChoiceCard` title, with an optional italic note. */
export function ChoicePrompt({ children, note }: ChoicePromptProps) {
  return (
    <View style={styles.prompt}>
      <AppText variant="labelMedium" color="onSurface">
        {children}
      </AppText>
      {note ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.note}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

/** An underlined word inside a prompt, such as the MOST in "Select the MOST relevant statement". */
export function PromptEmphasis({ children }: { children: string }) {
  return (
    <AppText variant="labelMedium" color="onSurface" style={styles.emphasis}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  prompt: {
    gap: Spacing.mid,
  },
  note: {
    fontStyle: 'italic',
  },
  emphasis: {
    textDecorationLine: 'underline',
  },
});
