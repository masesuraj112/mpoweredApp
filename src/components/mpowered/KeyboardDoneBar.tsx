import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { useId } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * A "Done" bar shown above the iOS keyboard, for keyboards with no way to close them: multiline
 * inputs (return adds a new line) and number / phone pads (no return key at all). Ignored on
 * Android, which has its own hide key.
 *
 * Pass `id` as the input's `inputAccessoryViewID` and render `bar` once, after that input.
 * iOS links each bar to only the first input in the whole app with a matching ID, and earlier
 * screens stay mounted, so every bar gets its own ID rather than sharing one.
 */
export function useKeyboardDoneBar() {
  const id = useId();
  return { id, bar: <KeyboardDoneBar nativeID={id} /> };
}

function KeyboardDoneBar({ nativeID }: { nativeID: string }) {
  if (Platform.OS !== 'ios') return null;

  return (
    <InputAccessoryView nativeID={nativeID}>
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
