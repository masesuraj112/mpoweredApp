import type { ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContentColumn, Spacing, makeStyles } from '@/constants/theme';

type AuthScreenProps = {
  /** The step's content, centred in a column that scrolls when it is taller than the screen. */
  children: ReactNode;
  /** The step's main action, kept below the content and above the keyboard and system buttons. */
  footer?: ReactNode;
};

/**
 * The layout shared by the sign-in and sign-up steps. It leaves room for the transparent header's back
 * arrow, keeps clear of the status bar, the system navigation buttons and the keyboard, and closes the
 * keyboard when the person taps outside a text box.
 */
export function AuthScreen({ children, footer }: AuthScreenProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  return (
    // Not exposed to screen readers: closing the keyboard is a convenience, not a control.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      {/* The keyboard view sets its own bottom padding, so the system edges go on a view inside it. */}
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    ...ContentColumn,
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    // Room for the header's back arrow, which floats over the top of the screen.
    paddingTop: Spacing.six,
    paddingBottom: Spacing.four,
  },
  footer: {
    ...ContentColumn,
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
}));
