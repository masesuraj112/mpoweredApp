import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { ReactNode } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Pass as `inputAccessoryViewID` on a TextInput inside `AssessmentScreen` to show a "Done" bar
 * above the iOS keyboard. Ignored on Android, which has its own hide key and back gesture.
 */
export const KEYBOARD_DONE_ID = 'assessment-keyboard-done';

/**
 * Page shell for assessment questions: white background, page title, then the question card.
 *
 * Tapping anywhere outside a text box closes the keyboard. Multiline inputs have no return-to-close
 * and the iOS keyboard has no hide key, so without this the keyboard can cover Next / Record with
 * no way to dismiss it. Buttons and inputs inside still receive their own taps first.
 * On iOS, inputs can also opt in to a "Done" bar above the keyboard via `KEYBOARD_DONE_ID`.
 */
export function AssessmentScreen({ title, children }: { title: string; children: ReactNode }) {
  return (
    // Not exposed to screen readers: it's a convenience, not a control.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>{title}</Text>
        {children}
      </View>
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={KEYBOARD_DONE_ID}>
          <View style={styles.doneBar}>
            <Pressable
              onPress={Keyboard.dismiss}
              accessibilityRole="button"
              accessibilityLabel="Done, close keyboard"
              hitSlop={8}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(16),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
  doneBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CAC4D0',
    backgroundColor: '#F7F2FA',
  },
  doneText: {
    color: '#6750A4',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
});
