import type { ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';

/** Room for the transparent header that shows the back arrow, so the content starts below it. */
export const AUTH_HEADER_CLEARANCE = 56;

type AuthScreenProps = {
  children: ReactNode;
  /** The screen has the back arrow over it (most do). Leaves room for it at the top. */
  backArrow?: boolean;
  /** Centre the content vertically when it is shorter than the screen. */
  center?: boolean;
  /** Scroll the content (default). Pass `false` when the content manages its own scrolling. */
  scroll?: boolean;
  /** Pinned under the content, above the system navigation buttons. */
  footer?: ReactNode;
};

/**
 * The page layout of the sign-up and sign-in screens: safe area, padding, scrolling, room for the back
 * arrow, and the keyboard. Tapping outside a text box closes the keyboard (the iOS keyboard has no key
 * for it on number and phone pads).
 */
export function AuthScreen({ children, backArrow = true, center = false, scroll = true, footer }: AuthScreenProps) {
  return (
    // Not exposed to screen readers: it's a convenience, not a control.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.fill}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Screen
          edges={['top', 'bottom']}
          scroll={scroll}
          keyboardShouldPersistTaps="handled"
          footer={footer ? <View style={styles.footer}>{footer}</View> : undefined}
        >
          {backArrow ? <View style={styles.headerClearance} /> : null}
          <View style={[styles.body, center && styles.center]}>{children}</View>
        </Screen>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  headerClearance: {
    height: AUTH_HEADER_CLEARANCE,
  },
  body: {
    flexGrow: 1,
    gap: Spacing.three,
  },
  center: {
    justifyContent: 'center',
  },
  footer: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
});
