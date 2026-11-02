import { ReactNode } from 'react';
import { Keyboard, Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentColumn, makeStyles, Spacing, Typography } from '@/constants/theme';
/**
 * Page shell for assessment questions: white background, page title, then the question card.
 *
 * Tapping anywhere outside a text box closes the keyboard. Multiline inputs have no return-to-close
 * and the iOS keyboard has no hide key, so without this the keyboard can cover Next / Record with
 * no way to dismiss it. Buttons and inputs inside still receive their own taps first.
 * On iOS, inputs can also add a "Done" bar above the keyboard with `useKeyboardDoneBar`.
 * The page stays above the tab bar and scrolls when the question is longer than the screen.
 */
export function AssessmentScreen({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    // Not exposed to screen readers: it's a convenience, not a control.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>{title}</Text>
          {children}
        </ScrollView>
      </SafeAreaView>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    ...ContentColumn,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  pageTitle: {
    ...Typography.display,
    color: colors.text,
    marginLeft: Spacing.two,
    marginBottom: Spacing.three,
  },
}));
