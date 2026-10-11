import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Pass as `inputAccessoryViewID` on a TextInput to show the "Done" bar above the iOS keyboard.
 * Needed for keyboards with no way to close them on iOS: multiline inputs (return adds a new line)
 * and number / phone pads (no return key at all). Ignored on Android, which has its own hide key.
 */
export const KEYBOARD_DONE_ID = 'keyboard-done';

/**
 * Render once on any screen whose inputs use `KEYBOARD_DONE_ID`. It draws nothing in the layout;
 * iOS shows it above the keyboard while one of those inputs is focused.
 */
export function KeyboardDoneBar() {
  if (Platform.OS !== 'ios') return null;

  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ID}>
      <View style={styles.bar}>
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
  );
}

const styles = StyleSheet.create({
  bar: {
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
