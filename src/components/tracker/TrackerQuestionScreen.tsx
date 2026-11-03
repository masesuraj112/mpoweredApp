import type { ReactNode } from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';

type TrackerQuestionScreenProps = {
  /** The tracker's name, for example "My Movement". */
  title: string;
  children: ReactNode;
};

/**
 * Page shell for the tracker question screens: the page title, then the question card. It sits under the
 * tracker's navigation header, so it adds no safe-area padding at the top.
 *
 * Tapping anywhere outside a text box closes the keyboard. Multiline inputs have no return-to-close
 * and the iOS keyboard has no hide key, so without this the keyboard can cover Next / Record with
 * no way to dismiss it. Buttons and inputs inside still receive their own taps first.
 * On iOS, inputs can also add a "Done" bar above the keyboard with `useKeyboardDoneBar`.
 */
export function TrackerQuestionScreen({ title, children }: TrackerQuestionScreenProps) {
  return (
    // Not exposed to screen readers: it's a convenience, not a control.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.dismissArea}>
      <Screen scroll={false} edges={[]}>
        <AppText accessibilityRole="header" variant="headlineSmall" style={styles.title}>
          {title}
        </AppText>
        {children}
      </Screen>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dismissArea: {
    flex: 1,
  },
  title: {
    marginLeft: Spacing.two,
    marginBottom: Spacing.three,
  },
});
