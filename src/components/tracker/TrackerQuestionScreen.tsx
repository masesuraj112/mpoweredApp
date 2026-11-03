import type { ReactNode } from 'react';
import { Keyboard, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTrackerTitle } from '@/components/ui/nativeHeader';
import { ContentColumn, makeStyles, Spacing } from '@/constants/theme';

type TrackerQuestionScreenProps = {
  /** The tracker's name, for example "My Movement". It is the native header's title. */
  title: string;
  children: ReactNode;
};

/**
 * Page shell for the tracker question screens: the tracker's name in the native header, then the question
 * card. The page stays above the tab bar and the keyboard, and scrolls when the question is longer than the
 * screen.
 *
 * Tapping anywhere outside a text box closes the keyboard. Multiline inputs have no return-to-close
 * and the iOS keyboard has no hide key, so without this the keyboard can cover Next / Record with
 * no way to dismiss it. Buttons and inputs inside still receive their own taps first.
 * On iOS, inputs can also add a "Done" bar above the keyboard with `useKeyboardDoneBar`.
 */
export function TrackerQuestionScreen({ title, children }: TrackerQuestionScreenProps) {
  const styles = useStyles();
  useTrackerTitle(title);
  return (
    // Not exposed to screen readers: it's a convenience, not a control.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          // Keeps the focused text box above the keyboard (iOS; Android resizes the window).
          automaticallyAdjustKeyboardInsets
          contentInsetAdjustmentBehavior="automatic">
          {children}
        </ScrollView>
      </SafeAreaView>
    </Pressable>
  );
}

/** For the screens that build their own shell: puts the tracker's name in the native header. */
export function TrackerPageTitle({ children }: { children: string }) {
  useTrackerTitle(children);
  return null;
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
    paddingBottom: Spacing.four,
  },
}));
